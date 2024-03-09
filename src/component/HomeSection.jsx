"use client";
import React, { useEffect, useState } from "react";
import Hero from "./Hero";
import { useUserContext } from "@/context/UserContext.js";
import AllUsers from "./AllUsers";
function HomeSection() {
  const { user } = useUserContext();

  return (
    <div>
      {user ? (
        <div className="flex justify-center">
          <AllUsers />
        </div>
      ) : (
        <Hero />
      )}
    </div>
  );
}

export default HomeSection;
