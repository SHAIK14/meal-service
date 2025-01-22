// src/contexts/DiningContext.jsx
import React, { createContext, useContext, useState } from "react";

const DiningContext = createContext(undefined);

export function DiningProvider({ children }) {
  const [branchDetails, setBranchDetails] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "Chinese";
  });

  const value = {
    branchDetails,
    setBranchDetails,
    currentCategory,
    setCurrentCategory,
  };

  return (
    <DiningContext.Provider value={value}>{children}</DiningContext.Provider>
  );
}

export function useDining() {
  const context = useContext(DiningContext);
  if (!context) {
    throw new Error("useDining must be used within a DiningProvider");
  }
  return context;
}
