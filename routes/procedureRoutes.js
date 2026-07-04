const express =
require("express");

const router =
express.Router();

const {
  createProcedure,
  getProcedures,
  deleteProcedure,
  updateProcedure
} =
require(
"../controllers/procedureController"
);

router.post(
  "/",
  createProcedure
);

router.get(
  "/",
  getProcedures
);

router.delete(
  "/:id",
  deleteProcedure
);

router.put(
  "/:id",
  updateProcedure
);

module.exports =
router;