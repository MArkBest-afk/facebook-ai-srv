const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  let statusCode = 500;
  let errorMessage = 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') { // Mongoose validation errors
    statusCode = 400;
    errorMessage = err.message; // Or format specific validation messages
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') { // JWT errors
    statusCode = 401;
    errorMessage = 'Invalid or expired token';
  } else if (err.status) { // Custom errors with a status property
    statusCode = err.status;
    errorMessage = err.message;
  }

  res.status(statusCode).json({
    error: errorMessage
  });
};

module.exports = errorHandler;