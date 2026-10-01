exports.notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found.' });
exports.errorHandler = (err, req, res, _next) => {
  let status = err.status || 500, message = err.message;
  if (err.code === 11000) { status = 409; message = 'Duplicate value already exists.'; }
  else if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(' '); }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid identifier.'; }
  else if (status === 500) { console.error(err); message = 'Something went wrong. Please try again.'; }
  res.status(status).json({ success: false, message });
};
