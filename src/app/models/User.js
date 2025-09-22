const mongoose = require("mongoose");
const { UserStatusEnum, UserMembershipEnum, UserRoleEnum } = require("../../enum/UserEnum");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      maxLength: 255,
    },
    password: {
      type: String,
    },
    full_name: {
      type: String,
      maxLength: 255,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
    },
    avatar_url: {
      type: String,
    },
    phone_number: {
      type: String,
      maxLength: 10,
    },
    address: {
      type: String,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    role_name: {
      type: String,
      default: UserRoleEnum.CUSTOMER,
    },
    otp: {
      type: Number,
    },
    otpExpired: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
