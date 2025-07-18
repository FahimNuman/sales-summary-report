const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Stores file in memory

router.get('/', itemController.getAllItems);
router.post('/', upload.single('image'), itemController.createItem); // 'image' matches the FormData field name
router.put('/:id', upload.single('image'), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;