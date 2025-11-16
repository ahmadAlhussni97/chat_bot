import { connectMongo } from "@/lib/mongo";
import { Session } from "@/models/Session";
import { Message } from "@/models/Message";

export async function GET(req: Request) {
  await connectMongo();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  // Fetch all sessions for this user
  const sessions = await Session.find({ userId }).lean();

  // Create stats for each session
  const sessionStats = await Promise.all(
    sessions.map(async (session) => {
      const messages = await Message.find({ sessionId: session._id }).lean();

      return {
        _id: session._id,
        model: session.model,
        startedAt: session.startedAt,
        messageCount: messages.length,
        assistantMessages: messages.filter((m) => m.role === "assistant").length,
        lastMessageAt: messages.length ? messages[messages.length - 1].timings.completedAt : null,
      };
    })
  );

  return Response.json(sessionStats);
}
