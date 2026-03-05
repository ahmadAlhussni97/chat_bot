import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongo";
import { Message } from "@/models/Message";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {

    await connectMongo();

    const body = await req.json();

    const { userId, sessionId, prompt } = body;

    const requestStart = Date.now();

    const wordLenght = prompt.trim().split(/\s+/).filter(Boolean).length;
    const tokenEst = Math.ceil(wordLenght * 1.33);

    await Message.create({
        sessionId,
        userId,
        role: "user",
        text: prompt,
        wordCount: wordLenght,
        tokenEst: tokenEst,
        timings: { requestStart },
    });

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

            // Keep a local variable for accumulated text
            let fullText = "";
                
            // small delay to simulate streaming
            await new Promise((r) => setTimeout(r, 300));
            
            for (const token of tokens) {
                fullText += token + " "; // accumulate

                // Update MongoDB with full text, wordCount, and tokenEst
                await Message.findByIdAndUpdate(assistantMessage._id, {
                    $set: { text: fullText },
                    $inc: { wordCount: 1, tokenEst: Math.ceil(1.33) },
                });

                // Stream this token to the client
                controller.enqueue(new TextEncoder().encode(`data: ${token}\n\n`));

                // small delay to simulate streaming
                await new Promise((r) => setTimeout(r, 300));
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
