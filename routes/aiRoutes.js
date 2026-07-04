const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middleware/authMiddleware");
const {
  generateConsent
} =
require(
  "../controllers/aiController"
);

router.post(
  "/generate-consent",
  authMiddleware,
  generateConsent
);

module.exports =
router;