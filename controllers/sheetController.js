const { Sheet, Store } = require("../models/Sheet");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const Competitor = require("../models/Competitor");
const Item = require("../models/Item");
const Color = require("../models/Color");

// Get all sheets
exports.getSheets = async (req, res) => {
  try {
    const sheets = await Sheet.find()
      .populate({
        path: "data.competitorAnalysis.competitor",
        select: "name",
      })
      .populate({
        path: "data.competitorAnalysis.item",
        select: "name image",
      })
      .populate({
        path: "data.competitorAnalysis.color",
        select: "name hexCode",
      });
    console.log("Returning sheets:", sheets);
    res.status(200).json(sheets || []);
  } catch (error) {
    console.error("Error fetching sheets:", error);
    res.status(500).json({ message: "Error fetching sheets", error });
  }
};

// Create a new sheet
exports.createSheet = async (req, res) => {
  try {
    const { name, hours } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Sheet name is required and must be a non-empty string" });
    }

    const newSheet = new Sheet({
      name: name.trim(),
      hours: hours || "9:00 AM - 7:00 PM",
      date: new Date(),
      data: [],
    });

    await newSheet.save();
    res.status(201).json(newSheet);
  } catch (error) {
    console.error("Error creating sheet:", error);
    res.status(500).json({ message: "Error creating sheet", error });
  }
};

// Update a sheet
exports.updateSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { name, hours } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Sheet name is required and must be a non-empty string" });
    }

    const sheet = await Sheet.findById(sheetId);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    sheet.name = name.trim();
    sheet.hours = hours || sheet.hours;
    await sheet.save();

    res.status(200).json(sheet);
  } catch (error) {
    console.error("Error updating sheet:", error);
    res.status(500).json({ message: "Error updating sheet", error });
  }
};

// Delete a sheet
exports.deleteSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const sheet = await Sheet.findByIdAndDelete(sheetId);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });
    res.status(200).json({ message: "Sheet deleted successfully" });
  } catch (error) {
    console.error("Error deleting sheet:", error);
    res.status(500).json({ message: "Error deleting sheet", error });
  }
};

// Add a new entry to a sheet
exports.addEntry = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { storeName, address, personnel, insight, competitorAnalysis, validation, files, validationNotes } = req.body;

    if (!storeName) return res.status(400).json({ message: "Store name is required" });

    const sheet = await Sheet.findById(sheetId);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    // Initialize competitorAnalysis data
    let competitorAnalysisData = {
      competitor: null,
      item: null,
      image: { url: "", public_id: "" },
      name: "",
      color: null,
    };

    // Validate competitorAnalysis fields
    if (competitorAnalysis) {
      if (competitorAnalysis.competitor && !mongoose.Types.ObjectId.isValid(competitorAnalysis.competitor)) {
        return res.status(400).json({ message: "Invalid competitor ID" });
      }
      if (competitorAnalysis.item && !mongoose.Types.ObjectId.isValid(competitorAnalysis.item)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      if (competitorAnalysis.color && !mongoose.Types.ObjectId.isValid(competitorAnalysis.color)) {
        return res.status(400).json({ message: "Invalid color ID" });
      }

      // Fetch the referenced Item to get its image
      let itemImage = { url: "", public_id: "" };
      if (competitorAnalysis.item) {
        const item = await Item.findById(competitorAnalysis.item);
        if (item && item.image) {
          itemImage = {
            url: item.image.url || "",
            public_id: item.image.public_id || "",
          };
        }
      }

      competitorAnalysisData = {
        competitor: competitorAnalysis.competitor || null,
        item: competitorAnalysis.item || null,
        image: itemImage,
        name: competitorAnalysis.name || "",
        color: competitorAnalysis.color || null,
      };
    }

    const processedFiles = Array.isArray(files)
      ? files.map((file) => ({
          name: file.name || "",
          url: file.url || "",
          size: file.size || 0,
          type: file.type || "",
        }))
      : [];

    const newEntry = {
      _id: new mongoose.Types.ObjectId(),
      order: sheet.data.length + 1,
      storeName,
      address: address || "",
      personnel: personnel || "",
      insight: insight || "",
      competitorAnalysis: competitorAnalysisData,
      validation: validation || "",
      files: processedFiles,
      validationNotes: validationNotes || "",
    };

    sheet.data.push(newEntry);
    await sheet.save();

    // Populate the newly created entry
    const populatedSheet = await Sheet.findById(sheetId)
      .populate({
        path: "data.competitorAnalysis.competitor",
        select: "name",
      })
      .populate({
        path: "data.competitorAnalysis.item",
        select: "name image",
      })
      .populate({
        path: "data.competitorAnalysis.color",
        select: "name hexCode",
      });

    const addedEntry = populatedSheet.data.find((entry) => entry._id.toString() === newEntry._id.toString());
    res.status(201).json(addedEntry);
  } catch (error) {
    console.error("Error adding entry:", error);
    res.status(500).json({ message: "Error adding entry", error });
  }
};

