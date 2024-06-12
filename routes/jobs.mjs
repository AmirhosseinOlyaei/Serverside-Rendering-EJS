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

router.get("/", ensureAuthenticated, getJobs);
router.post("/", ensureAuthenticated, postNewJob);
router.get("/new", ensureAuthenticated, getNewJob);
router.get("/edit/:id", ensureAuthenticated, getEditJob);
router.post("/update/:id", ensureAuthenticated, postEditJob);
router.post("/delete/:id", ensureAuthenticated, deleteJob);

export default router;
