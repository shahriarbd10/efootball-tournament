import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  matchNumber: { type: Number, required: true },
  stage: { type: String, enum: ['group', 'round16', 'quarterfinal', 'semifinal', 'final'], required: true },
  group: { type: String, default: null },
  round: { type: String, default: null },
  player1: { type: String, required: true },
  player2: { type: String, required: true },
  score1: { type: Number, default: 0 },
  score2: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
  timeSlot: { type: String, required: true },
  matchDate: { type: Date },
}, { timestamps: true });

// Compound index for unique match numbers within a tournament
MatchSchema.index({ tournamentId: 1, matchNumber: 1 }, { unique: true });

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);
