import { createContext, useContext, useState, useEffect } from "react";

const FormDataContext = createContext();


export const FormDataProvider = ({ children }) => {
  // Load from localStorage if exists
  const initialData = JSON.parse(localStorage.getItem("formData")) || {
    level: "",
    target_language: "English",
    timezone: "",
    availability: [],
    topic: [],
    skills: [],
    type_of_session: [],
    field_of_study: [],
  };

  const [formData, setFormData] = useState(initialData);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => useContext(FormDataContext);
