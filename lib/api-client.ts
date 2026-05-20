export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message?: string; issues?: unknown } };

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    credentials: "include",
  });
  let body: any;
  try {
    body = await res.json();
  } catch {
    return { ok: false, error: { code: "PARSE", message: `HTTP ${res.status}` } };
  }
  return body as ApiResult<T>;
}

export function unwrap<T>(r: ApiResult<T>): T {
  if (!r.ok) throw new ApiError(r.error.code, r.error.message);
  return r.data;
}

export class ApiError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
  }
}
