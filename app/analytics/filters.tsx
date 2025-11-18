"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Filters() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [range, setRange] = useState("24h");

  const applyFilters = () => {
    router.push(`/analytics?user=${user}&range=${range}`);
  };

  return (
    <div className="flex w-full items-center gap-8 mb-6 p-4 bg-white shadow-md rounded-lg">
      {/* User Select */}
      <div className="flex flex-col md:flex-row items-center gap-2">
        <label className="text-gray-700 font-medium">User:</label>
        <select
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="border text-gray-700 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">All Users</option>
          <option value="69199e826038bf3e62818830">user_1</option>
          <option value="6919dae66079e4b588a99ffc">user_2</option>
        </select>
      </div>

      {/* Time Range Select */}
      <div className="flex flex-col md:flex-row items-center gap-2">
        <label className="text-gray-700 font-medium">Time Range:</label>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border text-gray-700  border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7d</option>
        </select>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="mt-2 md:mt-0 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition"
      >
        Apply
      </button>
    </div>
  );
}
