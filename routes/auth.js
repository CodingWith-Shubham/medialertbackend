const express = require('express');
const User = require('../modules/User');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetchuser = require('../Middleware/fetchuser');

// Use environment variable for the JWT secret
const jwt_token = "shubhamisgoodboy";

// Register route
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('name').isLength({ min: 5 }).withMessage('Name must be at least 5 characters long'),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
  ],
  async (req, res) => {
    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if the email already exists in the database
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // If no user exists with the email, create a new user
      const user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      const data = { user: { id: user.id } };

      // Generate JWT token
      const authtoken = jwt.sign(data, jwt_token);

      // Send the newly created user as the response
      res.status(201).json({ authtoken });
    } catch (err) {
      // Handle other errors (e.g., database issues)
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').exists().withMessage('Password cannot be blank'),
  ],
  async (req, res) => {
    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    let success = false;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Sorry, user does not exist' });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ success, error: "Sorry, login credentials don't match" });
      }

      const data = { user: { id: user.id } };
      const authtoken = jwt.sign(data, jwt_token);

      // Send the JWT token
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error);
      res.status(500).send('Some error occurred');
    }
  }
);

// Get user route
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select('-password'); // Exclude password
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
