import { useState } from 'react'
import './App.css'
import './index.css'
import StartForm from "./components/startForm"; 
import TestimonialComponent from "./components/testimonials"; 
import BookingCalendar from './components/ScheduleCalendar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingPage from './components/loadingPage';
import LanguagePartners from './components/LanguagePartners';

const schedule = {
  "1": [{ "start_time": "07:00:00", "end_time": "12:00:00" }, { "start_time": "14:00:00", "end_time": "18:00:00" }],
  "2": [{ "start_time": "08:00:00", "end_time": "12:00:00" }],
  "3": [{ "start_time": "09:00:00", "end_time": "12:00:00" }, { "start_time": "13:00:00", "end_time": "16:00:00" }],
  "4": [{ "start_time": "07:00:00", "end_time": "22:00:00" }],
  "5": [{ "start_time": "10:00:00", "end_time": "12:00:00" }],
  "6": [{ "start_time": "08:00:00", "end_time": "11:00:00" }],
  "7": [{ "start_time": "15:00:00", "end_time": "18:00:00" }]
};

// const App = () => {

//   return (
//     <div className="flex h-screen font-fellix">
//       {/* Left Section (Forms) */}
//       <StartForm />
//       {/* Right Section (Testimonial) */}
//       <TestimonialComponent/>
//       {/* <BookingCalendar schedule={schedule} /> */}
      
//     </div>
    
//   );
// };

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="flex h-screen font-fellix">
       {/* Left Section (Forms) */}
       <StartForm />
       {/* Right Section (Testimonial) */}
       <TestimonialComponent/>
       {/* <BookingCalendar schedule={schedule} /> */}
      
     </div>} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/results" element={<LanguagePartners />} />
        <Route path="/booking" element={<BookingCalendar schedule={schedule} />} />
      </Routes>
    </Router>
  );
}

export default App;