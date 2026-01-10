const mongoose = require("mongoose");
const axios = require("axios"); 
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
    initDB(); 
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Helper function to fetch coordinates
async function getCoordinates(location, country) {
  try {
    const query = `${location}, ${country}`;
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: query, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'WanderlustProject' } // Required by Nominatim
    });

    if (response.data.length > 0) {
      // Nominatim returns [lat, lon], we usually store [lon, lat]
      return [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)];
    }
  } catch (error) {
    console.error(`Could not geocode ${location}:`, error.message);
  }
  return [0, 0]; // Default fallback
}

// Helper to add a small delay between API calls (Nominatim policy: 1 req/sec)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const initDB = async () => {
  await Listing.deleteMany({});
  console.log("Adding coordinates to listings... please wait.");

  const listingsWithCoords = [];
  
  for (let obj of initData.data) {
    const coords = await getCoordinates(obj.location, obj.country);
    listingsWithCoords.push({
      ...obj,
      owner: "69621512a58b47686e7dab4d", // Your provided Owner ID
      coordinates: coords
    });
    await delay(1000); // 1 second delay to stay under free tier limits
  }

  await Listing.insertMany(listingsWithCoords);
  console.log("Data was initialized with coordinates successfully!");
  mongoose.connection.close(); // Close connection when done
};