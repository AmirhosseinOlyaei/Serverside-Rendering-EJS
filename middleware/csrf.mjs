// middleware/csrf.mjs
import csrf from "csurf";

// Initialize CSRF middleware
const csrfProtection = csrf({ cookie: true });

// Middleware to add CSRF token to response locals
const addCsrfToken = (app) => (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

export { csrfProtection, addCsrfToken };
