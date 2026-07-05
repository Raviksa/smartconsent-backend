const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  getStats,
  getRecentConsents
} =
require("../controllers/dashboardController");

router.get(
  "/stats",
  authMiddleware,
  getStats
);

router.get(
  "/recent-consents",
  authMiddleware,
  getRecentConsents
);

module.exports =
router;