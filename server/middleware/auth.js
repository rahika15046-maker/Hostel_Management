const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, wrap } = require('../utils/http');
exports.authenticate = wrap(async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) throw new ApiError(401, 'Authentication required.');
  let payload;
  try { payload = jwt.verify(h.slice(7), process.env.JWT_SECRET); } catch { throw new ApiError(401, 'Session expired. Please log in again.'); }
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'Account no longer exists.');
  req.user = user; next();
});
exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new ApiError(403, 'You do not have permission to do this.'));
