const express = require('express');
const router = express.Router();

router.use('/api/products', require('./productRoutes'));
router.use('/api/users', require('./userRoutes'));

module.exports = router;