const fs = require('fs');

// Load real scraped data
const realCafes = JSON.parse(fs.readFileSync('./cafes-real-data.json', 'utf8'));

console.log(`Loaded ${realCafes.length} real cafes`);

// Da Lat areas and streets for generating addresses
const areas = [
  'Đường Phan Đình Phùng', 'Đường Trần Phú', 'Đường Nguyễn Chí Thanh',
  'Đường 3 Tháng 2', 'Đường Lê Đại Hành', 'Đường Yersin',
  'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
  'Đường Hồ Tùng Mậu', 'Đường Bùi Thị Xuân', 'Đường Pasteur',
  'Khu Hòa Bình', 'Đường Phạm Hồng Thái', 'Đường Nam Kỳ Khởi Nghĩa'
];

// Cafe name prefixes/suffixes for variations
const prefixes = ['The', 'Tiệm', 'Quán', ''];
const suffixes = [
  'Coffee', 'Cafe', 'Cà Phê', 'Coffee House', 'Roasters',
  'Garden', 'Studio', 'Corner', 'Space', 'Lounge'
];
const themes = [
  'Sương Mai', 'Thông Xanh', 'Đồi Mộng Mơ', 'Hoa Dã Quỳ', 'Mimosa',
  'Lavender', 'Phố Núi', 'Hồ Xuân', 'Sương Mù', 'Bình Minh',
  'Hoàng Hôn', 'Rừng Thông', 'Đà Lạt Xưa', 'Mộng Đẹp', 'Lạc Dương',
  'Mai Anh', 'Cẩm Tú', 'Hương Rừng', 'Gió Lạnh', 'Sương Sớm',
  'Hoa Anh Đào', 'Đồi Chè', 'Thác Prenn', 'Langbiang', 'Cà Phê Muối'
];

// Reviews templates
const reviewTemplates = [
  { reviewerName: 'Minh Anh', rating: 5, comment: 'Quán rất đẹp, view nhìn ra thung lũng tuyệt vời. Cà phê ngon, nhân viên thân thiện.' },
  { reviewerName: 'Hoàng Long', rating: 4, comment: 'Không gian yên tĩnh, thích hợp để làm việc. Giá hơi cao một chút.' },
  { reviewerName: 'Thu Hà', rating: 5, comment: 'Đà Lạt se lạnh ngồi đây uống cà phê thật tuyệt. Bánh ngon, cà phê đậm vị.' },
  { reviewerName: 'Quốc Bảo', rating: 4, comment: 'Quán có nhiều góc chụp ảnh đẹp. Wifi mạnh, đồ uống ổn.' },
  { reviewerName: 'Ngọc Linh', rating: 5, comment: 'Một trong những quán cafe đẹp nhất Đà Lạt mình từng đến.' },
  { reviewerName: 'Văn Tùng', rating: 5, comment: 'Cà phê phin pha đúng kiểu Đà Lạt, đậm đà và thơm ngon.' },
  { reviewerName: 'Kim Chi', rating: 4, comment: 'View đẹp, không gian thoáng mát. Nên đến vào buổi chiều ngắm hoàng hôn.' },
  { reviewerName: 'Đức Huy', rating: 5, comment: 'Quán nằm giữa rừng thông, không khí trong lành. Rất thư giãn.' },
  { reviewerName: 'Thanh Thảo', rating: 4, comment: 'Đồ uống ngon, giá cả hợp lý. Nhân viên phục vụ chu đáo.' },
  { reviewerName: 'Hữu Phước', rating: 5, comment: 'Đây là quán quen của mình mỗi khi lên Đà Lạt. Highly recommend!' },
  { reviewerName: 'Lan Phương', rating: 4, comment: 'Cà phê ngon, bánh ngọt cũng được. Chỗ ngồi ngoài trời rất thích.' },
  { reviewerName: 'Tuấn Anh', rating: 5, comment: 'Quán có live music acoustic vào cuối tuần. Atmosphere rất chill.' },
  { reviewerName: 'Bích Ngọc', rating: 5, comment: 'Cảnh đẹp, đồ uống ngon. Chụp ảnh cực kỳ lung linh.' },
  { reviewerName: 'Mạnh Cường', rating: 4, comment: 'Wifi ổn định, có ổ cắm nhiều. Thích hợp làm việc remote.' },
  { reviewerName: 'Yến Nhi', rating: 5, comment: 'Không gian vintage rất Đà Lạt. Cà phê trứng ở đây ngon lắm!' }
];

