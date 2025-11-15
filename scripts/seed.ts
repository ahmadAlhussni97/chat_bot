import { connectMongo } from "../lib/mongo";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { Message } from "../models/Message";
import { Suggestion } from "../models/Suggestion";

async function seed() {
  await connectMongo();
  await Promise.all([
    User.deleteMany({}),
    Session.deleteMany({}),
    Message.deleteMany({}),
    Suggestion.deleteMany({}),
  ]);

  const users = await User.create([{ name: "user_1" }, { name: "user_2" }]);

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
          text: m % 2 === 0 ? "User message" : "Assistant response",
          wordCount: 5,
          tokenEst: 5,
          timings: {
            requestStart,
            firstTokenAt: requestStart + 50,
            completedAt: requestStart + 300,
          },
        });

        if (message.role === "assistant") {
          await Suggestion.insertMany(
            ["Option 1", "Option 2", "Option 3"].map((text) => ({
              sessionId: session._id,
              messageId: message._id,
              text,
              generatedAt: Date.now(),
            }))
          );
        }
      }
    }
  }

  console.log("🎉 Seed completed!");
  process.exit(0);
}

seed().catch(console.error);