// Update an entry in a sheet
exports.updateEntry = async (req, res) => {
  try {
    const { sheetId, entryId } = req.params;
    const { storeName, address, personnel, insight, competitorAnalysis, validation, files, validationNotes } = req.body;

    if (!storeName) return res.status(400).json({ message: "Store name is required" });

    const sheet = await Sheet.findById(sheetId);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    const entry = sheet.data.id(entryId);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Validate competitorAnalysis fields
    if (competitorAnalysis) {
      if (competitorAnalysis.competitor && !mongoose.Types.ObjectId.isValid(competitorAnalysis.competitor)) {
        return res.status(400).json({ message: "Invalid competitor ID" });
      }
      if (competitorAnalysis.item && !mongoose.Types.ObjectId.isValid(competitorAnalysis.item)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      if (competitorAnalysis.color && !mongoose.Types.ObjectId.isValid(competitorAnalysis.color)) {
        return res.status(400).json({ message: "Invalid color ID" });
      }

      // Fetch the referenced Item to get its image
      let itemImage = entry.competitorAnalysis.image || { url: "", public_id: "" };
      if (competitorAnalysis.item && competitorAnalysis.item !== entry.competitorAnalysis.item) {
        const item = await Item.findById(competitorAnalysis.item);
        if (item && item.image) {
          itemImage = {
            url: item.image.url || "",
            public_id: item.image.public_id || "",
          };
        }
      }

      entry.competitorAnalysis = {
        competitor: competitorAnalysis.competitor || entry.competitorAnalysis.competitor,
        item: competitorAnalysis.item || entry.competitorAnalysis.item,
        image: itemImage,
        name: competitorAnalysis.name || entry.competitorAnalysis.name,
        color: competitorAnalysis.color || entry.competitorAnalysis.color,
      };
    }

    entry.storeName = storeName || entry.storeName;
    entry.address = address || "";
    entry.personnel = personnel || "";
    entry.insight = insight || "";
    entry.validation = validation || "";
    entry.validationNotes = validationNotes || "";
    entry.files = Array.isArray(files)
      ? files.map((file) => ({
          name: file.name || "",
          url: file.url || "",
          size: file.size || 0,
          type: file.type || "",
        }))
      : entry.files;

    await sheet.save();

    // Populate the updated entry
    const populatedSheet = await Sheet.findById(sheetId)
      .populate({
        path: "data.competitorAnalysis.competitor",
        select: "name",
      })
      .populate({
        path: "data.competitorAnalysis.item",
        select: "name image",
      })
      .populate({
        path: "data.competitorAnalysis.color",
        select: "name hexCode",
      });

    const updatedEntry = populatedSheet.data.find((entry) => entry._id.toString() === entryId);
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error("Error updating entry:", error);
    res.status(500).json({ message: "Error updating entry", error });
  }
};

// Delete an entry from a sheet
exports.deleteEntry = async (req, res) => {
  try {
    const { sheetId, entryId } = req.params;

    const sheet = await Sheet.findById(sheetId);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    const entry = sheet.data.id(entryId);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // No need to delete image from Cloudinary, as it's tied to the Item
    sheet.data.pull({ _id: entryId });

    sheet.data.forEach((entry, index) => {
      entry.order = index + 1;
    });

    await sheet.save();
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ message: "Error deleting entry", error });
  }
};

