const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  userId: {
    type: String, // Store the user.id from Privy
    required: true,
    unique: true, // Ensure each userId is unique
  },
  contacts: [
    {
      name: { type: String, required: true },
      phone: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Contact", ContactSchema);
