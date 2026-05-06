const express = require('express');
const router = express.Router();
const { Claim, Listing, User } = require('../models');

// POST /api/claims
// Frontend call: api.claimListing(listingId)
// Creates a new claim, generates the OTP, and locks the listing
router.post('/', async (req, res) => {
  try {
    const { listingId } = req.body;
    const volunteerId = req.user.id; // From our mock auth middleware

    // 1. Verify the listing exists and hasn't been claimed by someone else
    const listing = await Listing.findById(listingId);
    if (!listing || listing.status !== 'available') {
      return res.status(400).json({ error: 'Listing is no longer available.' });
    }

    // 2. Generate the OTP using your static schema method!
    const { raw, hash } = Claim.generateOTP();

    // 3. Create the claim
    const newClaim = new Claim({
      listingId,
      volunteerId,
      otpHash: hash,
      // Expires 2 hours from right now
      otpExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) 
    });

    const savedClaim = await newClaim.save();

    // 4. Lock the listing so it disappears from the available map
    listing.status = 'claimed';
    await listing.save();

    // 5. Send back the claim AND the raw PIN
    //  The frontend NEEDS the raw PIN here so it can display it to the volunteer's screen!
    res.status(201).json({ 
      claim: savedClaim, 
      rawPin: raw 
    });

  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Server error creating claim' });
  }
});

// POST /api/claims/:id/verify
// Frontend call: Needs to be added! (e.g., api.verifyClaim(claimId, otp))
// The business uses this to input the PIN and complete the handoff
router.post('/:id/verify', async (req, res) => {
  try {
    const { otp } = req.body;
    const claimId = req.params.id;

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // 1. Verify the OTP using your instance method!
    const isValid = claim.verifyOTP(otp);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired PIN.' });
    }

    // 2. Mark claim as completed
    claim.otpVerified = true;
    claim.status = 'completed';
    claim.completedAt = new Date();
    await claim.save();

    // 3. Update the parent listing to completed
    const listing = await Listing.findById(claim.listingId);
    listing.status = 'completed';
    await listing.save();

    // 4. Update the volunteer's impact stats!
    // Because you denormalized this on the User model, it's just one fast query.
    await User.findByIdAndUpdate(claim.volunteerId, {
      $inc: {
        'impactStats.poundsRescued': listing.quantity.amount,
        'impactStats.totalDeliveries': 1
      }
    });

    res.json({ message: 'Handoff successful! Claim completed.', claim });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Server error verifying OTP' });
  }
});

module.exports = router;
