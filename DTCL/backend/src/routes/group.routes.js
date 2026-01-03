const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { protect, groupAdminOnly } = require('../middlewares/auth');

// All routes are protected
router.use(protect);

router.post('/', groupController.createGroup);
router.get('/', groupController.getGroupMembers);
router.post('/add', groupAdminOnly, groupController.addMember);
router.post('/leave', groupController.leaveGroup);
router.delete('/', groupAdminOnly, groupController.deleteMember);
router.delete('/delete', groupAdminOnly, groupController.deleteGroup);

module.exports = router;
