// controllers/jobs.mjs
import Job from "../models/Job.mjs";
import parseVErr from "../util/parseValidationErrs.mjs";

// Retrieve all jobs for the logged-in user
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.render("jobs", { jobs });
  } catch (err) {
    req.flash("error", "Error fetching jobs.");
    res.redirect("/jobs");
  }
};

// Render form for creating a new job
const getNewJob = (req, res) => {
  res.render("job", { job: {}, errors: [] });
};

// Handle job creation
const postNewJob = async (req, res) => {
  const newJob = new Job({ ...req.body, createdBy: req.user._id });
  try {
    await newJob.save();
    req.flash("success", "Job created successfully!");
    res.redirect("/jobs");
  } catch (err) {
    if (err.name === "ValidationError") {
      parseVErr(err, req);
    } else {
      req.flash("error", "Error creating job.");
    }
    res.render("job", { job: newJob, errors: req.flash("error") });
  }
};

// Render form for editing a job
const getEditJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!job) {
      req.flash("error", "Job not found.");
      return res.redirect("/jobs");
    }
    res.render("job", { job });
  } catch (err) {
    req.flash("error", "Error fetching job.");
    res.redirect("/jobs");
  }
};

// Handle job update
const postEditJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!job) {
      req.flash("error", "Job not found.");
      return res.redirect("/jobs");
    }
    Object.assign(job, req.body);
    await job.save();
    req.flash("success", "Job updated successfully!");
    res.redirect("/jobs");
  } catch (err) {
    if (err.name === "ValidationError") {
      parseVErr(err, req);
    } else {
      req.flash("error", "Error updating job.");
    }
    res.render("job", { job: req.body, errors: req.flash("error") });
  }
};

// Handle job deletion
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!job) {
      req.flash("error", "Job not found or already deleted.");
      return res.redirect("/jobs");
    }
    req.flash("success", "Job deleted successfully!");
    res.redirect("/jobs");
  } catch (err) {
    req.flash("error", "Error deleting job.");
    res.redirect("/jobs");
  }
};

export { getJobs, getNewJob, postNewJob, getEditJob, postEditJob, deleteJob };
