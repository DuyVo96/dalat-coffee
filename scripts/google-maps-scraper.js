const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Multiple search queries to get more results
const SEARCH_QUERIES = [
  'cafe+da+lat',
  'quan+ca+phe+da+lat',
  'coffee+shop+dalat',
  'tiệm+cà+phê+đà+lạt',
  'cafe+view+đà+lạt',
  'cafe+pho+co+da+lat',
  'cafe+hồ+xuân+hương',
  'cafe+đường+trần+phú+đà+lạt',
  'quán+cafe+đẹp+đà+lạt',
  'cafe+rooftop+dalat',
  'cafe+sân+vườn+đà+lạt',
  'cafe+đồi+đà+lạt',
  'specialty+coffee+dalat',
  'cafe+vintage+đà+lạt',
  'cafe+acoustic+đà+lạt'
];

async function scrapeGoogleMaps() {
  console.log('Starting Google Maps scraper (100+ cafes with images)...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--lang=vi-VN']
  });

  const page = await browser.newPage();
  const allCafes = new Map(); // Use Map to avoid duplicates

  for (const query of SEARCH_QUERIES) {
    const searchUrl = `https://www.google.com/maps/search/${query}/@11.9404,108.4378,13z`;
    console.log(`\n🔍 Searching: ${query}`);

    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(3000);

    // Scroll to load more results
    for (let i = 0; i < 20; i++) {
      await page.evaluate(() => {
        const feed = document.querySelector('[role="feed"]');
        if (feed) feed.scrollTop += 1000;
      });
      await sleep(1000);

      const count = await page.evaluate(() => {
        return document.querySelectorAll('a[href*="/maps/place/"]').length;
      });

      if (i % 5 === 0) console.log(`  Found ${count} results...`);
      if (count >= 60) break;
    }

    // Get place links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="/maps/place/"]'))
        .map(a => a.href)
        .filter((v, i, arr) => arr.indexOf(v) === i);
    });

    console.log(`  Got ${links.length} unique links`);

    // Scrape each cafe
    for (let i = 0; i < Math.min(links.length, 30); i++) {
      const link = links[i];

      // Skip if already scraped
      if (allCafes.has(link)) continue;

      try {
        await page.goto(link, { waitUntil: 'networkidle0', timeout: 20000 });
        await sleep(1500);

        const currentUrl = page.url();
        const coordMatch = currentUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

        if (!coordMatch) continue;

        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);

        // Skip if not in Da Lat area
        if (lat < 11.85 || lat > 12.05 || lng < 108.35 || lng > 108.55) continue;

        // Get basic info
        const cafeData = await page.evaluate(() => {
          const name = document.querySelector('h1')?.innerText?.trim();

          let rating = 0;
          const ratingEl = document.querySelector('span[aria-hidden="true"]');
          if (ratingEl) {
            const match = ratingEl.innerText.match(/[\d,\.]+/);
            if (match) rating = parseFloat(match[0].replace(',', '.'));
          }

          let reviewCount = 0;
          const text = document.body.innerText;
          const reviewMatch = text.match(/([\d\.,]+)\s*(đánh giá|reviews)/i);
          if (reviewMatch) reviewCount = parseInt(reviewMatch[1].replace(/[\.,]/g, ''));

          let address = '';
          const addrBtn = document.querySelector('[data-item-id="address"]');
          if (addrBtn) address = addrBtn.innerText.replace(/^[^\w]+/, '').trim();

          let phone = '';
          const phoneBtn = document.querySelector('[data-item-id^="phone:"]');
          if (phoneBtn) phone = phoneBtn.innerText.replace(/[^\d\s+]/g, '').trim();

          return { name, rating, reviewCount, address, phone };
        });

        if (!cafeData.name) continue;

        // Get multiple photos - click on photos section
        let photos = [];
        try {
          // Click on first photo to open gallery
          const photoClicked = await page.evaluate(() => {
            const photoBtn = document.querySelector('button[aria-label*="ảnh"]') ||
                            document.querySelector('button[aria-label*="photo"]') ||
                            document.querySelector('img[decoding="async"]')?.closest('button');
            if (photoBtn) { photoBtn.click(); return true; }
            return false;
          });

          if (photoClicked) {
            await sleep(2000);

            // Get photos from gallery
            photos = await page.evaluate(() => {
              const imgs = document.querySelectorAll('img[src*="googleusercontent"]');
              const urls = [];
              imgs.forEach(img => {
                if (img.src && img.src.includes('googleusercontent') && !img.src.includes('=s')) {
                  // Get higher resolution
                  let url = img.src.replace(/=w\d+-h\d+/, '=w800-h600');
                  if (!url.includes('=w')) url += '=w800-h600';
                  urls.push(url);
                }
              });
              return [...new Set(urls)].slice(0, 5);
            });

            // Go back
            await page.goBack({ waitUntil: 'networkidle0' });
            await sleep(1000);
          }
        } catch (e) {}

        // If no photos from gallery, get main photo
        if (photos.length === 0) {
          const mainPhoto = await page.evaluate(() => {
            const img = document.querySelector('img[src*="googleusercontent"][decoding="async"]');
            return img?.src || '';
          });
          if (mainPhoto) photos.push(mainPhoto);
        }

        // Get reviews
        const reviews = [];
        try {
          const tabClicked = await page.evaluate(() => {
            const tabs = document.querySelectorAll('button[role="tab"]');
            for (const tab of tabs) {
              if (tab.innerText.includes('đánh giá') || tab.innerText.includes('Reviews')) {
                tab.click();
                return true;
              }
            }
            return false;
          });

          if (tabClicked) {
            await sleep(2000);

            // Scroll reviews
            for (let j = 0; j < 3; j++) {
              await page.evaluate(() => {
                const main = document.querySelector('div[role="main"]');
                if (main) main.scrollTop += 500;
              });
              await sleep(600);
            }

            const extracted = await page.evaluate(() => {
              const els = document.querySelectorAll('[data-review-id]');
              const results = [];
              els.forEach(el => {
                try {
                  const nameEl = el.querySelector('div[class*="fontHeadlineSmall"]');
                  const textEl = el.querySelector('span[class*="wiI7pd"]');
                  const ratingEl = el.querySelector('span[role="img"]');

                  let name = nameEl?.innerText?.split('\n')[0] || 'Khách';
                  let comment = textEl?.innerText?.trim() || '';
                  let rating = 5;

                  if (ratingEl) {
                    const match = ratingEl.getAttribute('aria-label')?.match(/(\d)/);
                    if (match) rating = parseInt(match[1]);
                  }

                  if (comment.length > 10) {
                    results.push({ reviewerName: name.substring(0, 50), comment: comment.substring(0, 500), rating });
                  }
                } catch (e) {}
              });
              return results.slice(0, 5);
            });

            reviews.push(...extracted);
          }
        } catch (e) {}

        allCafes.set(link, {
          name: cafeData.name,
          description: `${cafeData.name} - Quán cà phê tại Đà Lạt`,
          address: cafeData.address || 'Đà Lạt, Lâm Đồng',
          location: { type: 'Point', coordinates: [lng, lat] },
          phone: cafeData.phone,
          photos: photos,
          priceRange: '$$',
          averageRating: cafeData.rating || 4.0,
          totalReviews: cafeData.reviewCount || reviews.length,
          features: {
            wifi: true,
            view: cafeData.name.toLowerCase().includes('view'),
            petFriendly: Math.random() > 0.6,
            parking: Math.random() > 0.4,
            outdoor: Math.random() > 0.5,
            aircon: Math.random() > 0.5,
            liveMusic: cafeData.name.toLowerCase().includes('acoustic')
          },
          tags: ['coffee', 'cafe', 'da-lat'],
          reviews: reviews
        });

        console.log(`  ✓ ${cafeData.name} (${photos.length} photos, ${reviews.length} reviews)`);

      } catch (err) {
        // Skip errors
      }

      // Check total
      if (allCafes.size >= 110) break;
    }

    if (allCafes.size >= 110) break;
  }

  await browser.close();

  const cafes = Array.from(allCafes.values());

  // Save results
  fs.writeFileSync('./cafes-real-data.json', JSON.stringify(cafes, null, 2));

  const totalReviews = cafes.reduce((s, c) => s + c.reviews.length, 0);
  const avgPhotos = (cafes.reduce((s, c) => s + c.photos.length, 0) / cafes.length).toFixed(1);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Scraped ${cafes.length} cafes!`);
  console.log(`📷 Average ${avgPhotos} photos per cafe`);
  console.log(`💬 Total ${totalReviews} reviews`);
  console.log(`📁 Saved to: ./cafes-real-data.json`);

  return cafes;
}

scrapeGoogleMaps().catch(console.error);
