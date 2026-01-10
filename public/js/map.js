// public/js/map.js

// 1. Initialize map using coordinates from the database
// coords is [lon, lat], but Leaflet needs [lat, lon]
const map = L.map('map').setView([coords[1], coords[0]], 11); 

// 2. Add Tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// 3. Add Marker immediately (No fetch needed!)
L.marker([coords[1], coords[0]]).addTo(map)
    .bindPopup(`<b>${listingTitle}</b><br>${locationName}`)
    .openPopup();