const { User } = require("../models/user");
const { ImageUpload } = require("../models/imageUpload");
const { sendEmail } = require("../utils/emailService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

let imagesArr = [];

exports.uploadImages = async (req, res) => {
  try {
    imagesArr = [];

    for (let i = 0; i < req?.files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      const img = await cloudinary.uploader.upload(
        req.files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }

    let imagesUploaded = new ImageUpload({
      images: imagesArr,
    });

    imagesUploaded = await imagesUploaded.save();
    return res.status(200).json(imagesArr);
  } catch (error) {
    console.error('Error in uploadImages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    let user;

    const existingUser = await User.findOne({ email: email });
    const existingUserByPh = await User.findOne({ phone: phone });

    if (existingUser) {
      return res.json({
        status: "FAILED",
        msg: "User already exist with this email!",
      });
    }

    if (existingUserByPh) {
      return res.json({
        status: "FAILED",
        msg: "User already exist with this phone number!",
      });
    }
    let userDetails;

    if (existingUser) {
      const hashPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashPassword;
      // existingUser.otp = verifyCode;
      // existingUser.otpExpires = Date.now() + 600000; // 10 minutes
      await existingUser.save();
      user = existingUser;
    } else {
      const hashPassword = await bcrypt.hash(password, 10);

      user = new User({
        name,
        email,
        phone,
        password: hashPassword,
        isAdmin:false,
        // otp: verifyCode,
        // otpExpires: Date.now() + 600000, // 10 minutes
      });

      userDetails=await user.save();
    }

    // const resp = sendEmailFun(
    //   email,
    //   "Verify Email",
    //   "",
    //   "Your OTP is " + verifyCode
    // );

    const token = jwt.sign(
      { email: user.email, id: user._id,isAdmin: user.isAdmin },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      success: true,
      message: "User registered successfully.",
      token: token,
      user: userDetails,
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ status: "FAILED", msg: "Something went wrong", error: error.message });
  }
};

exports.adminSignUp = async (req, res) => {
  try {
    const { name, phone, email, password} = req.body;

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    let user;

    const existingUser = await User.findOne({ email: email });
    const existingUserByPh = await User.findOne({ phone: phone });

    if (existingUser) {
      return res.json({
        status: "FAILED",
        msg: "User already exist with this email!",
      });
    }

    if (existingUserByPh) {
      return res.json({
        status: "FAILED",
        msg: "User already exist with this phone number!",
      });
    }
    let userDetails;

    if (existingUser) {
      const hashPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashPassword;
      existingUser.otp = verifyCode;
      existingUser.otpExpires = Date.now() + 600000; // 10 minutes
      await existingUser.save();
      user = existingUser;
    } else {
      const hashPassword = await bcrypt.hash(password, 10);

      user = new User({
        name,
        email,
        phone,
        password: hashPassword,
        isAdmin:true,
        otp: verifyCode,
        otpExpires: Date.now() + 600000, // 10 minutes
      });

      userDetails=await user.save();
    }

    const resp = sendEmailFun(
      email,
      "Verify Email",
      "",
      "Your OTP is " + verifyCode
    );

    const token = jwt.sign(
      { email: user.email, id: user._id,isAdmin: user.isAdmin },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      success: true,
      message: "User registered successfully.",
      token: token,
      user: userDetails,
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ status: "FAILED", msg: "Something went wrong", error: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "OTP SEND",
        otp: verifyCode,
        existingUserId: existingUser._id,
      });
    }
  } catch (error) {
    console.error('Error in resendOtp:', error);
    res.status(500).json({ status: "FAILED", msg: "something went wrong", error: error.message });
  }
};

exports.emailVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const existingUser = await User.findOne({ email: email });
    console.log(existingUser);

    if (existingUser) {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          name: existingUser.name,
          email: email,
          phone: existingUser.phone,
          password: existingUser.password,
          images: existingUser.images,
          isAdmin: existingUser.isAdmin,
          isVerified: existingUser.isVerified,
          otp: otp,
          otpExpires: Date.now() + 600000,
        },
        { new: true }
      );
    }

    const resp = sendEmailFun(email, "Verify Email", "", "Your OTP is " + otp);

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      success: true,
      message: "OTP SEND",
      token: token,
    });
  } catch (error) {
    console.error('Error in emailVerify:', error);
    res.status(500).json({ status: "FAILED", msg: "something went wrong", error: error.message });
  }
};

const sendEmailFun = async (to, subject, text, html) => {
  try {
    const result = await sendEmail(to, subject, text, html);
    return result.success;
  } catch (error) {
    console.error('Error in sendEmailFun:', error);
    return false; // Or handle the error appropriately
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isCodeValid = user.otp === otp;
    const isNotExpired = user.otpExpires > Date.now();

    if (isCodeValid && isNotExpired) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "OTP verified successfully" });
    } else if (!isCodeValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    } else {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
  } catch (err) {
    console.error('Error in verifyEmail:', err);
    res
      .status(500)
      .json({ success: false, message: "Error in verifying email", error: err.message });
  }
};

