const mongoose = require('mongoose');
const { Schema } = mongoose;

const listingSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Cloudinary URLs — validated to start with https://res.cloudinary.com
    photos: {
      type: [String],
      validate: {
        validator: (arr) => arr.every((url) => url.startsWith('https://')),
        message: 'All photo URLs must be HTTPS',
      },
      default: [],
    },

    dietaryTags: {
      type: [String],
      enum: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher', 'other'],
      default: [],
    },

    quantity: {
      amount: { type: Number, required: true, min: 0 },
      unit:   { type: String, enum: ['lbs', 'kg', 'items', 'servings', 'boxes'], required: true },
    },

    status: {
      type: String,
      enum: ['available', 'claimed', 'completed', 'expired'],
      default: 'available',
    },

    // When this listing auto-expires — used by the countdown timer and a cron job
    expiresAt: { type: Date, required: true },

    // GeoJSON point copied from the business's location at post time
    location: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },

    address: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Core geo query index — powers the volunteer map's near searches
listingSchema.index({ location: '2dsphere' });

// Compound index for the most common query: "available listings that haven't expired yet"
listingSchema.index({ status: 1, expiresAt: 1 });

listingSchema.index({ businessId: 1 });

module.exports = mongoose.model('Listing', listingSchema);