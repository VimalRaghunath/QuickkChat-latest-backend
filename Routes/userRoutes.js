const express = require('express');
const { registeruser, authUser, allUsers } = require('../Controllers/userControllers');


const router = express.Router()

router.route('/').post(registeruser).get(allUsers);
router.post('/login', authUser);


module.exports = router;