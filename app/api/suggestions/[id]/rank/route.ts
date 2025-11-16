import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongo";
import { Suggestion } from "@/models/Suggestion";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();
  const { rank } = await req.json();

  await Suggestion.findByIdAndUpdate(params.id, { rank, clicked: true, clickedAt: Date.now() });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
