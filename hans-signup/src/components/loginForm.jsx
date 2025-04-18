import { useState, useEffect } from "react";
import ntkLogo from '/NaTakallam-logo-2.png';
import { useFormData } from './FormDataContext';

const LoginForm = ({ setStep }) => {
  const { setFormData } = useFormData();

  const [email, setEmail] = useState(() => {
    const storedData = localStorage.getItem("loginData");
    return storedData ? JSON.parse(storedData).email : '';
  });

  const [password, setPassword] = useState(() => {
    const storedData = localStorage.getItem("loginData");
    return storedData ? JSON.parse(storedData).password : '';
  });

  const [rememberMe, setRememberMe] = useState(() => {
    const storedData = localStorage.getItem("loginData");
    return storedData ? JSON.parse(storedData).rememberMe : false;
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password,
      rememberMe
    };

    localStorage.setItem("loginData", JSON.stringify(loginData));

    setFormData(prev => ({
      ...prev,
      ...loginData
    }));

    // Also merge into unified formData in localStorage
    const existingFormData = JSON.parse(localStorage.getItem("formData")) || {};
    const mergedFormData = {
      ...existingFormData,
      ...loginData
    };
    localStorage.setItem("formData", JSON.stringify(mergedFormData));

    setStep(2); // Proceed to next step
  };

  return (
    <div className="w-1/2 flex font-fellix justify-center items-center bg-white px-10">
      <div className="w-full max-w-sm text-center">
        <img src={ntkLogo} alt="Logo" className="w-20 mb-5 mx-auto logo-ntk" />
        <h2 className="text-xl font-fellix text-black mb-2">Welcome Back</h2>
        <p className="text-sm text-lightGrey mb-5 font-fellix">Please enter your credentials</p>

        <div className="text-left mb-4">
          <label className="block text-sm font-bold mb-1 font-fellix">Email</label>
          <input
            type="email"
            name="email"
            className="w-full p-3 border border-blackInput rounded-md text-black text-sm shadow-sm font-fellix"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="text-left mb-4">
          <label className="block text-sm font-bold mb-1 font-fellix">Password</label>
          <input
            type="password"
            name="password"
            className="w-full p-3 border border-blackInput rounded-md text-black text-sm shadow-sm font-fellix"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="text mb-12 flex justify-between">
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="subscribe font-fellix">Remember Me</label>
          </div>
          <div className="forget-pass">
            <a href="#" className="forget-color font-fellix">Forget Password?</a>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full p-3 bg-primary text-white font-bold uppercase tracking-wide rounded-md hover:bg-white hover:text-primary border border-primary transition font-fellix"
        >
          SIGN IN
        </button>

        <div className="flex items-center justify-center mt-5 text-sm text-gray-500 font-bold uppercase font-fellix">
          <div className="flex-1 h-px bg-gray-300 mx-2"></div>
          OR
          <div className="flex-1 h-px bg-gray-300 mx-2"></div>
        </div>

        <button
          onClick={() => setStep(1)}
          className="w-full font-fellix p-3 mt-3 bg-transparent border border-primary text-primary font-bold uppercase tracking-wide rounded-md hover:bg-primary hover:text-white transition"
        >
          CREATE ACCOUNT
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
