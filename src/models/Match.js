import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  matchNumber: { type: Number, required: true, unique: true },
  stage: { type: String, enum: ['group', 'semifinal', 'final'], required: true },
  group: { type: String, enum: ['A', 'B', null], default: null },
  player1: { type: String, required: true },
  player2: { type: String, required: true },
  score1: { type: Number, default: 0 },
  score2: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
  timeSlot: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);
