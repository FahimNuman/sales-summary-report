const Competitor = require('../models/Competitor');

// Get all competitors
exports.getAllCompetitors = async (req, res) => {
  try {
    const competitors = await Competitor.find();
    res.status(200).json(competitors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching competitors', error: error.message });
  }
};

// Create a new competitor
exports.createCompetitor = async (req, res) => {
  try {
    const { name, address, contacts, website, notes } = req.body;
    if (!name || !address) {
      return res.status(400).json({ message: 'Name and address are required' });
    }
    const competitor = new Competitor({ name, address, contacts, website, notes });
    const newCompetitor = await competitor.save();
    res.status(201).json(newCompetitor);
  } catch (error) {
    res.status(400).json({ message: 'Error creating competitor', error: error.message });
  }
};

// Update a competitor
exports.updateCompetitor = async (req, res) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    if (!competitor) {
      return res.status(404).json({ message: 'Competitor not found' });
    }
    const { name, address, contacts, website, notes } = req.body;
    competitor.name = name || competitor.name;
    competitor.address = address || competitor.address;
    competitor.contacts = contacts || competitor.contacts;
    competitor.website = website || competitor.website;
    competitor.notes = notes || competitor.notes;
    const updatedCompetitor = await competitor.save();
    res.status(200).json(updatedCompetitor);
  } catch (error) {
    res.status(400).json({ message: 'Error updating competitor', error: error.message });
  }
};

// Delete a competitor
exports.deleteCompetitor = async (req, res) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    if (!competitor) {
      return res.status(404).json({ message: 'Competitor not found' });
    }
    await competitor.deleteOne();
    res.status(200).json({ message: 'Competitor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting competitor', error: error.message });
  }
};