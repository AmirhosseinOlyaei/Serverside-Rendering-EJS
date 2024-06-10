// middleware/csrf.mjs
import csurf from "csurf";

// Initialize CSRF middleware
const csrfProtection = csurf({ cookie: true });

// Middleware to add CSRF token to response locals
const addCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

export { csrfProtection, addCsrfToken };
