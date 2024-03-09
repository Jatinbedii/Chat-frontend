"use client";
import axios from "axios";
import React, { useState } from "react";

function Page({ params }) {
  const [message, setMessage] = useState("");

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessage = async () => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/sendmessage`,
      { to: params.id, message },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );
    console.log(res);
  };

  return (
    <div>
      <div>
        <input type="text" value={message} onChange={handleMessageChange} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Page;
