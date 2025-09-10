import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getColors } from "../components/ui/colors"; // ✅ added import

type ThemeContextType = {
  darkMode: boolean;
  colors: ReturnType<typeof getColors>; // ✅ added colors to context
  toggleDarkMode: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: true,
  colors: getColors(true), // ✅ default dark
  toggleDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value !== null) setDarkMode(value === "true");
    });
  }, []);

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    await AsyncStorage.setItem("darkMode", newValue.toString());
  };

  const colors = getColors(darkMode); // ✅ added

  return (
    <ThemeContext.Provider value={{ darkMode, colors, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
