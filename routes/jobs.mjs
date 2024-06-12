// routes/jobs.mjs
import express from "express";
import ensureAuthenticated from "../middleware/auth.mjs";
import {
  getJobs,
  getNewJob,
  postNewJob,
  getEditJob,
  postEditJob,
  deleteJob,
} from "../controllers/jobs.mjs";

const router = express.Router();

// Get all jobs
router.get("/", ensureAuthenticated, getJobs);

// Get form for new job
router.get("/new", ensureAuthenticated, getNewJob);

// Create a new job
router.post("/", ensureAuthenticated, postNewJob);

// Get form for editing a job
router.get("/edit/:id", ensureAuthenticated, getEditJob);

// Update a job
router.post("/edit/:id", ensureAuthenticated, postEditJob);

// Delete a job
router.post("/delete/:id", ensureAuthenticated, deleteJob);

export default router;
