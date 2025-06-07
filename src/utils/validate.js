const validator = require("validator");

const validateSignUpData = async (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new Error("FirstName,LastName,Email,Password is required");
  } else if (!validator.isEmail(email)) {
    throw new Error("Please Enter Valid Email format");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special symbol"
    );
  }
};

const validateEditProfileData = async (data) => {
  const ALLOWED_UPDATES = [
    "about",
    "skills",
    "photoUrl",
    "age",
    "lastName",
    "firstName",
  ];
  const isEditAllowed = Object.keys(data).every((field) =>
    ALLOWED_UPDATES.includes(field)
  );
  return isEditAllowed;
};

module.exports = {validateSignUpData,validateEditProfileData};
