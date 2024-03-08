const express = require('express');
const { registeruser, authUser, allUsers } = require('../Controllers/userControllers');
const { protect } = require('../Middlewares/authMiddleware');


const router = express.Router()

router.route('/').post(registeruser).get(protect, allUsers);
router.post('/login', authUser);


module.exports = router;