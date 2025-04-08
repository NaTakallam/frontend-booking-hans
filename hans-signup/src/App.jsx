import { useState, useEffect } from 'react';
import './App.css';
import './index.css';
import StartForm from "./components/startForm"; 
import TestimonialComponent from "./components/testimonials"; 
import BookingCalendar from './components/ScheduleCalendar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingPage from './components/loadingPage';
import LanguagePartners from './components/languagePartners';
import SHA256 from 'crypto-js/sha256';

const hashedPassword = '451c8838ca2c88a1caef9bdac36e192b45edaf1903afb4a10fdd6a20c7a5e8d0';

const schedule = {
  "1": [{ "start_time": "07:00:00", "end_time": "12:00:00" }, { "start_time": "14:00:00", "end_time": "18:00:00" }],
  "2": [{ "start_time": "08:00:00", "end_time": "12:00:00" }],
  "3": [{ "start_time": "09:00:00", "end_time": "12:00:00" }, { "start_time": "13:00:00", "end_time": "16:00:00" }],
  "4": [{ "start_time": "07:00:00", "end_time": "22:00:00" }],
  "5": [{ "start_time": "10:00:00", "end_time": "12:00:00" }],
  "6": [{ "start_time": "08:00:00", "end_time": "11:00:00" }],
  "7": [{ "start_time": "15:00:00", "end_time": "18:00:00" }]
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const handleLogin = () => {
    const inputHash = SHA256(passwordInput).toString();
    if (inputHash === hashedPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md text-center">
          <h2 className="text-xl mb-4 font-semibold">🔐 Enter Password</h2>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="border rounded px-4 py-2 w-full mb-4"
          />
          <button
            onClick={handleLogin}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="flex h-screen font-fellix">
            <StartForm />
            <TestimonialComponent />
          </div>
        } />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/results" element={<LanguagePartners />} />
        <Route path="/booking" element={<BookingCalendar schedule={schedule} />} />
      </Routes>
    </Router>
  );
};

export default App;
