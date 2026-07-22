"use client";

import React, { createContext, useContext, useState } from "react";

type TabContextType = {
  activeTab: number;
  setActiveTab: (tab: number) => void;
};

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabContext must be used within TabProvider");
  }
  return context;
};