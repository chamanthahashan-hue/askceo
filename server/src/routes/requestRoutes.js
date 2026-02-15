const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createRequest,
  listRequests,
  getRequest,
  replyToRequest,
  decideRequest,
  dashboardStats
} = require('../controllers/requestController');
const { auth, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();
const submitLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true });

router.get('/', auth, listRequests);
router.get('/stats/summary', auth, adminOnly, dashboardStats);
router.get('/:id', auth, getRequest);
router.post('/', auth, submitLimiter, upload.array('attachments', 3), createRequest);
router.post('/:id/reply', auth, replyToRequest);
router.post('/:id/decision', auth, adminOnly, decideRequest);

module.exports = router;
