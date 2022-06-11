const { Router } = require('express')
const router = Router()

const { register, login, passRecovery, passReset } = require('../controllers/auht/index');

router.post('/register', register);
router.post('/login', login);
router.post('/passrecovery', passRecovery);
router.post('/passreset/:userId', passReset);

module.exports = router;