const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const surgeonController =
require("../controllers/surgeonController");

router.put(
  "/profile",
  auth,
  surgeonController.updateProfile
);

module.exports = router;