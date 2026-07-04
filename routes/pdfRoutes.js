const express =
require("express");

const router =
express.Router();
const authMiddleware =
require("../middleware/authMiddleware");
const {
  generatePdf
} =
require(
  "../controllers/pdfController"
);

router.post(
  "/generate",
  authMiddleware,
  generatePdf
);

module.exports =
router;