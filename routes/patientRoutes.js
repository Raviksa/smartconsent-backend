const express = require("express");
const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  createPatient,
  getPatients,
  deletePatient,
  updatePatient
} = require("../controllers/patientController");

router.post(
  "/",
  authMiddleware,
  createPatient
);

router.get(
  "/",
  authMiddleware,
  getPatients
);

router.delete(
  "/:id",
  authMiddleware,
  deletePatient
);

router.put(
  "/:id",
  authMiddleware,
  updatePatient
);

module.exports = router;