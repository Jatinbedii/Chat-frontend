"use client";
import { RiSendPlane2Fill } from "react-icons/ri";
import Image from "next/image";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSocketContext } from "@/context/SocketContext";
import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
function Page({ params }) {
  const chatref = useRef(null);
  const { user } = useUserContext();
  const { mysocket } = useSocketContext();
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [userinfo, setuserinfo] = useState();
  async function getUserInfo() {
    const res = await axios(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/singleuser/${params.id}`
    );
    if (res.data.error) {
      return;
    }

    setuserinfo(res.data);
  }
  useEffect(() => {
    getUserInfo();
  }, []);
  useEffect(() => {
    if (chatref.current) {
      chatref.current.scrollTop = chatref.current.scrollHeight;
    }
  }, [chat]);
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
    if (!message) {
      return;
    }
    mysocket.emit("personalmessage", {
      message,
      to: params.id,
      from: user._id,
    });
    setChat((oldchat) => [
      ...oldchat,
      { message, to: params.id, from: user._id },
    ]);
    const temp = message;
    setMessage("");
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/sendmessage`,
      { to: params.id, message: temp },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-sky-300">
      <div className="w-full bg-blue-900 fixed">
        {userinfo ? (
          <div className="flex flex-row gap-2 p-1">
            <Link href="/" className="text-white text-3xl h-full my-auto">
              <IoMdArrowRoundBack />
            </Link>

            <Image
              className="rounded-full border-white border-2"
              alt="profile"
              src={userinfo.profile}
              height={50}
              width={50}
            />

            <div className="flex flex-col pl-2 ">
              <div className="text-white">@{userinfo.username}</div>
              <div className="text-gray-400">{userinfo.email}</div>
            </div>
          </div>
        ) : (
          <div>Loading</div>
        )}
      </div>
      <div className="h-screen">
        <div
          className="max-w-[1200px] bg-sky-300 mx-auto h-screen overflow-y-auto"
          ref={chatref}
        >
          <div className="w-full h-[60px] bg-sky-300"></div>
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
                    ? "bg-white rounded-t-lg rounded-br-lg p-2 inline-block max-w-xs m-1 md:max-w-md"
                    : "bg-yellow-200 rounded-t-lg p-2 rounded-bl-lg inline-block max-w-xs m-1 md:max-w-md"
                }`}
              >
                {singlechat.message}
              </div>
            </div>
          ))}
          <div className="w-full h-[60px] bg-sky-300"></div>
        </div>

        <div className=" fixed bottom-0 w-full flex justify-center gap-1">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            className="max-w-[400px] rounded-3xl mb-2 border-2 border-blue-700 pl-1"
          />
          <button onClick={sendMessage} className="text-3xl mb-2 text-blue-900">
            <RiSendPlane2Fill />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
