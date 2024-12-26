const mongoose = require('mongoose');

const { Schema } = mongoose;

const loginSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // This creates a unique index on the 'email' field automatically
  },
  password: {
    type: String,
    required: true,
  },
});

// No need to explicitly create an index on 'email' since it's already unique
// If you were to add other custom indexes, you would do so here

const User = mongoose.model('user', loginSchema);

module.exports = User;
