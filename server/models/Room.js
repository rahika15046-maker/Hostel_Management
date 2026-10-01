const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  floor: { type: Number, required: true, min: 0 },
  roomType: { type: String, enum: ['AC', 'NON_AC'], required: true },
  totalBeds: { type: Number, required: true, min: 1, max: 20 },
  occupiedBeds: { type: Number, default: 0, min: 0 },
  availableBeds: { type: Number, min: 0 },
  status: { type: String, enum: ['AVAILABLE', 'PARTIALLY_FILLED', 'FULL'], default: 'AVAILABLE' }
}, { timestamps: true });
roomSchema.pre('validate', function (next) {
  if (this.occupiedBeds > this.totalBeds) return next(new Error('occupiedBeds cannot exceed totalBeds'));
  this.availableBeds = this.totalBeds - this.occupiedBeds;
  this.status = this.availableBeds === 0 ? 'FULL' : this.occupiedBeds > 0 ? 'PARTIALLY_FILLED' : 'AVAILABLE';
  next();
});
module.exports = mongoose.model('Room', roomSchema);
