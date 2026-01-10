const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const defaultImg =
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60";

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:  String,
    filename:String,
  },
  price: Number,
  location: String,
  country: String,
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [0, 0]
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
});

listingSchema.post("findOneAndDelete", async (listing) =>{
  if (listing) {
    await Review.deleteMany({
      _id: {
        $in: listing.reviews,
      },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
