// controllers/jobs.mjs
import Job from "../models/Job.mjs";
import parseVErr from "../util/parseValidationErrs.mjs";

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.render("jobs", { jobs, _csrf: req.csrfToken() });
  } catch (err) {
    req.flash("error", "Error fetching jobs.");
    res.redirect("/jobs");
  }
};

const getNewJob = (req, res) => {
  res.render("job", { _csrf: req.csrfToken() });
};

const postNewJob = async (req, res) => {
  const newJob = new Job({ ...req.body, createdBy: req.user._id });
  try {
    await newJob.save();
    res.redirect("/jobs");
  } catch (err) {
    if (err.constructor.name === "ValidationError") {
      parseVErr(err, req);
    } else {
      req.flash("error", "Error creating job.");
    }
    res.render("job", {
      job: newJob,
      errors: req.flash("error"),
      _csrf: req.csrfToken(),
    });
  }
};

const getEditJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    res.render("job", { job, _csrf: req.csrfToken() });
  } catch (err) {
    req.flash("error", "Error fetching job.");
    res.redirect("/jobs");
  }
};

const postEditJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    Object.assign(job, req.body);
    await job.save();
    res.redirect("/jobs");
  } catch (err) {
    if (err.constructor.name === "ValidationError") {
      parseVErr(err, req);
    } else {
      req.flash("error", "Error updating job.");
    }
    res.render("job", {
      job: req.body,
      errors: req.flash("error"),
      _csrf: req.csrfToken(),
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    res.redirect("/jobs");
  } catch (err) {
    req.flash("error", "Error deleting job.");
    res.redirect("/jobs");
  }
};

export { getJobs, getNewJob, postNewJob, getEditJob, postEditJob, deleteJob };
