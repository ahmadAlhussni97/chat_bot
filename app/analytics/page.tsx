import { Suspense } from "react";
import VolumeChart from "./charts/VolumeChart";
import LatencyChart from "./charts/LatencyChart";
import TopTables from "./charts/TopTables";
import Filters from "./filters";
import { connectMongo } from "../../lib/mongo";
import { ObjectId } from "mongodb";

interface DashboardData {
  volume: any;
  latency: any;
  trends: any;
  topTables: any;
}

function computeRange(range?: string) {
  const now = Date.now();

  if (range === "24h") {
    return {
      current: { $gte: new Date(now - 24 * 60 * 60 * 1000) },
      prev: {
        $gte: new Date(now - 48 * 60 * 60 * 1000),
        $lt: new Date(now - 24 * 60 * 60 * 1000)
      }
    };
  }

  if (range === "7d") {
    return {
      current: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) },
      prev: {
        $gte: new Date(now - 14 * 24 * 60 * 60 * 1000),
        $lt: new Date(now - 7 * 24 * 60 * 60 * 1000)
      }
    };
  }

  return null;
}

function delta(a?: number, b?: number) {
  if (a == null || b == null) return null;
  return ((a - b) / b) * 100; // percentage change
}

async function getDashboardData(user?: string, range?: string): Promise<DashboardData> {
  const client = await connectMongo();
  const db = client.connection.db;
  const messages = db?.collection("messages");
  const suggestions = db?.collection("suggestions");

  const match: any = {};
  if (user) match.userId = new ObjectId(user);
  if (range === "24h") match.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  if (range === "7d") match.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };

  // Volume
  const volume = await messages?.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$userId",
        messages: { $sum: 1 },
        chats: { $addToSet: "$chatId" },
      },
    },
  ]).toArray();

  // Latency
  const latency = await messages?.aggregate([
    { $match: { ...match, latency: { $exists: true } } },
    {
      $group: {
        _id: null,
        avgLatency: { $avg: "$latency" },
        latency95: { $avg: "$latency" },
        avgTTFT: { $avg: "$ttft" },
      },
    },
  ]).toArray();

  // Top tables
  const topTables = {
    slowest: await messages?.find(match).sort({ latency: -1 }).limit(10).toArray(),
    topSuggestions: await suggestions?.aggregate([
      { $match: { clicked: { $exists: true } } },
      { $unwind: "$clicked" },
      { $group: { _id: "$clicked", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray(),
  };

  const ranges = computeRange(range);
  const matchCurrent: any = {};
  const matchPrevious: any = {};

  if (user) {
    matchCurrent.userId = new ObjectId(user);
    matchPrevious.userId = new ObjectId(user);
  }

  if (ranges) {
    matchCurrent.createdAt = ranges.current;
    matchPrevious.createdAt = ranges.prev;
  }

  const prevLatency = await messages?.aggregate([
    { $match: { ...matchPrevious, latency: { $exists: true } } },
    {
      $group: {
        _id: null,
        avgLatency: { $avg: "$latency" },
        avgTTFT: { $avg: "$ttft" }
      }
    }
  ]).toArray();

  const trends = {
    avgLatencyDelta: latency?.length && prevLatency?.length ? delta(latency[0]?.avgLatency, prevLatency[0]?.avgLatency) : '',
    avgTTFTDelta: latency?.length && prevLatency?.length ? delta(latency[0]?.avgTTFT, prevLatency[0]?.avgTTFT) : '',
  };

  // Serialize ObjectIds to string
  return {
    volume: JSON.parse(JSON.stringify(volume?.map(v => ({
      _id: String(v._id),
      messages: v.messages,
      chats: v.chats.map(String),
    })))),
    latency: JSON.parse(JSON.stringify(latency)),
    trends: trends,
    topTables: JSON.parse(JSON.stringify({
      slowest: (topTables.slowest ?? []).map(msg => ({
        ...msg,
        _id: String(msg._id),
        userId: msg.userId,
        chatId: msg.chatId,
      })),
      topSuggestions: (topTables.topSuggestions ?? []).map(s => ({
        ...s,
        _id: String(s._id),
      })),
    }))
  };
}

export default async function AnalyticsPage({ searchParams }: { searchParams?: { user?: string, range?: string } }) {

  const { user, range } = await searchParams || {};

  const data = await getDashboardData(user, range);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-black">Analytics Dashboard</h1>

      {/* Filters */}
      <Filters />

      {/* Charts */}
      <Suspense fallback={<div>Loading volume chart...</div>}>
        <VolumeChart data={data.volume} />
      </Suspense>

      <Suspense fallback={<div>Loading latency chart...</div>}>
        <LatencyChart data={data.latency} />
      </Suspense>

      <Suspense fallback={<div>Loading top tables...</div>}>
        <TopTables data={data.topTables} />
      </Suspense>
    </div>
  );
}