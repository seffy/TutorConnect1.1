const { db } = require("../config/database");
const wsManager = require("../websocket");

const createSlot = (req, res) => {
  const { subject } = req.body;
  const learner_id = req.user.id; // From JWT token

  if (!subject) {
    return res.status(400).json({ error: "Subject is required" });
  }

  const sql = "INSERT INTO slots (subject, learner_id) VALUES (?, ?)";
  db.run(sql, [subject, learner_id], function (err) {
    if (err) return res.status(500).json({ error: "Error creating slot" });
    res
      .status(201)
      .json({ id: this.lastID, message: "Slot created successfully" });
  });
};

const getSlots = (req, res) => {
  const user = req.user;
  let sql;

  if (user.role === "learner") {
    // Show all slots for learner with teacher info
    sql = `
            SELECT s.*, 
                   u.username as teacher_name 
            FROM slots s 
            LEFT JOIN users u ON s.teacher_id = u.id 
            WHERE s.learner_id = ?
        `;
    db.all(sql, [user.id], (err, slots) => {
      if (err) return res.status(500).json({ error: "Error fetching slots" });
      res.json(slots);
    });
  } else if (user.role === "teacher") {
    // Show only pending slots and slots accepted by this teacher
    sql = `
            SELECT s.*, 
                   u.username as learner_name,
                   CASE 
                     WHEN s.teacher_id = ? THEN 'accepted'
                     WHEN s.teacher_id IS NULL AND s.status = 'pending' THEN 'pending'
                     ELSE null
                   END as slot_status
            FROM slots s 
            JOIN users u ON s.learner_id = u.id 
            WHERE (s.teacher_id IS NULL AND s.status = 'pending') 
                  OR s.teacher_id = ?
        `;
    db.all(sql, [user.id, user.id], (err, slots) => {
      if (err) return res.status(500).json({ error: "Error fetching slots" });
      // Filter out null slot_status entries
      const filteredSlots = slots.filter((slot) => slot.slot_status !== null);
      res.json(filteredSlots);
    });
  }
};

// const acceptSlot = (req, res) => {
//     const { slot_id } = req.params;
//     const teacher_id = req.user.id;

//     if (req.user.role !== 'teacher') {
//         return res.status(403).json({ error: "Only teachers can accept slots" });
//     }

//     // First check if slot is already taken
//     db.get('SELECT teacher_id, status FROM slots WHERE id = ?', [slot_id], (err, slot) => {
//         if (err) return res.status(500).json({ error: "Error checking slot status" });
//         if (!slot) return res.status(404).json({ error: "Slot not found" });

//         if (slot.teacher_id || slot.status !== 'pending') {
//             return res.status(400).json({ error: "Slot is no longer available" });
//         }

//         // If slot is available, proceed with accepting it
//         const sql = 'UPDATE slots SET teacher_id = ?, status = "accepted" WHERE id = ? AND teacher_id IS NULL AND status = "pending"';
//         db.run(sql, [teacher_id, slot_id], function(err) {
//             if (err) return res.status(500).json({ error: "Error accepting slot" });
//             if (this.changes === 0) return res.status(404).json({ error: "Slot not found or already accepted" });

//             // Get slot details to notify learner
//             db.get('SELECT s.learner_id, u.username as teacher_name FROM slots s JOIN users u ON u.id = ? WHERE s.id = ?',
//                 [teacher_id, slot_id],
//                 (err, slot) => {
//                     if (!err && slot) {
//                         const learnerWs = wsManager.getConnection(slot.learner_id);
//                         if (learnerWs) {
//                             learnerWs.send(JSON.stringify({
//                                 type: 'slotAccepted',
//                                 slotId: slot_id,
//                                 teacherName: slot.teacher_name
//                             }));
//                         }
//                     }
//             });

//             // Broadcast slot update to all teachers
//             const message = JSON.stringify({
//                 type: 'slotUpdate'
//             });
//             wsManager.broadcast(message);

