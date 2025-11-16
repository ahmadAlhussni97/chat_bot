import mongoose, { Schema } from "mongoose";

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: { type: Date, default: Date.now },
  model: { type: String, default: "mock-model" },
});

export const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);
