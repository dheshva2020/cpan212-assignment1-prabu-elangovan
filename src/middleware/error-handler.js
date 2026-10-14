import { HttpError } from '../lib/http-error.js';

// Express uses four parameters for error middleware.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Handle expected HTTP errors.
  if (err instanceof HttpError) {
    const error = {
      message: err.message,
    };

    // Include validation details only for 400 errors.
    if (err.status === 400 && err.details !== undefined) {
      error.details = err.details;
    }

    return res.status(err.status).json({
      error,
    });
  }

  // Log unexpected errors to the terminal.
  console.error(err);

  // Never expose internal error details to clients.
  return res.status(500).json({
    error: {
      message: 'Internal server error',
    },
  });
}