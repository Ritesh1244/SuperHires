const express = require("express");
const { getInfluencerDetails } = require("../controllers/influencerController");

const router = express.Router();

// Route to fetch influencer details
router.get("/:handle", getInfluencerDetails);

module.exports = router;
