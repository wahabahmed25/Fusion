export const validateField = (name, value) => {
//   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;

  switch (name) {
    case "username":
      if (!value) return "Username should not be empty";
    //   if (!emailPattern.test(value)) return "Invalid email format";
      break;
    case "password":
      if (!value) return "Password should not be empty";
      // if (!passwordPattern.test(value)) return "Incorrect Password, please try again";
      break;
    default:
      break;
  }
  return null;
};


//validates by checking all fields at once when subbitting
export const validateForm = (values) => {
  const errors = {};
  for (const [field, value] of Object.entries(values)) {
    const error = validateField(field, value);
    if (error) errors[field] = error;
  }
  return errors;
};
