const express = require('express');
const { performResearch } = require('../controllers/researchController');
const { getLeaderboard } = require("../controllers/leaderboardController");

const router = express.Router();

router.post('/', performResearch); // Main research endpoint
router.get("/", getLeaderboard);
module.exports = router;
