const Joi = require("joi");
const { customError } = require("../../utils/customError");

const userValidationSchema = Joi.object({
  email: Joi.string()
    .trim()
    .pattern(/^([\w-\.*]+@([\w-]+\.)+[\w-]{2,4})?$/)
    .messages({
      "string.empty": "ইমেইল ফিল্ডটি ফাঁকা রাখা যাবে না।",
      "string.pattern.base": "সঠিক ইমেইল অ্যাড্রেস প্রদান করুন।",
    }),
  password: Joi.string()
    .trim()
    .required()
    .pattern(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|    /?]).{8,}$/
    )
    .messages({
      "string.empty": "পাসওয়ার্ড ফাঁকা রাখা যাবে না।",
      "string.pattern.base":
        "পাসওয়ার্ডে অন্তত ১টি বড় হাতের অক্ষর, ১টি নাম্বার এবং ১টি স্পেশাল ক্যারেক্টার থাকতে হবে এবং সর্বনিম্ন ৮ অক্ষরের হতে হবে।",
      "any.required": "পাসওয়ার্ড আবশ্যক।",
    }),

  phoneNumber: Joi.string()
    .trim()
    .pattern(/^01[3-9]\d{8}$/, "Bangladesh phone number")
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.name":
        "Phone number must be a valid Bangladesh number (e.g., 01XXXXXXXXX)",
      "string.pattern.base": "Invalid phone number format",
    }),
}).unknown(true);

exports.validateUser = async (req) => {
  try {
    const value = await userValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log("error from validate User method", error);
    throw new customError(401, error.details[0].message);
  }
};
