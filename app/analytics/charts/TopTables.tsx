"use client";

interface TopTablesProps {
  data: {
    slowest: any[];
    topSuggestions: any[];
  };
}

export default function TopTables({ data }: TopTablesProps) {
  return (
    <div className="grid text-black md:grid-cols-2 gap-8">
      {/* Top 10 Slowest Messages */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-2">Top 10 Slowest Messages</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-1 px-2">User</th>
              <th className="py-1 px-2">Latency (ms)</th>
              <th className="py-1 px-2">Content</th>
            </tr>
          </thead>
          <tbody>
            {data.slowest.map((msg, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-1 px-2">{msg.userId}</td>
                <td className="py-1 px-2">{msg.latency}</td>
                <td className="py-1 px-2 truncate max-w-xs">{msg.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top 10 Clicked Suggestions */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-2">Top Clicked Suggestions</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-1 px-2">Suggestion</th>
              <th className="py-1 px-2">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {data.topSuggestions.map((s, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-1 px-2 truncate max-w-xs">{s._id}</td>
                <td className="py-1 px-2">{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
