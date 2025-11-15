import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String, required: true },
  wordCount: { type: Number, required: true },
  tokenEst: { type: Number, required: true },
  timings: {
    requestStart: Number,
    firstTokenAt: Number,
    completedAt: Number,
  },
}, { timestamps: true });

export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
