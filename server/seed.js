require('dotenv').config();
const mongoose = require('mongoose');
const Cafe = require('./models/Cafe');
const User = require('./models/User');
const Review = require('./models/Review');

// Sample Da Lat cafes data
const cafes = [
  {
    name: "The Married Beans",
    description: "Cozy coffee shop with beautiful garden view and specialty Vietnamese coffee. Perfect spot for couples and remote workers.",
    address: "15 Tang Bat Ho, Ward 1, Da Lat",
    location: { type: "Point", coordinates: [108.4389, 11.9425] },
    phone: "0263 382 1234",
    photos: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"],
    priceRange: "$$",
    features: { wifi: true, view: true, petFriendly: true, parking: true, aircon: false, outdoor: true, liveMusic: false },
    tags: ["garden", "specialty", "romantic"],
    featured: true
  },
  {
    name: "La Viet Coffee",
    description: "Famous local chain known for quality Arabica beans grown in Da Lat highlands. Industrial style interior.",
    address: "200 Nguyen Cong Tru, Ward 8, Da Lat",
    location: { type: "Point", coordinates: [108.4515, 11.9328] },
    phone: "0263 355 6789",
    photos: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800"],
    priceRange: "$",
    features: { wifi: true, view: false, petFriendly: false, parking: true, aircon: true, outdoor: false, liveMusic: false },
    tags: ["local", "arabica", "industrial"],
    featured: true
  },
  {
    name: "Horizon Coffee",
    description: "Stunning panoramic views of Da Lat city. Best sunset spot in town with excellent egg coffee.",
    address: "12 Tran Hung Dao, Ward 3, Da Lat",
    location: { type: "Point", coordinates: [108.4445, 11.9465] },
    phone: "0263 366 4321",
    photos: ["https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800"],
    priceRange: "$$$",
    features: { wifi: true, view: true, petFriendly: false, parking: true, aircon: false, outdoor: true, liveMusic: true },
    tags: ["view", "sunset", "egg-coffee"],
    featured: true
  },
  {
    name: "An Cafe",
    description: "Hidden gem in the pine forest. Traditional Vietnamese coffee served in a peaceful garden setting.",
    address: "45 Ho Tung Mau, Ward 2, Da Lat",
    location: { type: "Point", coordinates: [108.4312, 11.9380] },
    phone: "0263 377 8899",
    photos: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"],
    priceRange: "$",
    features: { wifi: false, view: true, petFriendly: true, parking: true, aircon: false, outdoor: true, liveMusic: false },
    tags: ["nature", "traditional", "quiet"]
  },
  {
    name: "Windmills Coffee",
    description: "European-style cafe with Dutch windmill theme. Great pastries and espresso drinks.",
    address: "78 3 Thang 4, Ward 1, Da Lat",
    location: { type: "Point", coordinates: [108.4487, 11.9412] },
    phone: "0263 388 2233",
    photos: ["https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800"],
    priceRange: "$$",
    features: { wifi: true, view: true, petFriendly: false, parking: false, aircon: true, outdoor: true, liveMusic: false },
    tags: ["european", "pastry", "instagram"]
  },
  {
    name: "Nha Cua Gio",
    description: "Minimalist design cafe with floor-to-ceiling windows. Known for creative drinks and desserts.",
    address: "23 Phan Dinh Phung, Ward 2, Da Lat",
    location: { type: "Point", coordinates: [108.4398, 11.9445] },
    phone: "0263 399 1122",
    photos: ["https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800"],
    priceRange: "$$",
    features: { wifi: true, view: true, petFriendly: false, parking: true, aircon: true, outdoor: false, liveMusic: false },
    tags: ["minimalist", "desserts", "modern"]
  },
  {
    name: "Tiem Ca Phe Muoi",
    description: "Famous for its signature salt coffee. Cozy vintage atmosphere with local art on walls.",
    address: "56 Truong Cong Dinh, Ward 1, Da Lat",
    location: { type: "Point", coordinates: [108.4523, 11.9398] },
    phone: "0263 366 7788",
    photos: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"],
    priceRange: "$",
    features: { wifi: true, view: false, petFriendly: false, parking: false, aircon: false, outdoor: false, liveMusic: false },
    tags: ["salt-coffee", "vintage", "local-art"]
  },
  {
    name: "Memory Coffee",
    description: "Retro cafe decorated with nostalgic Vietnamese items from the 80s-90s. Great ca phe sua da.",
    address: "89 Nguyen Chi Thanh, Ward 1, Da Lat",
    location: { type: "Point", coordinates: [108.4456, 11.9367] },
    phone: "0263 377 5566",
    photos: ["https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800"],
    priceRange: "$",
    features: { wifi: true, view: false, petFriendly: false, parking: true, aircon: false, outdoor: false, liveMusic: false },
    tags: ["retro", "nostalgic", "vietnamese"]
  },
  {
    name: "Pine Tree Garden",
    description: "Spacious garden cafe under tall pine trees. Perfect for group gatherings and family outings.",
    address: "34 Xo Viet Nghe Tinh, Ward 7, Da Lat",
    location: { type: "Point", coordinates: [108.4278, 11.9502] },
    phone: "0263 388 9900",
    photos: ["https://images.unsplash.com/photo-1464979681340-bdd28a61699e?w=800"],
    priceRange: "$$",
    features: { wifi: true, view: true, petFriendly: true, parking: true, aircon: false, outdoor: true, liveMusic: true },
    tags: ["garden", "family", "groups"]
  },
  {
    name: "Acoustic Coffee",
    description: "Live acoustic music every evening. Intimate atmosphere perfect for music lovers.",
    address: "67 Hai Ba Trung, Ward 6, Da Lat",
    location: { type: "Point", coordinates: [108.4567, 11.9423] },
    phone: "0263 399 4455",
    photos: ["https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800"],
    priceRange: "$$",
    features: { wifi: true, view: false, petFriendly: false, parking: true, aircon: true, outdoor: false, liveMusic: true },
    tags: ["music", "acoustic", "night"]
  }
];

