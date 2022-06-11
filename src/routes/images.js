const { Router } = require('express');
const router = Router();

const { getImagesBy, uploadToBucket } = require('../controllers/images');

router.post('/by', getImagesBy);
router.post('/uploadtobucket', uploadToBucket);

module.exports = router;