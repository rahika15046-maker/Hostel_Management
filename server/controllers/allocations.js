const mongoose = require('mongoose');
const Room = require('../models/Room');
const Alloc = require('../models/RoomAllocation');
const { ApiError, ok, wrap } = require('../utils/http');
// Atomic reservation: capacity check + increment happen in ONE server-side operation.
const reserve = (roomId) => Room.findOneAndUpdate(
  { _id: roomId, $expr: { $lt: ['$occupiedBeds', '$totalBeds'] } },
  [{ $set: { occupiedBeds: { $add: ['$occupiedBeds', 1] } } },
   { $set: { availableBeds: { $subtract: ['$totalBeds', '$occupiedBeds'] },
             status: { $cond: [{ $eq: ['$occupiedBeds', '$totalBeds'] }, 'FULL', 'PARTIALLY_FILLED'] } } }],
  { new: true });
const release = (roomId) => Room.updateOne({ _id: roomId }, [
  { $set: { occupiedBeds: { $max: [0, { $subtract: ['$occupiedBeds', 1] }] } } },
  { $set: { availableBeds: { $subtract: ['$totalBeds', '$occupiedBeds'] },
            status: { $cond: [{ $eq: ['$occupiedBeds', 0] }, 'AVAILABLE', 'PARTIALLY_FILLED'] } } }]);
exports.book = wrap(async (req, res) => {
  const roomId = req.body.roomId;
  if (!mongoose.isValidObjectId(roomId)) throw new ApiError(400, 'A valid room is required.');
  const studentId = req.user._id;
  if (await Alloc.exists({ student: studentId })) throw new ApiError(400, 'You already have a hostel room allocation.');
  if (!(await Room.exists({ _id: roomId }))) throw new ApiError(404, 'Room not found.');
  const room = await reserve(roomId);
  if (!room) throw new ApiError(409, 'This room is full.');
  try {
    for (let attempt = 0; attempt <= room.totalBeds; attempt++) {
      const taken = new Set((await Alloc.find({ room: roomId }, 'bedNumber')).map(a => a.bedNumber));
      let bed = 1; while (taken.has(bed)) bed++;
      if (bed > room.totalBeds) break;
      try {
        const a = await Alloc.create({ student: studentId, room: roomId, bedNumber: bed });
        return ok(res, { allocation: { roomNumber: room.roomNumber, floor: room.floor, roomType: room.roomType,
          bedNumber: a.bedNumber, allocatedAt: a.allocatedAt } }, 'Bed booked successfully', 201);
      } catch (e) {
        if (e.code !== 11000) throw e;
        if (e.keyPattern?.student) throw new ApiError(400, 'You already have a hostel room allocation.');
      }
    }
    throw new ApiError(409, 'This room is full.');
  } catch (e) { await release(roomId); throw e; }
});
exports.mine = wrap(async (req, res) => {
  const a = await Alloc.findOne({ student: req.user._id }).populate('room');
  if (!a) return ok(res, { allocation: null }, 'No allocation yet');
  ok(res, { allocation: { roomId: a.room._id, roomNumber: a.room.roomNumber, floor: a.room.floor, roomType: a.room.roomType,
    bedNumber: a.bedNumber, allocatedAt: a.allocatedAt } });
});
exports.byRoom = wrap(async (req, res) => {
  const list = await Alloc.find({ room: req.params.roomId }).populate('student', 'name email').sort('bedNumber');
  ok(res, { residents: list.map(a => ({ name: a.student?.name, email: a.student?.email, bedNumber: a.bedNumber, allocatedAt: a.allocatedAt })) });
});
exports.all = wrap(async (req, res) => {
  const list = await Alloc.find().populate('student', 'name email').populate('room', 'roomNumber roomType floor').sort('-allocatedAt');
  ok(res, { allocations: list.filter(a => a.student && a.room).map(a => ({ id: a._id, name: a.student.name, email: a.student.email,
    roomNumber: a.room.roomNumber, roomType: a.room.roomType, floor: a.room.floor, bedNumber: a.bedNumber, allocatedAt: a.allocatedAt })) });
});
