"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

const MOCK_USER_ID = "69199e826038bf3e62818830";
const MOCK_SESSION_ID = "69199e826038bf3e62818834";

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false); 
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || streaming) return; // prevent sending while streaming,if input is empty

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);

        const prompt = input;
        setInput("");
        setStreaming(true); // mark streaming as active

        // Create placeholder assistant message
        let assistantMsg: Message = { role: "assistant", content: "" };
        setMessages((prev) => [...prev, assistantMsg]);

        const response = await fetch("/api/chat/stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: MOCK_USER_ID,
                sessionId: MOCK_SESSION_ID,
                prompt,
            }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            let text = decoder.decode(value, { stream: true });
            text = text.replace(/^data:\s*/gm, ""); // remove "data: "
            text = text.replace(/\[DONE\]/g, "");   // remove "[DONE]"
            if (!text) continue;

            assistantMsg = {
                role: "assistant",
                content: assistantMsg.content + text,
            };

            setMessages((prev) => {
                const arr = [...prev];
                arr[arr.length - 1] = assistantMsg;
                return arr;
            });
        }

        setStreaming(false); // mark streaming as finished
    };

    return (
        <div className="flex flex-col h-screen max-w-6xl p-2 mx-auto">
            <div className="p-4 rounded-lg bg-[#004a9e] text-white mb-4">
                <h1 className="text-2xl font-bold">Chat App</h1>
            </div>

            {/* MESSAGE BOX */}
            <div className="flex-1 overflow-y-auto p-4 rounded-xl space-y-3">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex items-start gap-2 mb-2 ${msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        {msg.role !== "user" && (
                            <img
                                src="/chatbot.png"
                                alt="assistant"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        )}
                        <div
                            className={`p-3 rounded-xl text-[18px] w-fit max-w-[80%] break-words ${msg.role === "user" ? "bg-gray-100 text-black" : "bg-[#0060d1] text-white"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* INPUT BOX */}
            <div className="relative mt-4 text-[18px]">
                <input
                    className="w-full p-3 pr-16 border rounded-xl text-black"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                    placeholder="Type your message..."
                    disabled={streaming} // disable input while streaming
                />
                <button
                    onClick={sendMessage}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white transition ${streaming ? "bg-gray-400 cursor-not-allowed" : "bg-[#0060d1] hover:bg-[#004a9e]"
                        }`}
                    disabled={streaming} // disable button while streaming
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-7 h-7"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12L19 6L15 18L11.5 13L5 12Z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
