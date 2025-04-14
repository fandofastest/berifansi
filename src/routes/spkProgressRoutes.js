const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth');
const spkProgressController = require('../controllers/spkProgressController');
const router = express.Router();

// Protected routes
router.post('/', authenticate, spkProgressController.createSpkProgress);
router.put('/:id', authenticate, spkProgressController.updateSpkProgress);
router.delete('/:id', authenticate, isAdmin, spkProgressController.deleteSpkProgress);

// Public routes
router.get('/', spkProgressController.getAllSpkProgress);
router.get('/:id', spkProgressController.getSpkProgressById);
router.get('/spk/:spkId', spkProgressController.getProgressBySpkId);

module.exports = router;