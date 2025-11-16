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
    const [suggestions, setSuggestions] = useState<{ _id: string; text: string }[]>([]);
    const [ratings, setRatings] = useState<{ [key: number]: { value: number | null; color: string | null } }>({});
    const [showScoreFor, setShowScoreFor] = useState<{ index: number | null; color: string | null }>({ index: null, color: null });
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const prompt = text ?? input; // allow sending from suggestion
        if (!prompt.trim() || streaming) return;

        // Clear suggestions before sending next
        setSuggestions([]);

        const userMessage: Message = { role: "user", content: prompt };
        setMessages((prev) => [...prev, userMessage]);

        if (!text) setInput(""); // clear input only if typed, not suggestion
        setStreaming(true);

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

        let assistantText = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            let chunk = decoder.decode(value, { stream: true });
            chunk = chunk.replace(/^data:\s*/gm, "");
            chunk = chunk.replace(/\[DONE\]/g, "");
            if (!chunk) continue;

            assistantText += chunk;

            assistantMsg = { role: "assistant", content: assistantText };

            setMessages((prev) => {
                const arr = [...prev];
                arr[arr.length - 1] = assistantMsg;
                return arr;
            });
        }

        // Generate 3 mock suggestions for follow-up
        setSuggestions([
            { _id: "67344abc1", text: "Could you explain that in a bit more detail so I can better understand?" },
            { _id: "67344abc2", text: "Can you provide a real-life example to clarify your point?" },
            { _id: "67344abc3", text: "What specific part would you like me to focus on or break down further?" }
        ]);


        setStreaming(false);
    };


    const rateSuggestion = async (index: number, rating: number) => {
        const suggestionId = suggestions[index]._id;

        // store color from showScoreFor before clearing it
        const ratingColor = showScoreFor.color === "green" ? "green" : "red";

        const previousRating = ratings[index];

        // Optimistic UI + store color
        setRatings((prev) => ({ ...prev, [index]: { value: rating, color: ratingColor } }));
        setShowScoreFor({ index: null, color: null });

        try {
            const res = await fetch(`/api/suggestions/${suggestionId}/rank`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rank: rating }),
            });

            if (!res.ok) throw new Error("Failed to save rating");

        } catch (err) {
            console.error(err);

            // rollback
            setRatings((prev) => ({ ...prev, [index]: previousRating }));
            alert("Failed to submit rating.");
        }
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

                {/* FOLLOW-UP SUGGESTIONS */}
                {suggestions.length > 0 && (
                    <div className="flex flex-col gap-1 mt-4">
                        {suggestions.map((sugg, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between gap-4 bg-white border rounded-xl p-3 shadow-sm"
                            >
                                {/* Suggestion Button */}
                                <button
                                    onClick={() => sendMessage(sugg.text)}
                                    className="flex-1 bg-gray-100 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-black font-medium text-sm text-left"
                                >
                                    {sugg.text}
                                </button>

                                {/* Rating Section */}
                                {ratings[i] ? (
                                    <div
                                        className={`text-sm font-semibold whitespace-nowrap ${ratings[i].color === "green" ? "text-green-600" : "text-red-600"}`}
                                    >
                                        Rated: {ratings[i].value}
                                    </div>
                                ) : (

                                    <div className="flex items-center gap-3 whitespace-nowrap">

                                        <button
                                            onClick={() => setShowScoreFor({ index: i, color: "green" })}
                                            className="text-green-600 hover:text-green-800 text-xl"
                                        >
                                            👍
                                        </button>

                                        <button
                                            onClick={() => setShowScoreFor({ index: i, color: "red" })}
                                            className="text-red-600 hover:text-red-800 text-xl"
                                        >
                                            👎
                                        </button>

                                        {/* Score buttons 1–3 appear inline */}
                                        {showScoreFor.index === i && (
                                            <div className="flex gap-2">
                                                {[1, 2, 3].map((score) => (
                                                    <button
                                                        key={score}
                                                        onClick={() => rateSuggestion(i, score)}
                                                        className={`px-2 py-1 ${showScoreFor.color === "green" ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"} rounded-lg transition text-xs`}
                                                    >
                                                        {score}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}


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
                    disabled={streaming}
                />
                <button
                    onClick={() => sendMessage()}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white transition ${streaming ? "bg-gray-400 cursor-not-allowed" : "bg-[#0060d1] hover:bg-[#004a9e]"
                        }`}
                    disabled={streaming}
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
