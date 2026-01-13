/**
 * Da Lat Coffee Shop Scraper
 *
 * This script provides a template for scraping coffee shop data.
 * You'll need to customize it based on your data source.
 *
 * Popular sources to scrape:
 * - Google Maps (requires API key or Puppeteer)
 * - Foody.vn
 * - TripAdvisor
 * - Facebook pages
 *
 * Usage: node scraper.js
 */

const fs = require('fs');

// Example: Manual data entry template
// Fill this in with real data from your research

const cafes = [
  {
    name: "Example Cafe",
    description: "Description of the cafe",
    address: "123 Nguyen Van Troi, Da Lat",
    location: {
      type: "Point",
      coordinates: [108.4583, 11.9404] // [longitude, latitude]
    },
    phone: "0263 123 4567",
    photos: ["https://example.com/photo.jpg"],
    priceRange: "$$",
    features: {
      wifi: true,
      view: true,
      petFriendly: false,
      parking: true,
      aircon: false,
      outdoor: true,
      liveMusic: false
    },
    openingHours: {
      monday: { open: "07:00", close: "22:00" },
      tuesday: { open: "07:00", close: "22:00" },
      wednesday: { open: "07:00", close: "22:00" },
      thursday: { open: "07:00", close: "22:00" },
      friday: { open: "07:00", close: "22:00" },
      saturday: { open: "07:00", close: "23:00" },
      sunday: { open: "07:00", close: "23:00" }
    },
    tags: ["coffee", "view", "chill"]
  }
];

// Save to JSON file for seeding
fs.writeFileSync(
  './cafes-data.json',
  JSON.stringify(cafes, null, 2)
);

console.log(`Saved ${cafes.length} cafes to cafes-data.json`);
console.log('Run "npm run seed" in the server directory to import this data.');

/*
 * For automated scraping with Puppeteer, uncomment and customize:
 *
 * const puppeteer = require('puppeteer');
 *
 * async function scrapeFromGoogleMaps() {
 *   const browser = await puppeteer.launch({ headless: true });
 *   const page = await browser.newPage();
 *
 *   await page.goto('https://www.google.com/maps/search/coffee+da+lat');
 *   // Add your scraping logic here
 *
 *   await browser.close();
 * }
 *
 * scrapeFromGoogleMaps();
 */
