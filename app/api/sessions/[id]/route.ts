import { connectMongo } from "@/lib/mongo";
import { Message } from "@/models/Message";
import { Suggestion } from "@/models/Suggestion";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectMongo();

  const sessionId = params.id;

  // Fetch session's messages
  const messages = await Message.find({ sessionId })
    .sort({ "timings.requestStart": 1 })
    .lean();

  // Fetch suggestions related to this session
  const suggestions = await Suggestion.find({ sessionId }).lean();

  // Group suggestions under the matching messageId
  const suggestionsMap = suggestions.reduce((map, s) => {
    if (!map[s.messageId]) map[s.messageId] = [];
    map[s.messageId].push(s);
    return map;
  }, {} as Record<string, any[]>);

  const result = messages.map((msg) => ({
    ...msg,
    suggestions: suggestionsMap[msg._id] || [],
  }));

  return Response.json(result);
}