// Sample users for reviews
const users = [
  { name: "Minh Tran", email: "minh@example.com", password: "password123" },
  { name: "Linh Nguyen", email: "linh@example.com", password: "password123" },
  { name: "Hoa Pham", email: "hoa@example.com", password: "password123" }
];

// Sample reviews
const reviewTexts = [
  "Amazing coffee and stunning view! Will definitely come back.",
  "Best egg coffee in Da Lat. The atmosphere is so cozy.",
  "Great place to work remotely. Fast wifi and friendly staff.",
  "Love the garden setting. Perfect for a relaxing afternoon.",
  "Good coffee but a bit crowded on weekends.",
  "The sunset view is breathtaking. Must visit!",
  "Unique interior design and tasty desserts.",
  "Authentic Vietnamese coffee experience.",
  "Nice ambiance but prices are a bit high.",
  "Hidden gem! Not many tourists know about this place."
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dalat-coffee');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Cafe.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Insert cafes (use save() to trigger pre-save hook for slug generation)
    const insertedCafes = [];
    for (const cafeData of cafes) {
      const cafe = new Cafe(cafeData);
      await cafe.save();
      insertedCafes.push(cafe);
    }
    console.log(`Inserted ${insertedCafes.length} cafes`);

    // Insert users
    const insertedUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      insertedUsers.push(user);
    }
    console.log(`Inserted ${insertedUsers.length} users`);

    // Create reviews
    let reviewCount = 0;
    for (const cafe of insertedCafes) {
      // Random number of reviews per cafe (1-4)
      const numReviews = Math.floor(Math.random() * 4) + 1;

      for (let i = 0; i < numReviews; i++) {
        const randomUser = insertedUsers[Math.floor(Math.random() * insertedUsers.length)];
        const randomRating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        const randomComment = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];

        try {
          const review = new Review({
            cafe: cafe._id,
            user: randomUser._id,
            rating: randomRating,
            comment: randomComment
          });
          await review.save();
          reviewCount++;
        } catch (e) {
          // Skip duplicate reviews (same user, same cafe)
        }
      }
    }
    console.log(`Inserted ${reviewCount} reviews`);

    console.log('\nSeed completed successfully!');
    console.log('\nTest accounts:');
    users.forEach(u => console.log(`  Email: ${u.email} | Password: ${u.password}`));

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
