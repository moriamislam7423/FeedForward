const mongoose = require('mongoose');
const { Schema } = mongoose;

const impactStatsSchema = new Schema(
  {
    poundsRescued: { type: Number, default: 0 },
    co2Diverted:   { type: Number, default: 0 }, // in lbs
    totalDeliveries: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ['business', 'volunteer', 'recipient', 'shelter'],
      required: true,
    },

    // GeoJSON point — required for volunteers and businesses so map queries work
    location: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },

    address:    { type: String, trim: true },
    phone:      { type: String, trim: true },

    // FCM / Web Push token for notifications
    pushToken:  { type: String, default: null },

    // Denormalized for fast dashboard queries — updated after each completed Claim
    impactStats: { type: impactStatsSchema, default: () => ({}) },

    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 2dsphere index enables $near and $geoWithin queries on the map
userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);