const express = require('express');
const router = express.Router();
const { Listing } = require('../models');

// GET /api/listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({
      status: 'available',
      expiresAt: { $gt: new Date() } 
    }).sort({ createdAt: -1 }); 

    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Server error fetching listings' });
  }
});

// POST /api/listings
router.post('/', async (req, res) => {
  try {
    const newListing = new Listing({
      ...req.body,
      businessId: req.user.id 
    });

    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;