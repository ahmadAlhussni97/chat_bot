import clientPromise from "../lib/mongo"; // your mongo.ts exports clientPromise
import { User } from "../models/User";
import { Session } from "../models/Session";
import { Message } from "../models/Message";
import { Suggestion } from "../models/Suggestion";

async function seed() {
  try {
    // 1️⃣ Connect to MongoDB
    const client = await clientPromise; // <-- await the promise directly
    const db = client.db(); // optional if you want to access db directly
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Clear previous data
    await Promise.all([
      User.deleteMany({}),
      Session.deleteMany({}),
      Message.deleteMany({}),
      Suggestion.deleteMany({}),
    ]);
    console.log("🗑️ Cleared old data");

    // 3️⃣ Create users
    const users = await User.create([
      { name: "user_1" },
      { name: "user_2" },
    ]);

    // 4️⃣ Create sessions, messages, and suggestions
    for (const user of users) {
      for (let s = 0; s < 5; s++) {
        const session = await Session.create({
          userId: user._id,
          model: "mock-model",
          startedAt: new Date(),
        });

        for (let m = 0; m < 3; m++) {
          const requestStart = Date.now();

          const message = await Message.create({
            sessionId: session._id,
            userId: user._id,
            role: m % 2 === 0 ? "user" : "assistant",
            text:
              m % 2 === 0
                ? "Hello, this is a user message"
                : "Assistant response here",
            wordCount: 5,
            tokenEst: 5,
            timings: {
              requestStart,
              firstTokenAt: requestStart + 50,
              completedAt: requestStart + 300,
            },
          });

          if (message.role === "assistant") {
            const suggestions = ["Option 1", "Option 2", "Option 3"].map(
              (text) => ({
                sessionId: session._id,
                messageId: message._id,
                text,
                generatedAt: Date.now(),
              })
            );

            await Suggestion.insertMany(suggestions);
          }
        }
      }
    }

    console.log("🎉 Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
