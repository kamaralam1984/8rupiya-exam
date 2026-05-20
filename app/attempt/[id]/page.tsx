import { redirect } from "next/navigation";

export default async function AttemptIndex({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/attempt/${id}/result`);
}
