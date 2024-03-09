"use client";
import { useSocketContext } from "@/context/SocketContext";
import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState } from "react";

function Page({ params }) {
  const { user } = useUserContext();
  const { mysocket } = useSocketContext();
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (mysocket) {
      mysocket.on("personalmessage", (data) => {
        if (data.to == user._id && data.from == params.id) {
          setChat((oldchat) => [...oldchat, data]);
        }
      });
    }
  }, [mysocket]);
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  async function getAllMessages() {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/chat/${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );

    setChat(res.data);
  }

  useEffect(() => {
    getAllMessages();
  }, []);

  const sendMessage = async () => {
    console.log(mysocket);
    console.log(user._id);
    mysocket.emit("personalmessage", {
      message,
      to: params.id,
      from: user._id,
    });
    setChat((oldchat) => [
      ...oldchat,
      { message, to: params.id, from: user._id },
    ]);

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
      <div className="max-w-[1200px] bg-yellow-300 mx-auto">
        {chat.map((singlechat) => (
          <div
            key={singlechat._id}
            className={`${
              singlechat.from === params.id ? "text-left" : "text-right"
            }`}
          >
            <div
              className={`${
                singlechat.from === params.id
                  ? "bg-blue-300 rounded-lg p-2 inline-block max-w-xs m-1 md:max-w-md"
                  : "bg-gray-300 rounded-lg p-2 inline-block max-w-xs m-1 md:max-w-md"
              }`}
            >
              {singlechat.message}
            </div>
          </div>
        ))}
        <input type="text" value={message} onChange={handleMessageChange} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Page;