//             res.json({ message: "Slot accepted successfully" });
//         });
//     });
// };

const acceptSlot = (req, res) => {
  const { slot_id } = req.params;
  const { meeting_code } = req.body;  // Get meeting code from request body
  const teacher_id = req.user.id;

  if (!meeting_code) {
      return res.status(400).json({ error: "Meeting code is required" });
  }

  if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Only teachers can accept slots" });
  }

  // First check if slot is already taken
  db.get('SELECT teacher_id, status FROM slots WHERE id = ?', [slot_id], (err, slot) => {
      if (err) return res.status(500).json({ error: "Error checking slot status" });
      if (!slot) return res.status(404).json({ error: "Slot not found" });

      if (slot.teacher_id || slot.status !== 'pending') {
          return res.status(400).json({ error: "Slot is no longer available" });
      }

      // If slot is available, proceed with accepting it and adding meeting code
      const sql = 'UPDATE slots SET teacher_id = ?, status = "accepted", meeting_code = ? WHERE id = ? AND teacher_id IS NULL AND status = "pending"';
      db.run(sql, [teacher_id, meeting_code, slot_id], function(err) {
          if (err) return res.status(500).json({ error: "Error accepting slot" });
          if (this.changes === 0) return res.status(404).json({ error: "Slot not found or already accepted" });

          // Get slot details to notify learner
          db.get('SELECT s.learner_id, u.username as teacher_name FROM slots s JOIN users u ON u.id = ? WHERE s.id = ?',
              [teacher_id, slot_id],
              (err, slot) => {
                  if (!err && slot) {
                      const learnerWs = wsManager.getConnection(slot.learner_id);
                      if (learnerWs) {
                          learnerWs.send(JSON.stringify({
                              type: 'slotAccepted',
                              slotId: slot_id,
                              teacherName: slot.teacher_name,
                              meetingCode: meeting_code
                          }));
                      }
                  }
          });

          res.json({ 
              message: "Slot accepted successfully",
              meeting_code: meeting_code
          });
      });
  });
};

const rejectSlot = (req, res) => {
  const { slot_id } = req.params;
  const teacher_id = req.user.id;

  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Only teachers can reject slots" });
  }

  // First check if slot is already taken
  db.get(
    "SELECT teacher_id, status FROM slots WHERE id = ?",
    [slot_id],
    (err, slot) => {
      if (err)
        return res.status(500).json({ error: "Error checking slot status" });
      if (!slot) return res.status(404).json({ error: "Slot not found" });

      if (slot.teacher_id || slot.status !== "pending") {
        return res.status(400).json({ error: "Slot is no longer available" });
      }

      const sql = `UPDATE slots 
                    SET status = 'rejected', teacher_id = ?
                    WHERE id = ? AND status = 'pending' AND teacher_id IS NULL`;

      db.run(sql, [teacher_id, slot_id], function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Error rejecting slot" });
        }
        if (this.changes === 0) {
          return res
            .status(404)
            .json({ error: "Slot not found or cannot be rejected" });
        }

        // Broadcast slot update to all teachers
        const message = JSON.stringify({
          type: "slotUpdate",
        });
        wsManager.broadcast(message);

        res.json({ message: "Slot rejected successfully" });
      });
    }
  );
};

const deleteSlot = (req, res) => {
  const { slot_id } = req.params;
  const user_id = req.user.id;

  const sql =
    'DELETE FROM slots WHERE id = ? AND learner_id = ? AND status = "pending"';
  db.run(sql, [slot_id, user_id], function (err) {
    if (err) return res.status(500).json({ error: "Error deleting slot" });
    if (this.changes === 0)
      return res
        .status(404)
        .json({ error: "Slot not found or cannot be deleted" });
    res.json({ message: "Slot deleted successfully" });
  });
};

module.exports = {
  createSlot,
  getSlots,
  acceptSlot,
  rejectSlot,
  deleteSlot,
};
