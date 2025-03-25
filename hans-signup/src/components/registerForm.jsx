import { useState, useEffect } from "react";
import ntkLogo from "/NaTakallam-logo-2.png";

export default function RegisterForm({ setStep }) {
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    subscribe: false,
  });

  // Load saved data from localStorage when component mounts
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("userFormData"));
    if (savedData) {
      setFormData(savedData);
    }
  }, []);

  // Handle form input change and update localStorage
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    const updatedFormData = { ...formData, [name]: newValue };
    setFormData(updatedFormData);

    // Save updated form data to localStorage
    localStorage.setItem("userFormData", JSON.stringify(updatedFormData));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);

    // Proceed to the next step
    setStep(2);
  };

  return (
    <div className="w-1/2 flex justify-center items-center bg-white px-10 font-fellix">
      <div className="w-full max-w-sm text-center font-fellix">
        <img src={ntkLogo} alt="Logo" className="w-20 mb-5 mx-auto logo-ntk" />
        <h2 className="text-xl font-semibold text-black mb-2 font-fellix">
          Welcome Back
        </h2>
        <p className="text-sm text-lightGrey mb-5 font-fellix">
          Please enter your credentials
        </p>

        <div className="text-left mb-4">
          <label className="block text-sm font-bold mb-1 font-fellix">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border font-fellix border-blackInput rounded-md text-black text-sm shadow-sm"
            placeholder="Enter your name"
          />
        </div>

        <div className="text-left mb-4">
          <label className="block text-sm font-bold mb-1 font-fellix">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border font-fellix border-blackInput rounded-md text-black text-sm shadow-sm"
            placeholder="Enter your email"
          />
        </div>

        <div className="text-left mb-4">
          <label className="block text-sm font-bold mb-1 font-fellix">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border font-fellix border-blackInput rounded-md text-black text-sm shadow-sm"
            placeholder="••••••••"
          />
        </div>

        <div className="text mb-12 flex justify-between">
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="subscribe"
              name="subscribe"
              checked={formData.subscribe}
              onChange={handleChange}
            />
            <label htmlFor="subscribe" className="subscribe font-fellix">
              Subscribe to our Newsletter
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full font-fellix p-3 bg-primary text-white font-bold uppercase tracking-wide rounded-md hover:bg-white hover:text-primary border border-primary transition"
        >
          CREATE ACCOUNT
        </button>

        <div className="flex items-center justify-center font-fellix mt-5 text-sm text-gray-500 font-bold uppercase">
          <div className="flex-1 h-px bg-gray-300 mx-2"></div> OR{" "}
          <div className="flex-1 h-px bg-gray-300 mx-2"></div>
        </div>

        <button
          onClick={() => setStep(0)}
          className="w-full font-fellix p-3 mt-3 bg-transparent border border-primary text-primary font-bold uppercase tracking-wide rounded-md hover:bg-primary hover:text-white transition"
        >
          SIGN IN
        </button>
      </div>
    </div>
  );
}