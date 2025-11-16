import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongo";
import { Message } from "@/models/Message";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {

    await connectMongo();

    const body = await req.json();
    console.log(body);
    const { userId, sessionId, prompt } = body;

    const requestStart = Date.now();

    const assistantMessage = await Message.create({
        sessionId,
        userId,
        role: "assistant",
        text: prompt,
        wordCount: 0,
        tokenEst: 0,
        timings: { requestStart },
    });

    const stream = new ReadableStream({
        async start(controller) {
            const tokens = "This is a mock streaming response from assistant".split(" ");

            for (const token of tokens) {
                await Message.findByIdAndUpdate(assistantMessage._id, {
                    $inc: { wordCount: 1, tokenEst: 1 },
                    $push: { $text: token + " " },
                });

                controller.enqueue(new TextEncoder().encode(`data: ${token}\n\n`));
                await new Promise((r) => setTimeout(r, 200));
            }

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
