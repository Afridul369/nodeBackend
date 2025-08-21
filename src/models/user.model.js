const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { customError } = require("../../utils/customError");
const { Types, Schema } = mongoose;

const userSchmea = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password Missing"],
    },
    phoneNumber: {
      type: Number,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: Types.ObjectId,
      ref: "Role",
    },
    permission: {
      type: Types.ObjectId,
      ref: "Permission",
    },
    address: {
      type: String,
      trim: true,
    },
    city: String,
    district: String,
    country: {
      type: String,
      default: "Bangladesh",
    },
    zipCode: {
      type: Number,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "Female", "others"],
    },
    cart: {
      type: Types.ObjectId,
      ref: "Product",
    },
    wishList: {
      type: Types.ObjectId,
      ref: "Product",
    },
    newsLetterSubscribe: {
      type: Boolean,
      default: false,
    },
    resetPasswordOtp: Number,
    resetPasswordExpires: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastlogin: Date,
    lastlogout: Date,
    oauth: Boolean,
    refreshToken: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// make a hash password
userSchmea.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// compare hash password
userSchmea.methods.comparePassword = async function (humanPass) {
  return await bcrypt.compare(humanPass, this.password);
};

// generate access Token
userSchmea.methods.generateAccesToken = async function () {
  const accesToken = await jwt.sign(
    {
      userId: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESTOKEN_SCERET,
    { expiresIn: process.env.ACCCESTOKEN_EXPIRES }
  );
  return accesToken;
};

// generate Refresh  Token
userSchmea.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      userId: this._id,
    },
    process.env.REFRESHTOKEN_SCERET,
    { expiresIn: process.env.REFRESHTOKEN_EXPIRES }
  );
};

// verify accesToken
userSchmea.methods.verifyAccesToken = async function (token) {
  const isValidAccesToken = await jwt.verify(
    token,
    process.env.ACCESTOKEN_SCERET
  );
  if (!isValidAccesToken) {
    throw new customError(401, "Your Token is Invalid");
  }
};

// verify accesToken
userSchmea.methods.verifyRefreshToken = async function (token) {
  const isValidRefreshToken = await jwt.verify(
    token,
    process.env.REFRESHTOKEN_SCERET
  );
  if (!isValidRefreshToken) {
    throw new customError(401, "Your refresh  Token is Invalid");
  }
};

module.exports = mongoose.model("User", userSchmea);
