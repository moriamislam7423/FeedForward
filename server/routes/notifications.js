const express = require('express');
const router = express.Router();
const { Notification } = require('../models');

// GET /api/notifications
// Frontend call: api.getNotifications()
// Fetches the logged-in user's notifications, sorted by newest first
router.get('/', async (req, res) => {
  try {
    // req.user.id comes from our mock auth middleware in app.js
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Newest on top
      .limit(50); // Keep the payload light

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// PATCH /api/notifications/:id/read
// Frontend call: Needs to be added! (e.g., api.markNotificationRead(id))
// Marks a specific notification as read when the user clicks on it
router.patch('/:id/read', async (req, res) => {
  try {
    // We check both _id and userId so a user can't mark someone else's notification as read
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true } // Returns the updated document
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: 'Server error updating notification' });
  }
});

module.exports = router;
