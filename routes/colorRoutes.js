const express = require("express");
const router = express.Router();
const colorController = require("../controllers/colorController");

// Routes for color management
router.get("/", colorController.getColors);
router.post("/", colorController.addColor);
router.put("/:colorId", colorController.updateColor);
router.delete("/:colorId", colorController.deleteColor);

module.exports = router;