const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: [
        'new_listing',      // sent to nearby volunteers / shelters when a listing is posted
        'claim_update',     // sent to business when a volunteer claims their listing
        'otp_issued',       // sent to volunteer with their OTP after claiming
        'expiry_warning',   // sent to business 30 min before their listing expires unclaimed
        'delivery_complete',// sent to business and recipient when a claim is marked complete
      ],
      required: true,
    },

    message: { type: String, required: true },

    // Optional deep-link reference so the frontend can route on tap
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', default: null },
    claimId:   { type: Schema.Types.ObjectId, ref: 'Claim',   default: null },

    read: { type: Boolean, default: false },

    // Auto-delete notifications after 14 days to keep the collection lean
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// MongoDB TTL — auto-purges old notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
