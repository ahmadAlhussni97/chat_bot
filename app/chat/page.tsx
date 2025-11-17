"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

const MOCK_SESSION_ID = "69199e826038bf3e62818834";

const user_1 = "69199e826038bf3e62818830";
const user_2 = "6919dae66079e4b588a99ffc";

export default function ChatPage() {

    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [suggestions, setSuggestions] = useState<{ _id: string; text: string }[]>([]);
    const [ratings, setRatings] = useState<{ [key: number]: { value: number | null; color: string | null } }>({});
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

    const sendMessage = async (text?: string) => {
        const prompt = text ?? input;
        if (!prompt.trim() || streaming) return;

        setSuggestions([]);
        setInput("");

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

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            let chunk = decoder.decode(value, { stream: true });
            chunk = chunk.replace(/^data:\s*/gm, "");
            chunk = chunk.replace(/\[DONE\]/g, "");
            if (!chunk) continue;

            assistantText += chunk;

            assistantMsg = { role: "assistant", content: assistantText };

            setMessagesMap((prev) => {
                const arr = [...prev[selectedUser]];
                arr[arr.length - 1] = assistantMsg;
                return { ...prev, [selectedUser]: arr };
            });
        }

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
                <div className="p-4 bg-[#004a9e] text-white sticky top-0 z-10">
                    <h1 className="text-2xl font-bold">Chat App</h1>
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

            </div>
        </div>

    );
}
