require('dotenv').config({ path: '../server/.env' });
const mongoose = require('mongoose');
const fs = require('fs');

// Cafe Schema
const cafeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  phone: String,
  photos: [String],
  priceRange: { type: String, enum: ['$', '$$', '$$$'], default: '$$' },
  features: {
    wifi: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    aircon: { type: Boolean, default: false },
    outdoor: { type: Boolean, default: false },
    liveMusic: { type: Boolean, default: false }
  },
  tags: [String],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

cafeSchema.index({ location: '2dsphere' });

cafeSchema.pre('save', function() {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

const Cafe = mongoose.model('Cafe', cafeSchema);

// Review Schema - NO unique constraint, allow multiple reviews
const reviewSchema = new mongoose.Schema({
  cafe: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafe', required: true },
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

// Famous cafes to mark as featured
const FEATURED_KEYWORDS = ['la viet', 'tùng', 'túi mơ', 'windmills', 'view', 'thô', 'phê la', 'eden', 'golf'];

async function importCafes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dalat-coffee');
    console.log('Connected to MongoDB\n');

    const rawData = fs.readFileSync('./cafes-augmented.json', 'utf8');
    const cafesData = JSON.parse(rawData);

    console.log(`Found ${cafesData.length} cafes to import\n`);

    // Clear existing data
    await Cafe.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data\n');

    // Import cafes and reviews
    let cafeCount = 0;
    let reviewCount = 0;

    for (const cafeData of cafesData) {
      // Clean address
      let address = (cafeData.address || '').trim().replace(/^\n/, '');
      if (!address || address.match(/^[A-Z0-9]+\+/)) {
        address = 'Đà Lạt, Lâm Đồng';
      }

      const isFeatured = FEATURED_KEYWORDS.some(k => cafeData.name.toLowerCase().includes(k));

      // Calculate average rating from reviews
      const reviews = cafeData.reviews || [];
      let avgRating = cafeData.averageRating || 4.0;
      if (reviews.length > 0) {
        const sum = reviews.reduce((s, r) => s + (r.rating || 5), 0);
        avgRating = Math.round((sum / reviews.length) * 10) / 10;
      }
      if (avgRating === 0) avgRating = 4.0 + Math.random() * 0.8;

      const cafe = new Cafe({
        name: cafeData.name,
        description: cafeData.description || `${cafeData.name} - Quán cà phê tại Đà Lạt`,
        address: address,
        location: cafeData.location,
        phone: cafeData.phone || '',
        photos: cafeData.photos || [],
        priceRange: cafeData.priceRange || '$$',
        averageRating: avgRating,
        totalReviews: reviews.length,
        features: cafeData.features || { wifi: true },
        tags: cafeData.tags || ['coffee', 'da-lat'],
        featured: isFeatured,
        verified: isFeatured
      });

      await cafe.save();
      cafeCount++;

      // Import ALL reviews for this cafe
      for (const reviewData of reviews) {
        const review = new Review({
          cafe: cafe._id,
          reviewerName: reviewData.reviewerName || 'Khách',
          rating: reviewData.rating || 5,
          comment: reviewData.comment
        });
        await review.save();
        reviewCount++;
      }

      const stars = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
      console.log(`✓ ${cafe.name} ${stars} (${reviews.length} reviews)${isFeatured ? ' ⭐' : ''}`);
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Imported ${cafeCount} cafes with ${reviewCount} reviews!`);
    console.log(`\n🔄 Refresh your browser to see the updates.`);

    process.exit(0);
  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  }
}

importCafes();
