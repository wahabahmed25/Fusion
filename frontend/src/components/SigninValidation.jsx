export const validateField = (name, value) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;
  const usernamePattern = /^[a-zA-Z0-9\-.$&?!_%~|<>]+$/;
  const namePattern = /^[a-zA-Z\s]+$/;

  switch (name) {
    case "fullName":
      if (!value) return "Name should not be empty";
      if (!namePattern.test(value)) return "Name can only contain letters and spaces";
      if (value.trim().split(" ").length < 2) return "Please provide both first and last name";
      break;

    case "email":
      if (!value) return "Email should not be empty";
      if (!emailPattern.test(value)) return "Invalid email format";
      break;

    case "username":
      if (!value) return "Username should not be empty";
      if (!usernamePattern.test(value)) return "Username can only contain letters, numbers, and these symbols: -.$&?!_%~|<>";
      if (value.length < 3) return "Username must be at least 3 characters long";
      if (value.length > 20) return "Username must not exceed 20 characters";
      break;

    case "password":
      if (!value) return "Password should not be empty";
      if (!passwordPattern.test(value))
        return "Password must be at least 8 characters, include a digit, a lowercase, and an uppercase letter";
      break;

    default:
      break;
  }
  return null;
};

// Validates all fields at once when submitting
export const validateForm = (values) => {
  const errors = {};
  for (const [field, value] of Object.entries(values)) {
    const error = validateField(field, value);
    if (error) errors[field] = error;
  }
  return errors;
};
