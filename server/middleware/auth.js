const jwt = require("jsonwebtoken");

module.exports = function Auth(req, res, next) {
  try {
    // Access the authorization header to validate the request
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Authentication Failed: No token provided" });
    }

    // Retrieve user details for the logged-in user
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    // Attach user detail s to the request object for further use in routes
    req.user = decodedToken; 

    // Proceed with the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Authentication Failed" });
  }
};
