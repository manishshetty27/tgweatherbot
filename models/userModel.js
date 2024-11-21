const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  chatId: { type: Number, required: true, unique: true },
  name: { type: String },
});

module.exports = mongoose.model("User", userSchema);
