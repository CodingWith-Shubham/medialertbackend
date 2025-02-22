const express = require("express");
const router = express.Router();
const Contact = require("../modules/Contact");
const twilio = require("twilio");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyB12v5NSVWeqpE06gOi0XmNmNRZGdT6xOA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//gemini api :AIzaSyB12v5NSVWeqpE06gOi0XmNmNRZGdT6xOA
// Twilio Configuration
// const geminiApiUrl = "https://api.gemini.com/v1/symptom-checker";
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const twilioPhone = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number
const client = twilio(accountSid, authToken);
router.post("/sosalert", async (req, res) => {
  const { userId,useremail,userlocation } = req.body;

  try {
    // Fetch user contacts from the database
    const userContacts = await Contact.findOne({ userId });

    if (!userContacts || userContacts.contacts.length === 0) {
      return res.status(404).json({ message: "No contacts found for the user." });
    }

    // Twilio API to send messages
    const promises = userContacts.contacts.map((contact) => {
      return client.messages.create({
        body: `Emergency Alert: I am in emergency ,Plz save me .from: ${useremail}, my location:${userlocation}`,
        from: twilioPhone,
        to: contact.phone,
        // url: "http://demo.twilio.com/docs/classic.mp3",
      });
    });

    // Wait for all messages to be sent
    await Promise.all(promises);

    res.status(200).json({ message: "Emergency messages sent successfully!" });
  } catch (error) {
    console.error("Error sending SOS alert:", error);
    res.status(500).json({ message: "Failed to send SOS alert." });
  }
});
router.post("/check", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const userContacts = await Contact.findOne({ userId });
    const contactsExist = userContacts && userContacts.contacts.length > 0;

    res.json({ contactsExist });
  } catch (error) {
    console.error("Error checking contacts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/add", async (req, res) => {
  const { userId, contacts } = req.body;

  if (!userId || !contacts) {
    return res.status(400).json({ error: "User ID and contacts are required." });
  }

  try {
    // Check if user already exists
    let existingContact = await Contact.findOne({ userId });

    if (existingContact) {
      // Update the existing contacts
      existingContact.contacts = contacts;
      await existingContact.save();
      return res.json({ message: "Contacts updated successfully." });
    }

    // Create a new contact document
    const newContact = new Contact({ userId, contacts });
    await newContact.save();

    res.json({ message: "Contacts saved successfully." });
  } catch (error) {
    console.error("Error saving contacts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/symptomchecker", async (req, res) => {
  const userSymptoms = req.body.symptoms; // Get symptoms from request body

  // Validate input
  if (!userSymptoms) {
    return res.status(400).json({ error: "Symptoms are required." });
  }

  try {
    // Format the prompt
    const prompt = `Please analyze the following symptoms and provide possible causes in 50 words: ${userSymptoms}`;

    // Call the Gemini API
    const result = await model.generateContent(prompt);

    // Extract the AI-generated response
    const responseText = result.response.text();

    res.status(200).json({ message: responseText });
  } catch (error) {
    console.error("Error in symptom checker:", error);
    res.status(500).json({ error: "Failed to analyze symptoms." });
  }
});




module.exports = router;
