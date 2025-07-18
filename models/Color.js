const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  hexCode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(v);
      },
      message: (props) => `${props.value} is not a valid hex color code! Use format #RRGGBB or #RGB.`,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Color", colorSchema);