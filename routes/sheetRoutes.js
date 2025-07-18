const express = require("express");
const router = express.Router();
const sheetController = require("../controllers/sheetController");

router.get("/", sheetController.getSheets);
router.post("/", sheetController.createSheet);
router.put("/:sheetId", sheetController.updateSheet);
router.delete("/:sheetId", sheetController.deleteSheet);
router.post("/:sheetId/entries", sheetController.addEntry);
router.put("/:sheetId/entries/:entryId", sheetController.updateEntry);
router.delete("/:sheetId/entries/:entryId", sheetController.deleteEntry);
router.get("/:sheetId/export", sheetController.exportSheet);
router.get("/export/all", sheetController.exportAllSheets);
router.get("/stores", sheetController.getStores);
router.post("/stores", sheetController.addStore);
router.put("/stores/:storeId", sheetController.updateStore);
router.delete("/stores/:storeId", sheetController.deleteStore);
router.get("/dropdown-data", sheetController.getDropdownData);
router.get("/competitor-analysis-options", sheetController.getDropdownData);

module.exports = router;