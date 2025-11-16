import mongoose, { Schema } from "mongoose";

const SuggestionSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  text: { type: String, required: true },
  rank: { type: Number, min: 1, max: 5 },
  clicked: { type: Boolean, default: false },
  clickedAt: Number,
  generatedAt: { type: Number, default: Date.now },
}, { timestamps: true });

export const Suggestion = mongoose.models.Suggestion || mongoose.model("Suggestion", SuggestionSchema);
