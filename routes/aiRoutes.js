const express =
require("express");

const router =
express.Router();

const {
  generateConsent
} =
require(
  "../controllers/aiController"
);

router.post(
  "/generate-consent",
  generateConsent
);

module.exports =
router;