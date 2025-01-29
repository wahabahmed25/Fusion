// import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage"
import SavedPage from "./pages/SavedPage"
import PersonalProfilePage from "./pages/PersonalProfilePage";
// import { Link } from "react-router-dom";
import UserProfilePage from "./pages/UserProfilePage";
const App = () => {

  return (
    <div className="">
        {/* <Link to="/home" className="bg-red-600 p-2 border">Home page</Link>
        <Link to="/signup" className="bg-red-600 p-2 border">sign up page</Link>
        <Link to="/" className="bg-red-600 border p-2">App.jsx page</Link>
        <Link to="/login" className="bg-red-600 border p-2">login page</Link> */}

      


      <Routes>
        <Route path = "/userProfilePage/:user_id" element = {<UserProfilePage />} />
        <Route path = "/personalProfilePage" element = {<PersonalProfilePage />} />
        <Route path = "/saved" element = {<SavedPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element = {<LoginPage />}/>
        <Route path = "/home" element = {<HomePage />} />
      </Routes>
      
    </div>
  );
};


export default App
