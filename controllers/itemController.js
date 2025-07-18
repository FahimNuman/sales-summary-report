
const Item = require("../models/Item");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

exports.createItem = async (req, res) => {
  try {
    const { name, description, category, price, stock } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }
    let image = { url: "", public_id: "" };
    if (req.file) {
      image = await uploadToCloudinary(req.file);
    }
    const newItem = new Item({
      name,
      description: description || "",
      category: category || "",
      price,
      stock: stock || 0,
      image,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Error creating item", error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    let image = item.image;
    if (req.file) {
      image = await uploadToCloudinary(req.file);
    }
    item.name = name;
    item.description = description || item.description;
    item.category = category || item.category;
    item.price = price;
    item.stock = stock || item.stock;
    item.image = image;
    await item.save();
    res.status(200).json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Error updating item", error: error.message });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items || []);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Error fetching items", error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
};