import PropTypes from "prop-types";

const InputFieldTwo = ({
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
    <div className="mb-6">
      {label && (
        <label
          className="block mb-2 text-sm font-medium text-gray-100"
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
        className={`w-full border bg-gray-800 text-gray-100 p-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-600 focus:ring-purple-500"
        } ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500" data-testid={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

InputFieldTwo.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default InputFieldTwo;
