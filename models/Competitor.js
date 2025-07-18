const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  website: { type: String }
});

const competitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contacts: [contactSchema],
  website: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Competitor', competitorSchema);