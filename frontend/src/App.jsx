// import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/Home"
import { Link } from "react-router-dom";
const App = () => {

  return (
    <div className="">
        <Link to="/signup" className="bg-red-600 p-2 border">sign up page</Link>
        <Link to="/" className="bg-red-600 border p-2">home page</Link>
        <Link to="/login" className="bg-red-600 border p-2">login page</Link>

      


      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element = {<LoginPage />}/>
        <Route path = "/" element = {<HomePage />} />
      </Routes>
      
    </div>
  );
};


export default App
