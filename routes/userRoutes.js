const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/userController");

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post(`/upload`,userAuth,upload.array("images"), userController.uploadImages);
router.post(`/signup`, userController.signup);
router.post(`/admin/signup`, adminAuth,userController.adminSignUp);
router.post(`/verifyAccount/resendOtp`,adminAuth, userController.resendOtp);
router.put(`/verifyAccount/emailVerify/:id`,adminAuth, userController.emailVerify);
router.post("/verifyemail",adminAuth, userController.verifyEmail);
router.post(`/signin`, userController.signin);
router.post(`/admin/signin`, userController.adminSignin);
router.put(`/changePassword/:id`,userAuth, userController.changePassword);
router.get(`/`,adminAuth, userController.getUsers);
router.get("/:id",userAuth, userController.getUserById);
router.delete("/:id",adminAuth, userController.deleteUser);
router.get(`/get/count`,adminAuth, userController.getUserCount);
router.post(`/authWithGoogle`, userController.authWithGoogle);
router.put("/:id",userAuth, userController.updateUser);
router.delete("/deleteImage",userAuth, userController.deleteImage);
// router.post(`/forgotPassword`,userAuth, userController.forgotPassword);
router.post(`/forgotPassword/changePassword`,userAuth, userController.changeForgotPassword);

module.exports = router;

