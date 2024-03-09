"use client";
import React, { createContext, useContext, useState } from "react";

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [mysocket, setsocket] = useState();
  const setmysocket = (data) => {
    setsocket(data);
  };
  return (
    <SocketContext.Provider value={{ mysocket, setmysocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
