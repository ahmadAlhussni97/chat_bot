import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongo";
import { Message } from "@/models/Message";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await connectMongo();
  const { userId, sessionId, prompt } = await req.json();

  const requestStart = Date.now();

  // Create empty assistant message in DB
  const assistantMessage = await Message.create({
    sessionId,
    userId,
    role: "assistant",
    text: "",
    wordCount: 0,
    tokenEst: 0,
    timings: { requestStart },
  });

  const stream = new ReadableStream({
    async start(controller) {
      const tokens = "This is a mock streaming response from assistant".split(" ");
      let i = 0;

      for (const token of tokens) {
        // Update message in DB
        await Message.findByIdAndUpdate(assistantMessage._id, {
          $inc: { wordCount: 1, tokenEst: 1 },
          $push: { text: token + " " },
        });

        controller.enqueue(new TextEncoder().encode(`data: ${token}\n\n`));
        await new Promise((r) => setTimeout(r, 200));
        i++;
      }

      // Finalize timings
      await Message.findByIdAndUpdate(assistantMessage._id, {
        $set: { "timings.completedAt": Date.now() },
      });

      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
