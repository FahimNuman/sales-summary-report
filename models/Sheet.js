const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  order: { type: Number, required: true },
  storeName: { type: String, required: true },
  address: { type: String, default: "" },
  personnel: { type: String, default: "" },
  insight: { type: String, default: "" },
  competitorAnalysis: {
    competitor: { type: mongoose.Schema.Types.ObjectId, ref: "Competitor", required: false },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: false },
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    name: { type: String, default: "" },
    color: { type: mongoose.Schema.Types.ObjectId, ref: "Color", required: false },
  },
  validation: { type: String, default: "" },
  files: [
    {
      name: { type: String, default: "" },
      url: { type: String, default: "" },
      size: { type: Number, default: 0 },
      type: { type: String, default: "" },
    },
  ],
  validationNotes: { type: String, default: "" },
});

const contactSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  website: { type: String, required: false },
});

const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: false },
  address1: { type: String, required: false },
  address2: { type: String, default: "" },
  personnel: [{ type: String }],
  contacts: [contactSchema],
  building:{ type: String, default: "" },
  city:{ type: String, default: "" },
  state:{ type: String, default: "" },
  zip:{ type: String, default: "" },
  country:{ type: String, default: "" },
});

const sheetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  hours: { type: String, default: "9:00 AM - 7:00 PM" },
  data: [entrySchema],
});

module.exports = {
  Sheet: mongoose.model("Sheet", sheetSchema),
  Store: mongoose.model("Store", storeSchema),
};