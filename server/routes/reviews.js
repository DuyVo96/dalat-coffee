const express = require('express');
const Review = require('../models/Review');
const Cafe = require('../models/Cafe');

const router = express.Router();

// Get reviews for a cafe - NO AUTH REQUIRED
router.get('/cafe/:cafeId', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ cafe: req.params.cafeId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ cafe: req.params.cafeId });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create review - NO AUTH REQUIRED, just need a name
router.post('/', async (req, res) => {
  try {
    const { cafeId, rating, comment, reviewerName } = req.body;

    // Check if cafe exists
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    const review = new Review({
      cafe: cafeId,
      reviewerName: reviewerName || 'Khách',
      rating,
      comment
    });

    await review.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
