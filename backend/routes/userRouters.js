const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.create);
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.get('/reviews', userController.getReviews);
module.exports = router;