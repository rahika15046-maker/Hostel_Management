const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  bedNumber: { type: Number, required: true, min: 1 },
  allocatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
schema.index({ room: 1, bedNumber: 1 }, { unique: true });
module.exports = mongoose.model('RoomAllocation', schema);
