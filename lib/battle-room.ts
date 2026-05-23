import { redis } from "./redis";
import { db } from "./db";

export type BattleQuestion = {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  topic?: string;
};

export type Player = {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  answered: number;
  joinedAt: number;
};

export type BattleRoom = {
  id: string;
  examSlug: string;
  questions: BattleQuestion[];
  players: Record<string, Player>;
  startedAt: number;
  status: "waiting" | "active" | "ended";
};

const ROOM_TTL = 60 * 30; // 30 min
const QUEUE_KEY = (examSlug: string) => `battle:queue:${examSlug}`;
const ROOM_KEY = (roomId: string) => `battle:room:${roomId}`;
const USER_ROOM_KEY = (userId: string) => `battle:user:${userId}`;

const AVATARS = ["🦊", "🐯", "🐼", "🐺", "🦁", "🐲", "🦅", "🐧", "🐮", "🐸"];

export async function fetchRoom(roomId: string): Promise<BattleRoom | null> {
  const raw = await redis.get(ROOM_KEY(roomId));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function saveRoom(room: BattleRoom) {
  await redis.set(ROOM_KEY(room.id), JSON.stringify(room), "EX", ROOM_TTL);
}

export async function getUserRoom(userId: string): Promise<string | null> {
  return await redis.get(USER_ROOM_KEY(userId));
}

async function pickQuestions(examSlug: string): Promise<BattleQuestion[]> {
  let pool = await db.question.findMany({
    where: { approved: true, examSlug },
    select: { id: true, stem: true, options: true, correctIndex: true, topic: true },
    take: 60,
    orderBy: { createdAt: "desc" },
  });
  if (pool.length < 10) {
    pool = await db.question.findMany({
      where: { approved: true },
      select: { id: true, stem: true, options: true, correctIndex: true, topic: true },
      take: 60,
      orderBy: { createdAt: "desc" },
    });
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
  return shuffled.map((q) => ({
    id: q.id,
    stem: q.stem,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
    correctIndex: q.correctIndex,
    topic: q.topic ?? undefined,
  }));
}

/**
 * Try to match the user with another player in the queue. If found, creates a
 * room with shared questions and returns the room. Otherwise enqueues the user
 * and returns null (caller should poll /api/battle/queue?examSlug=… every 1-2s).
 */
export async function tryMatch(args: {
  userId: string;
  name: string;
  examSlug: string;
}): Promise<{ room: BattleRoom | null; queued: boolean }> {
  const { userId, name, examSlug } = args;

  // Already in a room? Return it.
  const existing = await getUserRoom(userId);
  if (existing) {
    const r = await fetchRoom(existing);
    if (r) return { room: r, queued: false };
    await redis.del(USER_ROOM_KEY(userId));
  }

  // Look for someone else in the queue.
  const qKey = QUEUE_KEY(examSlug);
  const other = await redis.lpop(qKey);
  if (!other || other === userId) {
    if (other === userId) {
      // shouldn't happen, but if we popped ourselves we drop it.
    }
    // Enqueue self.
    await redis.rpush(qKey, userId);
    await redis.expire(qKey, 120);
    return { room: null, queued: true };
  }

  // We have a partner — create room.
  const otherUser = await db.user.findUnique({
    where: { id: other },
    select: { id: true, name: true, email: true },
  });
  if (!otherUser) {
    // Stale entry, enqueue self instead
    await redis.rpush(qKey, userId);
    return { room: null, queued: true };
  }

  const questions = await pickQuestions(examSlug);
  if (questions.length < 5) {
    // Not enough questions — put both back and fail
    await redis.rpush(qKey, other);
    return { room: null, queued: false };
  }

  const roomId = `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const now = Date.now();
  const room: BattleRoom = {
    id: roomId,
    examSlug,
    questions,
    players: {
      [userId]: {
        userId,
        name: name || "You",
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        score: 0,
        answered: 0,
        joinedAt: now,
      },
      [other]: {
        userId: other,
        name: otherUser.name ?? "Player",
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        score: 0,
        answered: 0,
        joinedAt: now,
      },
    },
    startedAt: now,
    status: "active",
  };

  await saveRoom(room);
  await redis.set(USER_ROOM_KEY(userId), roomId, "EX", ROOM_TTL);
  await redis.set(USER_ROOM_KEY(other), roomId, "EX", ROOM_TTL);
  return { room, queued: false };
}

export async function leaveQueue(userId: string, examSlug: string) {
  await redis.lrem(QUEUE_KEY(examSlug), 0, userId);
}

export async function leaveRoom(userId: string) {
  const rid = await getUserRoom(userId);
  if (!rid) return;
  await redis.del(USER_ROOM_KEY(userId));
  const room = await fetchRoom(rid);
  if (!room) return;
  if (room.players[userId]) {
    delete room.players[userId];
    if (Object.keys(room.players).length === 0) {
      await redis.del(ROOM_KEY(rid));
    } else {
      await saveRoom(room);
    }
  }
}

/** Strip correctIndex before returning to client unless allowed (e.g. ended). */
export function publicView(room: BattleRoom, includeAnswers = false): BattleRoom {
  if (includeAnswers) return room;
  return {
    ...room,
    questions: room.questions.map((q) => ({ ...q, correctIndex: -1 })),
  };
}
