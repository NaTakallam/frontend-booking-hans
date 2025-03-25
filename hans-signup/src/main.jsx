import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ This is important for createRoot!
import './index.css';
import App from './App.jsx';
import { FormDataProvider } from './components/FormDataContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FormDataProvider>
      <App />
    </FormDataProvider>
  </React.StrictMode>
);
