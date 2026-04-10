const mongoose = require('mongoose');
const crypto   = require('crypto');
const { Schema } = mongoose;

const claimSchema = new Schema(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },

    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Optional — a shelter or individual recipient the volunteer is delivering to
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // SHA-256 hash of the 6-digit OTP — NEVER store the raw PIN
    otpHash:     { type: String, required: true },
    otpVerified: { type: Boolean, default: false },

    // OTP expires 2 hours after claim to prevent stale codes
    otpExpiresAt: { type: Date, required: true },

    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },

    claimedAt:   { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },

    // Optional proof photo URL (Cloudinary) uploaded by volunteer at handoff
    proofPhotoUrl: { type: String, default: null },

    // Short retention — proof photos and event logs should be purged after 30 days
    purgeAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// --- Static helpers ---

/**
 * Generate a 6-digit OTP and return both the raw PIN (to send to volunteer)
 * and its SHA-256 hash (to store in the DB).
 */
claimSchema.statics.generateOTP = function () {
  const raw  = crypto.randomInt(100000, 999999).toString();
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
};

/**
 * Verify a raw PIN against the stored hash without exposing the hash.
 */
claimSchema.methods.verifyOTP = function (rawPin) {
  if (this.otpExpiresAt < new Date()) return false; // expired
  const hash = crypto.createHash('sha256').update(rawPin).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(this.otpHash));
};

claimSchema.index({ listingId: 1 });
claimSchema.index({ volunteerId: 1 });
claimSchema.index({ status: 1 });

// TTL index — MongoDB will automatically delete completed/cancelled claims after purgeAt
claimSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Claim', claimSchema);
