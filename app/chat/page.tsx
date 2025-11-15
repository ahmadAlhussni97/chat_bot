"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);

        setInput("");

        // Simulate AI response for now
        const assistantMessage: Message = {
            role: "assistant",
            content: "This is a sample AI response. I can connect to API next.",
        };

        setTimeout(() => {
            setMessages((prev) => [...prev, assistantMessage]);
        }, 600);
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
                        className={`p-3 rounded-xl text-[18px] w-fit max-w-[80%] break-words ${msg.role === "user"
                            ? "bg-gray-100 text-black ml-auto"
                            : "bg-[#0060d1] text-white"
                            }`}
                    >
                        {msg.content}
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
                />

                {/* SEND ARROW ICON */}
                <button
                    onClick={sendMessage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#0060d1] p-2 rounded-lg text-white hover:bg-[#004a9e] transition"
                >
                    {/* Heroicons paper-airplane */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-7 h-7"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12L19 6L15 18L11.5 13L5 12Z"
                        />
                    </svg>

                </button>
            </div>


        </div>
    );
}
