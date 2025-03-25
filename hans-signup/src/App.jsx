import { useState } from 'react'
import './App.css'
import './index.css'
import StartForm from "./components/startForm"; 
import TestimonialComponent from "./components/testimonials"; 


const App = () => {

  return (
    <div className="flex h-screen font-fellix">
      {/* Left Section (Forms) */}
      <StartForm />
      {/* Right Section (Testimonial) */}
      <TestimonialComponent/>
      
    </div>
    
  );
};

export default App;