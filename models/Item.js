const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "" },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: {
    url: { type: String, default: "" },
    public_id: { type: String, default: "" },
  },
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item; 