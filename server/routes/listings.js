const express = require('express');
const router = express.Router();
const { Listing } = require('../models');

// GET /api/listings
// Frontend call: api.getListings()
// Returns all available listings that haven't expired
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({
      status: 'available',
      expiresAt: { $gt: new Date() } // Only show listings where expiration is in the future
    }).sort({ createdAt: -1 }); // Show newest posts first

    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Server error fetching listings' });
  }
});

// POST /api/listings
// Frontend call: api.createListing(listing)
// Creates a new food listing
router.post('/', async (req, res) => {
  try {
    // req.user.id comes from the mock auth middleware in app.js
    const newListing = new Listing({
      ...req.body,
      businessId: req.user.id 
    });

    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    // Send back a 400 status (Bad Request) if validation fails (e.g., missing title)
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