exports.adminSignin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({email:email});
    if (!existingUser) {
      return res.status(404).json({ error: true, msg: "User not found!" });
    }
    if(existingUser.isAdmin === false) {
      return res.status(403).json({
        error: true,
        isAdmin: false,
        msg: "You are not an admin",
      });
    }

    if (existingUser.isVerified === false) {
      return res.json({
        error: true,
        isVerify: false,
        msg: "Your account is not active yet please verify your account first or Sign Up with a new user",
      });
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
      return res.status(400).json({ error: true, msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id ,isAdmin: existingUser.isAdmin},
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).send({
      user: existingUser,
      token: token,
      msg: "User Authenticated",
    });
  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({ error: true, msg: "Something went wrong", details: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log(phone);
    

    const existingUser = await User.findOne({phone: String(req.body.phone)});
    if (!existingUser) {
      return res.status(404).json({ error: true, msg: "User not found!" });
    }

    // if (existingUser.isVerified === false) {
    //   return res.json({
    //     error: true,
    //     isVerify: false,
    //     msg: "Your account is not active yet please verify your account first or Sign Up with a new user",
    //   });
    // }

    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
      return res.status(400).json({ error: true, msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id ,isAdmin: existingUser.isAdmin},
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).send({
      user: existingUser,
      token: token,
      msg: "User Authenticated",
    });
  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({ error: true, msg: "Something went wrong", details: error.message });
  }
};

// exports.changePassword = async (req, res) => {
//   try {
//     const { name, phone, email, password, newPass, images } = req.body;

//     const existingUser = await User.findOne({ email: email });
//     if (!existingUser) {
//       return res.status(404).json({ error: true, msg: "User not found!" });
//     }

//     const matchPassword = await bcrypt.compare(password, existingUser.password);

//     if (!matchPassword) {
//       return res.status(404).json({ error: true, msg: "current password wrong" });
//     } else {
//       let newPassword;

//       if (newPass) {
//         newPassword = bcrypt.hashSync(newPass, 10);
//       } else {
//         newPassword = existingUser.passwordHash;
//       }

//       const user = await User.findByIdAndUpdate(
//         req.params.id,
//         {
//           name: name,
//           phone: phone,
//           email: email,
//           password: newPassword,
//           images: images,
//         },
//         { new: true }
//       );

//       if (!user)
//         return res
//           .status(400)
//           .json({ error: true, msg: "The user cannot be Updated!" });

//       res.send(user);
//     }
//   } catch (error) {
//     console.error('Error in changePassword:', error);
//     res.status(500).json({ error: true, msg: "Something went wrong", details: error.message });
//   }
// };

exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: true, msg: "All fields are required" });
    }

    // Find the user by email
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: true, msg: "User not found!" });
    }

    // Check if the current password matches
    const matchPassword = await bcrypt.compare(currentPassword, existingUser.password);
    if (!matchPassword) {
      return res.status(401).json({ error: true, msg: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

    // Update the user's password
    existingUser.password = hashedNewPassword;
    await existingUser.save();

    // Send success response
    res.status(200).json({ success: true, msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ error: true, msg: "Something went wrong", details: error.message });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const userList = await User.find();

    if (!userList) {
      res.status(500).json({ success: false });
    }
    res.send(userList);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res
        .status(500)
        .json({ message: "The user with the given ID was not found." });
    } else {
      res.status(200).send(user);
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = (req, res) => {
  try {
    User.findByIdAndDelete(req.params.id)
      .then((user) => {
        if (user) {
          return res
            .status(200)
            .json({ success: true, message: "the user is deleted!" });
        } else {
          return res
            .status(404)
            .json({ success: false, message: "user not found!" });
        }
      })
      .catch((err) => {
        return res.status(500).json({ success: false, error: err });
      });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserCount = async (req, res) => {
  try {
    const userCount = await User.countDocuments();

    if (!userCount) {
      res.status(500).json({ success: false });
    }
    res.send({
      userCount: userCount,
    });
  } catch (error) {
    console.error('Error in getUserCount:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.authWithGoogle = async (req, res) => {
  try {
    const { name, phone, email, password, images, isAdmin } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      const result = await User.create({
        name: name,
        phone: phone,
        email: email,
        password: password,
        images: images,
        isAdmin: isAdmin,
        isVerified: true,
      });

      const token = jwt.sign(
        { email: result.email, id: result._id },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );

      return res.status(200).send({
        user: result,
        token: token,
        msg: "User Login Successfully!",
      });
    } else {
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );

      return res.status(200).send({
        user: existingUser,
        token: token,
        msg: "User Login Successfully!",
      });
    }
  } catch (error) {
    console.error('Error in authWithGoogle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    const userExist = await User.findById(req.params.id);

    let newPassword;
    if (req.body.password) {
      newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
      newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name,
        phone: phone,
        email: email,
        password: newPassword,
        images: imagesArr,
      },
      { new: true }
    );

    if (!user) return res.status(400).send("the user cannot be Updated!");

    res.send(user);
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const imgUrl = req.query.img;

    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    const response = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {
        // console.log(error, res)
      }
    );

    if (response) {
      res.status(200).send(response);
    }
  } catch (error) {
    console.error('Error in deleteImage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return res.json({ status: "FAILED", msg: "User not exist with this email!" });
    }

    if (existingUser) {
      existingUser.otp = verifyCode;
      existingUser.otpExpires = Date.now() + 600000; // 10 minutes
      await existingUser.save();
    }

    const resp = sendEmailFun(
      email,
      "Verify Email",
      "",
      "Your OTP is " + verifyCode
    );

    return res.status(200).json({
      success: true,
      status: "SUCCESS",
      message: "OTP Send",
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ status: "FAILED", msg: "something went wrong", error: error.message });
  }
};

exports.changeForgotPassword = async (req, res) => {
  try {
    const { email, newPass } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      const hashPassword = await bcrypt.hash(newPass, 10);
      existingUser.password = hashPassword;
      await existingUser.save();
    }

    return res.status(200).json({
      success: true,
      status: "SUCCESS",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error('Error in changeForgotPassword:', error);
    res.status(500).json({ status: "FAILED", msg: "Something went wrong", error: error.message });
  }
};

