const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');

// Routes công khai (public)
router.get('/', petController.getAllPets);
router.get('/featured', petController.getFeaturedPets); // Thêm route mới
router.get('/breeds', petController.getBreeds); // Thêm route mới
router.get('/:id', petController.getPetById);

// Routes thêm/sửa/xóa (không yêu cầu xác thực cho lúc này)
router.post('/', petController.createPet);
router.put('/:id', petController.updatePet);
router.delete('/:id', petController.deletePet);
router.get('/:id/in-use', petController.checkPetInUse);

module.exports = router;