// Export a single sheet to CSV
exports.exportSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const sheet = await Sheet.findById(sheetId)
      .populate({
        path: "data.competitorAnalysis.competitor",
        select: "name",
      })
      .populate({
        path: "data.competitorAnalysis.item",
        select: "name image",
      })
      .populate({
        path: "data.competitorAnalysis.color",
        select: "name hexCode",
      });

    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    const headers = [
      "Order",
      "Store Name",
      "Address",
      "Personnel",
      "Insight",
      "Competitor",
      "Item",
      "Image URL",
      "Name",
      "Color",
      "Validation",
      "Files",
      "Validation Notes",
    ];
    const csvContent = [
      `Report: ${sheet.name}`,
      `Hours: ${sheet.hours}`,
      "",
      headers.join(","),
      ...sheet.data.map((row) =>
        [
          row.order,
          row.storeName,
          row.address,
          row.personnel,
          row.insight,
          row.competitorAnalysis.competitor ? row.competitorAnalysis.competitor.name : "",
          row.competitorAnalysis.item ? row.competitorAnalysis.item.name : "",
          row.competitorAnalysis.image.url || "",
          row.competitorAnalysis.name || "",
          row.competitorAnalysis.color ? `${row.competitorAnalysis.color.name} (${row.competitorAnalysis.color.hexCode})` : "",
          row.validation,
          row.files.map((f) => f.name).join(";") || "",
          row.validationNotes || "",
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${sheet.name.replace(/[^a-zA-Z0-9]/g, "_")}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting sheet:", error);
    res.status(500).json({ message: "Error exporting sheet", error });
  }
};

// Export all sheets to Excel
exports.exportAllSheets = async (req, res) => {
  try {
    const sheets = await Sheet.find()
      .populate({
        path: "data.competitorAnalysis.competitor",
        select: "name",
      })
      .populate({
        path: "data.competitorAnalysis.item",
        select: "name image",
      })
      .populate({
        path: "data.competitorAnalysis.color",
        select: "name hexCode",
      });

    if (!sheets.length) {
      return res.status(404).json({ message: "No sheets found" });
    }

    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      const headers = [
        "Order",
        "Store Name",
        "Address",
        "Personnel",
        "Insight",
        "Competitor",
        "Item",
        "Image URL",
        "Name",
        "Color",
        "Validation",
        "Files",
        "Validation Notes",
      ];

      const dataRows = sheet.data.map((row) => [
        row.order,
        row.storeName,
        row.address,
        row.personnel,
        row.insight,
        row.competitorAnalysis.competitor ? row.competitorAnalysis.competitor.name : "",
        row.competitorAnalysis.item ? row.competitorAnalysis.item.name : "",
        row.competitorAnalysis.image.url || "",
        row.competitorAnalysis.name || "",
        row.competitorAnalysis.color ? `${row.competitorAnalysis.color.name} (${row.competitorAnalysis.color.hexCode})` : "",
        row.validation,
        row.files.map((f) => f.name).join(";") || "",
        row.validationNotes || "",
      ]);

      const worksheetData = [headers, ...dataRows];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      XLSX.utils.sheet_add_aoa(worksheet, [[`Report: ${sheet.name}`]], { origin: "A1" });
      XLSX.utils.sheet_add_aoa(worksheet, [[`Hours: ${sheet.hours}`]], { origin: "A2" });
      XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: "A3" });
      XLSX.utils.sheet_add_aoa(worksheet, worksheetData, { origin: "A4" });

      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31).replace(/[\/\?\*\[\]]/g, ""));
    });

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader("Content-Disposition", "attachment; filename=All_Sheets.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.status(200).send(excelBuffer);
  } catch (error) {
    console.error("Error exporting all sheets:", error);
    res.status(500).json({ message: "Error exporting all sheets", error });
  }
};

// Get all stores
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find();
    console.log("Stores fetched:", stores);
    res.status(200).json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching stores", error: error.message });
  }
};

// Add a new store
exports.addStore = async (req, res) => {
  try {
    const { storeName, address1, address2, personnel, contacts, building, city, state, zip, country } = req.body;
    console.log("Received store data:", { storeName, address1, address2, personnel, contacts, building, city, state, zip, country });

    // Validate required fields
    if (!storeName || !address1) {
      return res.status(400).json({ message: "Store name and primary address are required" });
    }

    // Validate contacts
    if (contacts && contacts.length > 0) {
      for (const contact of contacts) {
        if (!contact.personName) {
          return res.status(400).json({ message: "Contact personName is required for all contacts" });
        }
      }
    }

    // Create new store
    const newStore = new Store({
      storeName,
      address1,
      address2: address2 || "",
      personnel: personnel ? personnel.filter((p) => p && p !== "Staff") : [],
      contacts: contacts || [],
      building: building || "",
      city: city || "",
      state: state || "",
      zip: zip || "",
      country: country || "",
    });

    await newStore.save();
    console.log("Store saved:", newStore);

    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error adding store:", error.message, error.stack);
    res.status(500).json({ message: "Error adding store", error: error.message });
  }
};

// Update a store
exports.updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { storeName, address1, address2, personnel, contacts, building, city, state, zip, country } = req.body;

    // Validate required fields
    if (!storeName || !address1) {
      return res.status(400).json({ message: "Store name and primary address are required" });
    }

    // Validate contacts
    if (contacts && contacts.length > 0) {
      for (const contact of contacts) {
        if (!contact.personName) {
          return res.status(400).json({ message: "Contact personName is required for all contacts" });
        }
      }
    }

    // Find the store
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    // Update fields
    store.storeName = storeName;
    store.address1 = address1;
    store.address2 = address2 || store.address2 || "";
    store.personnel = personnel ? personnel.filter((p) => p && p !== "Staff") : store.personnel;
    store.contacts = contacts || store.contacts;
    store.building = building || store.building || "";
    store.city = city || store.city || "";
    store.state = state || store.state || "";
    store.zip = zip || store.zip || "";
    store.country = country || store.country || "";

    // Save the updated store
    await store.save();

    res.status(200).json(store);
  } catch (error) {
    console.error("Error updating store:", error);
    res.status(500).json({ message: "Error updating store", error: error.message });
  }
};

// Delete a store
exports.deleteStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Validate storeId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ message: "Invalid store ID" });
    }

    // Find and delete the store
    const store = await Store.findByIdAndDelete(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Error deleting store:", error.message, error.stack);
    res.status(500).json({ message: "Error deleting store", error: error.message });
  }
};
// Get dropdown data for competitorAnalysis
exports.getDropdownData = async (req, res) => {
  try {
    const competitors = await Competitor.find({}, "name");
    const items = await Item.find({}, "name image");
    const colors = await Color.find({}, "name hexCode");

    res.status(200).json({
      competitors,
      items,
      colors,
    });
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    res.status(500).json({ message: "Error fetching dropdown data", error });
  }
};