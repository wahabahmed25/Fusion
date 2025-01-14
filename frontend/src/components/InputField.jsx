import PropTypes from "prop-types";

const InputField = ({
  value,
  onChange,
  placeholder,
  type,
  label,
  name,
  error,
  className = "",
}) => {
  return (
    <div className="mb-10">
      {label && (
        <label
          className="block m-6 mb-2 text-sm font-medium text-white"
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        value={value}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-full p-4 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-white focus:ring-[#880E4F]"
        } bg-transparent ${className}`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500" data-testid={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

InputField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  error: PropTypes.string, // Added error as a string
  className: PropTypes.string,
};

export default InputField;
