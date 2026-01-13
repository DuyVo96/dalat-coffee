const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  reviewerName: {
    type: String,
    required: true,
    default: 'Khách'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  photos: [String]
}, {
  timestamps: true
});

// Update cafe rating after review save
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Cafe = mongoose.model('Cafe');

  const stats = await Review.aggregate([
    { $match: { cafe: this.cafe } },
    {
      $group: {
        _id: '$cafe',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Cafe.findByIdAndUpdate(this.cafe, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
