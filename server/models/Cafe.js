const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  phone: String,
  website: String,
  photos: [String],
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$'],
    default: '$$'
  },
  features: {
    wifi: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    aircon: { type: Boolean, default: false },
    outdoor: { type: Boolean, default: false },
    liveMusic: { type: Boolean, default: false }
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  tags: [String],
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create geospatial index
cafeSchema.index({ location: '2dsphere' });

// Create text index for search
cafeSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Generate slug from name before saving
cafeSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Cafe', cafeSchema);
