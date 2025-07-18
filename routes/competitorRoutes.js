const express = require('express');
const router = express.Router();
const competitorController = require('../controllers/competitorController');

router.get('/', competitorController.getAllCompetitors);
router.post('/', competitorController.createCompetitor);
router.put('/:id', competitorController.updateCompetitor);
router.delete('/:id', competitorController.deleteCompetitor);

module.exports = router;