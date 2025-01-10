import InputField from "../components/InputField";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [loginInfo, setLoginInfo] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prevValue) => ({ ...prevValue, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = loginInfo;

    if(username === "" || password === ""){
        alert("Fill in All fields");
        return;
    }

    fetch("http://localhost:8081/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginInfo), // Send login data as JSON
      })
      .then((response) => response.json())
      .then((data)=> {
        if(data.success){
            navigate("/home");
        }
        else{
            alert(data.message || "Invalid Credentials")
        }
      })
      .catch((error) => {
        console.log(error);
        alert("something went wrong");
      })




  }

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center text-[#D3145A] mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <InputField
              label="Username"
              type="text"
              name="username"
              value={loginInfo.username}
              placeholder="Username"
              onChange={handleChange}
              required
              className="border-2 border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#D3145A] focus:border-[#D3145A]"
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              value={loginInfo.password}
              placeholder="Password"
              onChange={handleChange}
              className="border-2 border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#D3145A] focus:border-[#D3145A]"
              required
            />
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full py-2 bg-[#D3145A] text-white rounded-md hover:bg-[#7E155A] transition duration-200"
            >
              Log In
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {"Don't have an account? "}
              <Link to="/signup" className="text-[#D3145A] hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
