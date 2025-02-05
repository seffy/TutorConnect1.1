const express = require('express');
const router = express.Router();
const { createSlot, getSlots, acceptSlot, rejectSlot, deleteSlot } = require('../controllers/slotController');
const { authenticateToken } = require('../middleware/auth');  // We'll create this next

router.use(authenticateToken);  // Protect all slots routes

router.post('/', createSlot);
router.get('/', getSlots);
router.put('/:slot_id/accept', acceptSlot);
router.put('/:slot_id/reject', rejectSlot);
router.delete('/:slot_id', deleteSlot);

module.exports = router;