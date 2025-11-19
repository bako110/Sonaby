const express = require('express');
const nonDesirableController = require('./nondesirable.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

router.get('/', nonDesirableController.getAllNonDesirables);
router.post('/', nonDesirableController.createNonDesirable);
router.delete('/:id', nonDesirableController.deleteNonDesirable);

module.exports = router;
