const router = require('express').Router();
const authController = require('../controllers/auth.controller')
const userController = require('../controllers/user.controller')

// auth
router.post("/register", authController.signUp);

// user
router.get("/", userController.getUsers)
router.get("/:id", userController.getUser)
router.put("/:id", userController.updateUser)
router.delete("/:id", userController.deleteUser)
router.patch('/follow/:id', userController.follow)
router.patch('/unfollow/:id', userController.unfollow)

module.exports = router;