const express = require("express");
const router = express.Router();

const {
  createPatient,
  getPatients,
  deletePatient,
  updatePatient
} = require("../controllers/patientController");

router.post(
  "/",
  createPatient
);

router.get(
  "/",
  getPatients
);

router.delete(
  "/:id",
  deletePatient
);

router.put(
  "/:id",
  updatePatient
);

module.exports = router;