const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Cannot find that listing!");
    return res.redirect("/listings");
  }
  //console.log(listing);

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {
    url,
    filename,
  };

  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { 
        q: `${newListing.location}, ${newListing.country}`, 
        format: 'json', 
        limit: 1 
      },
      headers: { 'User-Agent': 'AirbnbCloneProject' }
    });

    if (response.data.length > 0) {
        // Nominatim gives [lat, lon], we store as [lon, lat]
        newListing.coordinates = [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)];
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }

  await newListing.save();
  req.flash("success", "Successfully made a new listing!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  let originalUrl = listing.image.url;
  if (originalUrl.includes("cloudinary")) {
    // Cloudinary Logic
    originalUrl = originalUrl.replace("/upload", "/upload/w_250");
  } else if (originalUrl.includes("unsplash")) {
    // Unsplash Logic: Replace the width parameter (w=800 or similar) with w=250
    originalUrl = originalUrl.replace(/w=\d+/, "w=250");
  }
  res.render("listings/edit.ejs", { listing, originalUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    
    // 1. Update the basic details (title, description, price, location, etc.)
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // 2. Handle Image update (only if a new file is uploaded)
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    // 3. Handle Geocoding (Update coordinates based on the NEW location)
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { 
                q: `${req.body.listing.location}, ${req.body.listing.country}`, 
                format: 'json', 
                limit: 1 
            },
            headers: { 'User-Agent': 'AirbnbCloneProject' }
        });

        if (response.data.length > 0) {
            // Save the new coordinates into the listing object
            listing.coordinates = [
                parseFloat(response.data[0].lon), 
                parseFloat(response.data[0].lat)
            ];
        }
    } catch (err) {
        console.error("Geocoding error during update:", err);
    }

    // 4. Save everything to the database
    await listing.save();
    
    req.flash("success", "Successfully updated listing!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Successfully deletedListing!");
  res.redirect(`/listings`);
};

module.exports.search = async (req, res) => {
    let { country } = req.body;
    console.log(country);
    
    
    const allListings = await Listing.find({ country:{ $regex: country, $options: "i" } });

    if (allListings.length === 0) {
        req.flash("error", `No venues found in "${country}"`);
        return res.redirect("/listings");
    }

    // Reuse the index.ejs to display the results
    res.render("listings/index.ejs", { allListings });
};
