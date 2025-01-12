import InputField from "../components/InputField";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import imageBG from "../images/signup-BG.jpg";
const SignUpPage = () => {
  const [formValue, setFormValue] = useState({
    fullName: "",
    email: "",
    password: "",
    username: "",
  });
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const img = new Image();
    img.src = imageBG;
    img.onload = () => setImageLoaded(true);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8081/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formValue }), //send form values as JSON
      });

      if (response.ok) {
        console.log("User Registered successfully");
        navigate("/login"); //redirect to login page after success
      } else {
        console.error("Failed to register");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue((prevValues) => ({ ...prevValues, [name]: value }));
  };
  return (
    <div
      className={`relative overflow-hidden min-h-screen flex transition-opacity duration-300 ${
        imageLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: `url(${imageBG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-1/2 min-h-screen"></div>

      {/* Form container */}
      <div className="relative w-1/2 bg-black flex justify-center items-center">
        {/* <svg
          className="absolute top-0 left-0 h-full w-full z-0 transform scale-x-[-1]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 500"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 Q150,100 0,200 Q200,300 0,400 Q150,500 0,600 L0,100% L100,100% L100,0 Z"
            fill="black"
          />
        </svg> */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-[400px] p-5 rounded-md shadow-lg text-white"
        >
          <div>
            <h2 className="text-3xl font-bold text-center text-white mb-6">
              Sign Up
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <InputField
                label="Name"
                type="text"
                name="fullName"
                value={formValue.fullName}
                placeholder=""
                onChange={handleChange}
              />
              <InputField
                label="Username"
                type="text"
                name="username"
                value={formValue.username}
                placeholder=""
                onChange={handleChange}
              />
              <InputField
                label="Email Address"
                type="email"
                name="email"
                value={formValue.email}
                placeholder=""
                onChange={handleChange}
              />
              <InputField
                label="Password"
                type="password"
                name="password"
                value={formValue.password}
                placeholder=""
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#D3145A] text-white rounded-md hover:bg-[#7E155A] transition duration-200"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SignUpPage;
