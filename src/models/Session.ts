import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'companies',
    required: true,
  },
  userAgent: {
    type: String, // e.g., user-agent or device fingerprint
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d', // Optional: auto-remove after 7 days
  },
});

const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
export default Session;