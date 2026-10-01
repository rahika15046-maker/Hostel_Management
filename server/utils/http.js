class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
const ok = (res, data, message = 'OK', status = 200) => res.status(status).json({ success: true, message, data });
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
module.exports = { ApiError, ok, wrap };
