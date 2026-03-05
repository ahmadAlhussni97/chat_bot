import mongoose from "mongoose";

declare global {
  var _mongo: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://privateworkweb_db_user:s9pKSL7ERlhwmOCY@cluster0.t7lqknw.mongodb.net/?appName=Cluster0";

let cached = globalThis._mongo as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;

if (!cached) {
  cached = globalThis._mongo = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGO_URI).then((mongoose) => mongoose);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