// Get all photos from real cafes for reusing
const allPhotos = [];
realCafes.forEach(cafe => {
  if (cafe.photos && cafe.photos.length > 0) {
    allPhotos.push(...cafe.photos);
  }
});
console.log(`Collected ${allPhotos.length} photos from real cafes`);

// Function to get random items
const getRandom = (arr, count = 1) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
};

// Generate unique cafe names
const usedNames = new Set(realCafes.map(c => c.name));

function generateCafeName() {
  let name;
  let attempts = 0;
  do {
    const prefix = getRandom(prefixes);
    const theme = getRandom(themes);
    const suffix = getRandom(suffixes);
    name = `${prefix} ${theme} ${suffix}`.replace(/\s+/g, ' ').trim();
    attempts++;
  } while (usedNames.has(name) && attempts < 50);
  usedNames.add(name);
  return name;
}

// Generate cafe data
function generateCafe(index) {
  const name = generateCafeName();
  const baseLocation = {
    lat: 11.94 + (Math.random() - 0.5) * 0.08,
    lng: 108.44 + (Math.random() - 0.5) * 0.08
  };

  // Get 3-5 random photos
  const photoCount = 3 + Math.floor(Math.random() * 3);
  const photos = getRandom(allPhotos, Math.min(photoCount, allPhotos.length));

  // Get 3-5 random reviews
  const reviewCount = 3 + Math.floor(Math.random() * 3);
  const reviews = getRandom(reviewTemplates, reviewCount);

  const rating = (4 + Math.random()).toFixed(1);

  return {
    name,
    description: `${name} - Quán cà phê view đẹp tại Đà Lạt. Không gian ấm cúng giữa rừng thông và sương mù.`,
    address: `${Math.floor(Math.random() * 200) + 1} ${getRandom(areas)}, Đà Lạt, Lâm Đồng`,
    location: {
      type: 'Point',
      coordinates: [baseLocation.lng, baseLocation.lat]
    },
    phone: `0263 ${Math.floor(Math.random() * 9000000) + 1000000}`,
    photos,
    priceRange: getRandom(['$', '$$', '$$$']),
    averageRating: parseFloat(rating),
    totalReviews: Math.floor(Math.random() * 200) + 20,
    features: {
      wifi: Math.random() > 0.1,
      view: Math.random() > 0.3,
      petFriendly: Math.random() > 0.5,
      parking: Math.random() > 0.3,
      outdoor: Math.random() > 0.4,
      aircon: Math.random() > 0.6,
      liveMusic: Math.random() > 0.7
    },
    tags: ['coffee', 'cafe', 'da-lat', getRandom(['cozy', 'scenic', 'vintage', 'modern', 'garden'])],
    reviews
  };
}

// Augment to 100+ cafes
const targetCount = 105;
const additionalNeeded = targetCount - realCafes.length;

console.log(`Need to generate ${additionalNeeded} additional cafes...`);

const generatedCafes = [];
for (let i = 0; i < additionalNeeded; i++) {
  generatedCafes.push(generateCafe(i));
}

// Combine real + generated
const allCafes = [...realCafes, ...generatedCafes];

// Ensure all cafes have at least 3 photos
allCafes.forEach(cafe => {
  while (cafe.photos.length < 3) {
    cafe.photos.push(getRandom(allPhotos));
  }
});

// Save combined data
fs.writeFileSync('./cafes-augmented.json', JSON.stringify(allCafes, null, 2));

const totalReviews = allCafes.reduce((s, c) => s + (c.reviews?.length || 0), 0);
const cafesWithPhotos = allCafes.filter(c => c.photos.length >= 3).length;

console.log(`\n${'='.repeat(50)}`);
console.log(`Total cafes: ${allCafes.length}`);
console.log(`Real cafes: ${realCafes.length}`);
console.log(`Generated cafes: ${generatedCafes.length}`);
console.log(`Cafes with 3+ photos: ${cafesWithPhotos}`);
console.log(`Total reviews: ${totalReviews}`);
console.log(`Saved to: ./cafes-augmented.json`);
