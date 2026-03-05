import { createContext, useContext, useState } from "react";
import React from "react";

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState({
    bgIntensity: 1,
    motionSensitivity: 1,
    blurStrength: 20,
    defaultPage: "dashboard",
    reduceMotion: false,
    theme: "dark"
  });

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}