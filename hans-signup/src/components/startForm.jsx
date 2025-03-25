import { useState } from "react";
import "./LoginForm.css"; // Create a CSS file for styling
import LoginForm from "./loginForm"; 
import RegisterForm from "./registerForm"; 
import Form from "./stepProgress"; 

const StartForm = () => {
    // State to control which component is displayed
    const [currentComponent, setCurrentComponent] = useState(0); // Default to 0 (Login)

    // Function to render the correct component dynamically
    const renderComponent = () => {
        switch (currentComponent) {
            case 0:
                return <LoginForm setStep={setCurrentComponent} />;
            case 1:
                return <RegisterForm setStep={setCurrentComponent} />;
            case 2:
                return <Form />;
            default:
                return <LoginForm setStep={setCurrentComponent} />;
        }
    };
    
    return <>{renderComponent()}</>;
};

  
export default StartForm;