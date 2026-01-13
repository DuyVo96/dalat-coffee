# Da Lat Coffee Finder

Find the best coffee shops in Da Lat, Vietnam.

## Features

- Interactive map with cafe locations
- Search and filter by features (WiFi, view, pet-friendly, etc.)
- User reviews and ratings
- Price range filters
- Responsive design

## Tech Stack

- **Frontend**: React, Vite, React-Leaflet, Axios
- **Backend**: Node.js, Express, MongoDB, JWT
- **Maps**: Leaflet with OpenStreetMap

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone and install dependencies**

```bash
cd dalat-coffee

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. **Configure environment**

```bash
# In server directory, edit .env file
MONGODB_URI=mongodb://localhost:27017/dalat-coffee
JWT_SECRET=your-secret-key
PORT=5000
```

3. **Seed the database**

```bash
cd server
npm run seed
```

4. **Start the application**

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

5. **Open the app**

Visit http://localhost:3000

## Test Accounts

After seeding:
- minh@example.com / password123
- linh@example.com / password123
- hoa@example.com / password123

## API Endpoints

### Cafes
- `GET /api/cafes` - List cafes with filters
- `GET /api/cafes/:slug` - Get cafe details
- `GET /api/cafes/map/markers` - Get cafes for map

### Reviews
- `GET /api/reviews/cafe/:cafeId` - Get cafe reviews
- `POST /api/reviews` - Create review (auth required)

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

## Adding More Cafes

1. Edit `scripts/scraper.js` with cafe data
2. Run the scraper to generate JSON
3. Import data using seed script

## Deployment

### Backend (Render/Railway)
1. Set environment variables
2. Deploy server directory

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy client/dist directory

## License

MIT
