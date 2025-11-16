import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongo";
import { Message } from "@/models/Message";
import { Suggestion } from "@/models/Suggestion";

export async function GET(req: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const messages = await Message.find({ userId });
  const suggestions = await Suggestion.find({});

  const totalMessages = messages.length;
  const totalSuggestions = suggestions.length;

  return new Response(JSON.stringify({ totalMessages, totalSuggestions }));
}
