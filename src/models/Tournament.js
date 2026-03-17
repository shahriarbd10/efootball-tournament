import mongoose from 'mongoose';

const TournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  format: { type: String, enum: ['group+knockout', 'knockout'], required: true },
  playerCount: { type: Number, required: true },
  players: [{ type: String }],
  groups: { type: Map, of: [String], default: {} },
  groupCount: { type: Number, default: 2 },
  playersPerGroup: { type: Number, default: 3 },
  qualifyPerGroup: { type: Number, default: 2 },
  startTime: { type: String, default: '10:00 AM' },
  slotDuration: { type: Number, default: 10 }, // minutes per match
  status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
}, { timestamps: true });

export default mongoose.models.Tournament || mongoose.model('Tournament', TournamentSchema);
