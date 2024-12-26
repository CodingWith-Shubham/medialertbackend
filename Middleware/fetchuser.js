const jwt = require('jsonwebtoken');

const fetchuser = (req, res, next) => {
    // Define the secret key used for signing JWT tokens
    const jwt_token = "shubhamisgoodboy";

    // Get token from request headers
    const token = req.header('authtoken');
    if (!token) {
        // If no token is found in the header, respond with an error
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
        // Verify the token using the secret key
        const data = jwt.verify(token, jwt_token);
        // Attach the user info to the request object
        req.user = data.user;
        
        // Call the next middleware or route handler
        next();
    } catch (error) {
        // If there's an error in token verification (e.g., invalid token), respond with an error
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
};

module.exports = fetchuser;
