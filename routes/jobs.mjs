// routes/jobs.mjs
import express from "express";
import ensureAuthenticated from "../middleware/auth.mjs";
import {
  getJobs,
  postNewJob,
  getNewJob,
  getEditJob,
  postEditJob,
  deleteJob,
} from "../controllers/jobs.mjs";
const router = express.Router();

router.get("/jobs", ensureAuthenticated, getJobs);
router.post("/jobs", ensureAuthenticated, postNewJob);
router.get("/jobs/new", ensureAuthenticated, getNewJob);
router.get("/jobs/edit/:id", ensureAuthenticated, getEditJob);
router.post("/jobs/update/:id", ensureAuthenticated, postEditJob);
router.post("/jobs/delete/:id", ensureAuthenticated, deleteJob);

export default router;
