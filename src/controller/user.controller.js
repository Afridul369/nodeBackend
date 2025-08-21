const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const UserModel = require("../models/user.model");
const { validateUser } = require("../validation/user.validation");
const {
  registrationTemplate,
  resendOtpTemplate,
} = require("../template/emailtemplate");
const { Otp, emailSend } = require("../helpers/nodemailer");
const { sendSms } = require("../helpers/sms");
const jwt = require("jsonwebtoken");

exports.Registration = asyncHandler(async (req, res) => {
  const value = await validateUser(req);
  // now save the user into database
  const user = await new UserModel({
    name: value.name,
    email: value.email || null,
    password: value.password,
    phoneNumber: value.phoneNumber || null,
  }).save();

  if (!user) {
    throw new customError(500, "User not Registred server Error!!");
  }
  // send confrim registration mail

  const otp = Otp();
  const expireTime = Date.now() + 10 * 60 * 60 * 1000;
  user.resetPasswordOtp = otp;
  user.resetPasswordExpires = expireTime;
  if (user.email) {
    const verifyEmailLink = `www.fontend.com/verify-account/${user.email}`;
    const template = registrationTemplate(
      user.name,
      user.email,
      otp,
      expireTime,
      verifyEmailLink
    );
    const result = await emailSend(user.email, "Verify Email 🕺", template);
    if (!result) {
      throw new customError(500, "Email send failed");
    }
  } else {
    const verifyEmailLink = `www.fontend.com/verify-account/${user.phoneNumber}`;
    const smsBody = `✅ Welcome to Node commerce, ${user.name}!
Your registration is complete.
your otp is : ${otp}
your time expires on ${new Date(expireTime).getTimezoneOffset()}
Verify your account using this link: ${verifyEmailLink}
Need help? Contact us anytime.`;
    const sms = await sendSms(user.phoneNumber, smsBody);
    console.log(sms);
    // if (sms?.data?.response_code !== 202) {
    //   throw new customError(500, sms?.error_message);
    // }
  }

  // now send email

  await user.save();
  apiResponse.sendSuccess(res, 201, "Registration Succesfull", {
    name: user.name,
  });
});

// verify phone number
exports.verifyUser = asyncHandler(async (req, res) => {
  const { email, otp, phoneNumber } = req.body;
  if (!otp) {
    throw new customError(401, "Your otp Missing");
  }

  // now find the otp into database and verify otp
  const validUser = await UserModel.findOne({
    email: email,
    phoneNumber: phoneNumber,
  });
  if (!validUser) {
    throw new customError(401, "User not Found !");
  }
  if (
    phoneNumber &&
    validUser.resetPasswordOtp == otp &&
    validUser.resetPasswordExpires > Date.now()
  ) {
    validUser.phoneNumberVerified = true;
    validUser.isActive = true;
    validUser.resetPasswordExpires = null;
    validUser.resetPasswordOtp = null;
    await validUser.save();
  }
  if (
    email &&
    validUser.resetPasswordOtp == otp &&
    validUser.resetPasswordExpires > Date.now()
  ) {
    validUser.emailVerified = true;
    validUser.isActive = true;
    validUser.resetPasswordExpires = null;
    validUser.resetPasswordOtp = null;
    await validUser.save();
  }
  apiResponse.sendSuccess(
    res,
    200,
    "Your Otp matched ,  your acount Verified",
    { name: validUser.name }
  );
});

// resend otp
exports.resendOtp = asyncHandler(async (req, res) => {
  const { email, phoneNumber } = req.body;
  // now find the otp into database and verify otp
  const User = await UserModel.findOne({
    email: email,
    phoneNumber: phoneNumber,
  });
  const otp = Otp();
  const expireTime = Date.now() + 10 * 60 * 60 * 1000;
  if (email) {
    const template = resendOtpTemplate(User.name, User.email, otp, expireTime);
    await emailSend(User.email, "Resend Otp 🕺", template);
    User.resetPasswordExpires = expireTime;
    User.resetPasswordOtp = otp;
    await User.save();
  }
  if (phoneNumber) {
    const smsBody = `✅ Welcome to Node commerce, ${User.name}!
Your otp is : ${otp}
your time expires on ${new Date(expireTime).getTimezoneOffset()}
Need help?
018723345`;
    const sms = await sendSms(User.phoneNumber, smsBody);
    console.log(sms);
    // if (sms?.data?.response_code !== 202) {
    //   throw new customError(500, sms?.error_message);
    // }
    User.resetPasswordExpires = expireTime;
    User.resetPasswordOtp = otp;
    await User.save();
  }
  apiResponse.sendSuccess(
    res,
    200,
    "Your Otp Send Sucesfully Check your email or phone",
    null
  );
});

// forgot password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new customError(401, "Email missing ");
  const user = await UserModel.findOne({ email });
  if (!user)
    throw new customError(
      401,
      "This email not Registred first Regitration our application"
    );
  // now send a email
  return res
    .status(301)
    .redirect(
      "https://www.udemy.com/course/complete-ai-guide/?couponCode=taufik.cit.bd@gmail.com"
    );
});

// reset password
exports.resetPassowrd = asyncHandler(async (req, res) => {
  const { email, newPassword, confrimPassword } = req.body;
  let pattern =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|    /?]).{8,}$/;
  if (!newPassword && !confrimPassword)
    throw new customError(401, "new pass or custonm pass miss");
  if (!pattern.test(newPassword))
    throw new customError(
      401,
      "পাসওয়ার্ডে অন্তত ১টি বড় হাতের অক্ষর, ১টি নাম্বার এবং ১টি স্পেশাল ক্যারেক্টার থাকতে হবে এবং সর্বনিম্ন ৮ অক্ষরের হতে হবে।"
    );

  if (newPassword !== confrimPassword)
    throw new customError(401, "password Not Matched !!");
  const user = await UserModel.findOne({ email });
  if (!user) throw new customError(401, "user is not found");
  user.password = newPassword;
  await user.save();
  return res.status(301).redirect("www.fron.com/login");
});

//login
exports.login = asyncHandler(async (req, res) => {
  const { phoneNumber, email, password } = req.body;
  if (phoneNumber == undefined && email == undefined)
    throw new customError(401, "PhoneNumber or Email Missing");
  // search db
  const user = await UserModel.findOne({ phoneNumber, email });
  if (!user) throw new customError(401, "user no Found / missing !!");

  // check password
  const passwordRight = await user.comparePassword(password);
  if (!passwordRight)
    throw new customError(401, "Passoword or email incorrect");
  // generate accesToken and refresh Token
  const accesToken = await user.generateAccesToken();
  const refreshToken = await user.generateRefreshToken();
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "developement" ? false : true,
    sameSite: "none",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  // refresh Token saved into db
  user.refreshToken = refreshToken;
  await user.save();
  apiResponse.sendSuccess(res, 200, "login Sucessfull ", {
    accesToken: accesToken,
    userName: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  });
});

// logout

exports.logout = asyncHandler(async (req, res) => {
  const token = req?.body?.token || req.headers?.authorization;
  const { userId } = await jwt.verify(token, process.env.ACCESTOKEN_SCERET);
  // find the user
  const user = await UserModel.findById(userId);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
    sameSite: "none",
    path: "/",
  });

  user.refreshToken = null;
  await user.save();
  apiResponse.sendSuccess(res, 200, "logout Sucesfull", { user });
});
