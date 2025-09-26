const express = require('express');
const router = express.Router();
const controller = require('../controllers/touristController');
const { validateTourist } = require('../middleware/touristValidation');

// Create (with server-side validation)
router.post('/', validateTourist, controller.registerTourist);

// List
router.get('/', controller.listTourists);

// Get by ID
router.get('/:id', controller.getTourist);

// Issue credential (no extra validation here)
router.post('/:id/issue', controller.issueCredential);

module.exports = router;
