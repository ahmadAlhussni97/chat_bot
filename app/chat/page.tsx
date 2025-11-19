"use client";

import { useState, useRef, useEffect } from "react";
import { addToQueue, getQueue, removeFromQueue } from "@/lib/offlineQueue";

type Message = {
    role: "user" | "assistant";
    content: string;
};

const MOCK_SESSION_ID = "69199e826038bf3e62818834";
const initialSuggestions = [
    "That’s interesting! Can you share more about what you mean?",
    "Walk me through your thought—what’s the tricky part?",
    "Could you give me more context so I can help better?"
];

const user_1 = "69199e826038bf3e62818830";
const user_2 = "6919dae66079e4b588a99ffc";

export default function ChatPage() {

    const [input, setInput] = useState("");
    const [ttft, setTtft] = useState<number | null>(null);
    const [streaming, setStreaming] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState<{ [key: string]: boolean }>({ [user_1]: false, [user_2]: false });
    const [suggestions, setSuggestions] = useState(
        initialSuggestions.map((text, i) => ({
            _id: String(i + 1),
            text,
        }))
    );
    const [ratings, setRatings] = useState<{ [key: string]: { value: number | null; color: string | null } }>({});
    const [showScoreFor, setShowScoreFor] = useState<{ index: number | null; color: string | null }>({ index: null, color: null });
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(true);
    const [messagesMap, setMessagesMap] = useState<{ [userId: string]: Message[] }>({
        [user_1]: [],
        [user_2]: [],
    });
    const [selectedUser, setSelectedUser] = useState<string>(user_1);


    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messagesMap, selectedUser]);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (!navigator.onLine) return;

            const queue = await getQueue();
            for (const [key, item] of queue.entries()) {
                try {
                    const res = await fetch(`/api/suggestions/${item.suggestionId}/rank`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(item),
                    });
                    if (res.ok) {
                        await removeFromQueue(key + 1); // IndexedDB keys start at 1
                    }
                } catch (err) {
                    // Keep it in queue for next attempt
                    await addToQueue(item);
                }
            }
        }, 10000); // retry every 5s

        return () => clearInterval(interval);
    }, []);


    const sendMessage = async (text?: string) => {
        const prompt = text ?? input;
        if (!prompt.trim() || streaming) return;

        setInput("");
        setShowSuggestions((prev) => ({ ...prev, [selectedUser]: false }));

        const userMessage: Message = { role: "user", content: prompt };

        setMessagesMap((prev) => ({
            ...prev,
            [selectedUser]: [...prev[selectedUser], userMessage],
        }));

        setStreaming(true);

        // Placeholder assistant message
        let assistantMsg: Message = { role: "assistant", content: "" };
        setMessagesMap((prev) => ({
            ...prev,
            [selectedUser]: [...prev[selectedUser], assistantMsg],
        }));

        const start = Date.now();
        const response = await fetch("/api/chat/stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: selectedUser,
                sessionId: MOCK_SESSION_ID,
                prompt,
            }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        let assistantText = "";
        let firstTokenTime: number | null = null;

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            let chunk = decoder.decode(value, { stream: true });
            chunk = chunk.replace(/^data:\s*/gm, "");
            chunk = chunk.replace(/\[DONE\]/g, "");
            if (!chunk) continue;

            if (!firstTokenTime) firstTokenTime = Date.now(); // TTFT

            assistantText += chunk;
            assistantMsg = { role: "assistant", content: assistantText };

            setMessagesMap((prev) => {
                const arr = [...prev[selectedUser]];
                arr[arr.length - 1] = assistantMsg;
                return { ...prev, [selectedUser]: arr };
            });
        }

        setTtft(firstTokenTime ? firstTokenTime - start : 0);   

        setStreaming(false);
        setShowSuggestions((prev) => ({ ...prev, [selectedUser]: true }));
    };

    const rateSuggestion = async (index: number, rating: number) => {
        const suggestionId = suggestions[index]._id;

        // store color from showScoreFor before clearing it
        const ratingColor = showScoreFor.color === "green" ? "green" : "red";

        const previousRating = ratings[index + selectedUser] || null;

        // Optimistic UI + store color
        setRatings((prev) => ({ ...prev, [index + selectedUser]: { value: rating, color: ratingColor } }));
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
            setRatings((prev) => ({ ...prev, [index + selectedUser]: previousRating }));
            alert("Failed to submit rating.");

            await addToQueue({ rank: rating });
        }
    };


    return (
        <div className="flex h-screen bg-white">

            {/* Sidebar */}
            <div className="w-1/4 bg-gray-100 border-r p-4 overflow-y-auto">
                <h2 className="text-xl text-black font-bold mb-4">Users</h2>

                {/* Users List */}
                <div>
                    <button
                        onClick={() => setOpen(!open)}
                        className="w-full flex items-center justify-between p-3 text-black border font-semibold rounded-lg"
                    >
                        <span>User Conversations</span>
                        <span>{open ? "▲" : "▼"}</span>
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 mt-3" : "max-h-0"}`}>
                        <div className="space-y-3">
                            <button
                                onClick={() => setSelectedUser(user_1)}
                                className={`w-full flex p-3 rounded-lg border text-left transition ${selectedUser === user_1 ? "bg-[#004a9e] text-white" : "bg-white text-black hover:bg-[#004a9e] hover:text-white"}`}
                            >
                                <img src="/user_1.png" alt="User 1" className="w-6 h-6 rounded-full mr-2" />
                                user_1
                            </button>

                            <button
                                onClick={() => setSelectedUser(user_2)}
                                className={`w-full flex p-3 rounded-lg border text-left transition ${selectedUser === user_2 ? "bg-[#004a9e] text-white" : "bg-white text-black hover:bg-[#004a9e] hover:text-white"}`}
                            >
                                <img src="/user_2.svg" alt="User 2" className="w-6 h-6 rounded-full mr-2" />
                                user_2
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col relative">
                {/* Top Bar */}
                <div className="p-4 bg-[#004a9e] text-white sticky top-0 z-10 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Chat App</h1>

                    {ttft !== null && (
                        <div className="mt-1 text-md">
                            <span className="font-semibold">Time to First Token (TTFT):</span> {ttft} ms
                        </div>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto py-[2%] px-[10%] space-y-3">
                    {(messagesMap[selectedUser] || []).map((msg, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role !== "user" && (
                                <img src="/chatbot.png" alt="assistant" className="w-8 h-8 rounded-full object-cover" />
                            )}
                            <div className={`p-3 rounded-xl text-[18px] w-fit max-w-[60%] break-words md:max-w-[50%] ${msg.role === "user" ? "bg-gray-100 text-black" : "bg-[#0060d1] text-white"}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {/* FOLLOW-UP SUGGESTIONS */}
                    {showSuggestions[selectedUser] && suggestions.length > 0 && (
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
                                    {ratings[i + selectedUser] ? (
                                        <div
                                            className={`text-sm font-semibold whitespace-nowrap ${ratings[i + selectedUser].color === "green"
                                                ? "text-green-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            Rated: {ratings[i + selectedUser].value}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 whitespace-nowrap">
                                            {/* Thumbs */}
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

                                            {/* Score buttons */}
                                            {showScoreFor.index === i && (
                                                <div className="flex gap-2">
                                                    {[1, 2, 3].map((score) => (
                                                        <button
                                                            key={score}
                                                            onClick={() => rateSuggestion(i, score)}
                                                            className={`px-2 py-1 rounded-lg transition text-xs ${showScoreFor.color === "green"
                                                                ? "bg-green-500 text-white hover:bg-green-600"
                                                                : "bg-red-500 text-white hover:bg-red-600"
                                                                }`}
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


                {/* Input Box */}
                <div className="py-[2%] bg-white sticky z-10 px-[10%]">
                    <div className="relative">
                        <textarea
                            className="w-full pl-4 pt-4 pb-4  pr-20 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0060d1] focus:border-[#0060d1] text-black resize-none"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                            placeholder="Type your message..."
                            disabled={streaming}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={streaming}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl text-white shadow-md transition ${streaming ? "bg-gray-400 cursor-not-allowed" : "bg-[#0060d1] hover:bg-[#004a9e] active:scale-95"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12L19 6L15 18L11.5 13L5 12Z" />
                            </svg>
                        </button>
                    </div>
                </div>

            </div >
        </div >

    );
}
