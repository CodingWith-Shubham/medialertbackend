// index.js
const connectToMongo = require('./db');
require('dotenv').config();
const express = require('express')
var cors = require('cors')
connectToMongo();
const app = express()
const corsOptions = {
  origin: 'https://my-cloud-notes.netlify.app',  // Allow only requests from your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'authtoken'], // Allow specific headers
};

app.use(cors(corsOptions)); // Apply CORS configuration to your app
const port = process.env.PORT || 5000;
app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello World');
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
//myroutes
app.use('/api/auth',require("./routes/auth"))
app.use('/api/notes',require('./routes/notes'))