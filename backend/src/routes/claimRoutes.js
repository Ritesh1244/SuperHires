const express = require('express');
const { verifyClaim, getClaims } = require('../controllers/claimController');

const router = express.Router();

router.post('/verify', verifyClaim);
router.get('/', getClaims);

module.exports = router;  // ✅ Ensure you are exporting only the `router`
