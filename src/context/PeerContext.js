"use client";
import React, { createContext, useContext, useState } from "react";

const PeerContext = createContext();

export const PeerContextProvider = ({ children }) => {
  const [mypeer, setpeer] = useState();
  const setmypeer = (data) => {
    setpeer(data);
  };
  return (
    <PeerContext.Provider value={{ setmypeer, mypeer }}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeerContext = () => useContext(PeerContext);
