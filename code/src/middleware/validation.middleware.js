export const validation = (schema) => {
  return (req, res, next) => {
    const errors = [];
    for (const key of Object.keys(schema)) {
      const validateResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validateResult.error) {
        errors.push({
          key,
          details: validateResult.error.details,
        });
      }
    }
    if (errors.length) {
      const err = new Error("Validation Error");
      err.cause = {
        status: 400,
        details: errors,
      };
      throw err;
    }
    next();
  };
};
