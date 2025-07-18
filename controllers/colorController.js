const express = require("express");
const router = express.Router();
const Color = require("../models/Color");
// Get all colors
exports.getColors = async (req, res) => {
  try {
    const colors = await Color.find();
    res.status(200).json(colors || []);
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ message: "Error fetching colors", error });
  }
};

// Add a new color
exports.addColor = async (req, res) => {
  try {
    const { name, hexCode } = req.body;
    if (!name || !hexCode) {
      return res.status(400).json({ message: "Color name and hex code are required" });
    }
    const newColor = new Color({
      name: name.trim(),
      hexCode: hexCode.trim(),
    });
    await newColor.save();
    res.status(201).json(newColor);
  } catch (error) {
    console.error("Error adding color:", error);
    res.status(500).json({ message: "Error adding color", error });
  }
};

// Update a color
exports.updateColor = async (req, res) => {
  try {
    const { colorId } = req.params;
    const { name, hexCode } = req.body;

    if (!name || !hexCode) {
      return res.status(400).json({ message: "Color name and hex code are required" });
    }

    const color = await Color.findById(colorId);
    if (!color) return res.status(404).json({ message: "Color not found" });

    color.name = name.trim();
    color.hexCode = hexCode.trim();

    await color.save();
    res.status(200).json(color);
  } catch (error) {
    console.error("Error updating color:", error);
    res.status(500).json({ message: "Error updating color", error });
  }
};

// Delete a color
exports.deleteColor = async (req, res) => {
  try {
    const { colorId } = req.params;
    const color = await Color.findByIdAndDelete(colorId);
    if (!color) return res.status(404).json({ message: "Color not found" });

    // Optional: Update entries to remove references to this color
    await Sheet.updateMany(
      { "data.color": colorId },
      { $set: { "data.$[].color": null } }
    );

    res.status(200).json({ message: "Color deleted successfully" });
  } catch (error) {
    console.error("Error deleting color:", error);
    res.status(500).json({ message: "Error deleting color", error });
  }
};