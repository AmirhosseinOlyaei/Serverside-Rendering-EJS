// util/parseValidationErrs.mjs
const parseValidationErrors = (error, req) => {
  if (!error || !error.errors || typeof error.errors !== "object") {
    req.flash("error", "An unexpected error occurred.");
    return;
  }

  const keys = Object.keys(error.errors);

  if (keys.length === 0) {
    req.flash(
      "error",
      "Validation failed, but no specific errors were provided."
    );
    return;
  }

  keys.forEach((key) => {
    const errorMessage =
      error.errors[key]?.properties?.message || "Validation error occurred.";
    req.flash("error", `${key}: ${errorMessage}`);
  });
};

export default parseValidationErrors;
