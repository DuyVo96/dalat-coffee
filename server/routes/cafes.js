const express = require('express');
const Cafe = require('../models/Cafe');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all cafes with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      wifi,
      view,
      petFriendly,
      parking,
      outdoor,
      priceRange,
      sortBy = 'averageRating',
      order = 'desc',
      page = 1,
      limit = 20,
      lat,
      lng,
      radius = 5000 // meters
    } = req.query;

    const query = {};

    // Only show verified cafes on public page (unless admin requests all)
    if (req.query.showAll !== 'true') {
      query.verified = true;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Feature filters
    if (wifi === 'true') query['features.wifi'] = true;
    if (view === 'true') query['features.view'] = true;
    if (petFriendly === 'true') query['features.petFriendly'] = true;
    if (parking === 'true') query['features.parking'] = true;
    if (outdoor === 'true') query['features.outdoor'] = true;

    // Price filter
    if (priceRange) {
      query.priceRange = priceRange;
    }

    // Geo query
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const cafes = await Cafe.find(query)
      .sort({ featured: -1, [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Cafe.countDocuments(query);

    res.json({
      cafes,
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

// Submit a new cafe (from cafe owners)
router.post('/submit', async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      description,
      priceRange,
      photos,
      features,
      ownerName,
      ownerPhone
    } = req.body;

    if (!name || !address || !ownerName || !ownerPhone) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    // Default location (center of Da Lat) - can be updated later
    const defaultLocation = {
      type: 'Point',
      coordinates: [108.4378, 11.9404]
    };

    const cafe = new Cafe({
      name,
      address,
      phone: phone || '',
      description: description || `${name} - Quán cà phê tại Đà Lạt`,
      priceRange: priceRange || '$$',
      photos: photos || [],
      features: features || { wifi: true },
      location: defaultLocation,
      tags: ['coffee', 'da-lat', 'user-submitted'],
      averageRating: 0,
      totalReviews: 0,
      featured: false,
      verified: false,
      ownerInfo: {
        name: ownerName,
        phone: ownerPhone
      }
    });

    await cafe.save();

    res.status(201).json({
      message: 'Đăng ký thành công! Quán của bạn sẽ được xem xét và thêm vào danh sách.',
      cafe: { name: cafe.name, slug: cafe.slug }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single cafe by slug
router.get('/:slug', async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ slug: req.params.slug });

    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    res.json(cafe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cafes for map (minimal data)
router.get('/map/markers', async (req, res) => {
  try {
    const cafes = await Cafe.find({ verified: true }, {
      name: 1,
      slug: 1,
      location: 1,
      averageRating: 1,
      priceRange: 1,
      'photos': { $slice: 1 }
    });

    res.json(cafes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save/unsave cafe (toggle)
router.post('/:id/save', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const cafeId = req.params.id;
    const user = await User.findById(req.user._id);

    const index = user.savedCafes.indexOf(cafeId);
    if (index > -1) {
      user.savedCafes.splice(index, 1);
    } else {
      user.savedCafes.push(cafeId);
    }

    await user.save();
    res.json({ savedCafes: user.savedCafes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify ALL cafes (admin - one time use)
router.post('/verify-all', async (req, res) => {
  try {
    const result = await Cafe.updateMany({}, { verified: true });
    res.json({ message: `Verified ${result.modifiedCount} cafes` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify a cafe (admin)
router.patch('/:id/verify', async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndUpdate(
      req.params.id,
      { verified: true, featured: false },
      { new: true }
    );
    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }
    res.json({ message: 'Cafe verified', cafe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a cafe (admin)
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const cafe = await Cafe.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }
    res.json({ message: 'Cafe updated', cafe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a cafe (admin)
router.delete('/:id', async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndDelete(req.params.id);
    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }
    // Also delete related reviews
    const Review = require('../models/Review');
    await Review.deleteMany({ cafe: req.params.id });
    res.json({ message: 'Cafe deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
