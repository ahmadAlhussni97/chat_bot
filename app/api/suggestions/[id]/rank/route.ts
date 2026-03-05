import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongo";
import { Suggestion } from "@/models/Suggestion";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectMongo();
  const { rank } = await req.json();
  const { id } = await params;

  await Suggestion.findByIdAndUpdate(id, { rank, clicked: true, clickedAt: Date.now() });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
