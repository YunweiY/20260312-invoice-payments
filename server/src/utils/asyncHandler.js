// async handler for express routes
// it wraps the async function in a promise and catches any errors
// and passes them to the next middleware
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};
