const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, ok, wrap } = require('../utils/http');
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const safe = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, studentId: u.studentId });
const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
exports.register = wrap(async (req, res) => {
  const { name, email, password, role, studentId } = req.body;
  if (!name?.trim()) throw new ApiError(400, 'Name is required.');
  if (!emailRe.test(email || '')) throw new ApiError(400, 'Enter a valid email address.');
  if (typeof password !== 'string' || password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters.');
  if (!['student', 'warden'].includes(role)) throw new ApiError(400, 'Role must be student or warden.');
  if (await User.findOne({ email: email.toLowerCase() })) throw new ApiError(409, 'An account with this email already exists.');
  const user = await User.create({ name, email, role, studentId, password: await bcrypt.hash(password, 12) });
  ok(res, { token: sign(user), user: safe(user) }, 'Account created successfully', 201);
});
exports.login = wrap(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required.');
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError(401, 'Invalid email or password.');
  ok(res, { token: sign(user), user: safe(user) }, 'Login successful');
});
exports.me = wrap(async (req, res) => ok(res, { user: safe(req.user) }));
