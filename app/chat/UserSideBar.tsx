"use client";

import { useState } from "react";
import { user_1, user_2 } from "@/constants";

type UserSideBarProps = {
    selectedUser: string;
    setSelectedUser: (userId: string) => void;
};

const UserSideBar = ({ selectedUser, setSelectedUser }: UserSideBarProps) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="w-1/4 bg-gray-100 border-r p-4 overflow-y-auto hidden sm:hidden xl:block lg:block md:block">
            <h2 className="text-xl text-black font-bold mb-4">Users</h2>
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
    );
}   

export default UserSideBar;