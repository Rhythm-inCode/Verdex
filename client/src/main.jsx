import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from "react";
import { PreferencesProvider } from "./context/PreferencesContext";

createRoot(document.getElementById('root')).render(

  <PreferencesProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </PreferencesProvider>
)
