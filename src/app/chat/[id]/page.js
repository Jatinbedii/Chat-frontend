"use client";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

import { PiVideoCameraFill } from "react-icons/pi";
import { BiSolidSend } from "react-icons/bi";
import { FaImage } from "react-icons/fa6";
import { MdEmojiEmotions } from "react-icons/md";
import { RiSendPlane2Fill } from "react-icons/ri";
import Image from "next/image";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSocketContext } from "@/context/SocketContext";
import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Picker from "emoji-picker-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClipLoader } from "react-spinners";
import Peer from "peerjs";
function Page({ params }) {
  const [peer, setpeer] = useState();
  const { toast } = useToast();
  const router = useRouter();
  const chatref = useRef(null);
  const { user } = useUserContext();
  const { mysocket } = useSocketContext();
  const [chat, setChat] = useState([]);
  const [mystream, setmystream] = useState();
  const [sendingImage, setSendingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [userinfo, setuserinfo] = useState();
  const [showcallscreen, setshowcallscreen] = useState(false);
  const [img, setimg] = useState();

  const myvidref = useRef(null);
  const hisvidref = useRef(null);
  async function getUserInfo() {
    const res = await axios(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/singleuser/${params.id}`
    );
    if (res.data.error) {
      return;
    }

    setuserinfo(res.data);
  }
  async function callhandler() {
    if (typeof window !== "undefined") {
      setshowcallscreen(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (!stream) {
        setshowcallscreen(false);
        return;
      }
      const myPeer = new Peer();
      setpeer(myPeer);

      setmystream(stream);
      myPeer.on("open", (id) => {
        mysocket.emit("call", { to: params.id, from: user._id, peerid: id });
      });
      if (myvidref.current) {
        myvidref.current.srcObject = stream;
      }
    }
  }
  useEffect(() => {
    if (peer) {
      peer.on("call", (call) => {
        call.answer(mystream);
        call.on("stream", (remotestream) => {
          hisvidref.current.srcObject = remotestream;
        });
      });
    }
  }, [peer]);
  async function SendImage() {
    if (!img) {
      return;
    }
    setSendingImage(true);
    const data = new FormData();
    data.append("file", img);
    data.append("upload_preset", "videoapp");
    data.append("cloud_name", "dur15pcjs");
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dur15pcjs/image/upload",
        data
      );
      const res2 = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/sendimage`,
        { type: "image", to: params.id, message: res.data.secure_url },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      setChat((oldchat) => [
        ...oldchat,
        {
          message: res.data.secure_url,
          to: params.id,
          from: user._id,
          type: "image",
        },
      ]);
      mysocket.emit("personalmessage", {
        message: res.data.secure_url,
        to: params.id,
        from: user._id,
        type: "image",
      });
      setSendingImage(false);
    } catch {
      setSendingImage(false);
    }
  }
  useEffect(() => {
    if (!user && !mysocket) {
      router.push("/");
    }
  }, []);
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
      mysocket.on("offline", () => {
        setshowcallscreen(false);
        toast({
          title: "OFFLINE",
          description: "User is offline",
        });
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
      type: "text",
    });
    setChat((oldchat) => [
      ...oldchat,
      { message, to: params.id, from: user._id, type: "text" },
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
          <div className="p-1 flex justify-between md:pr-10 md:pl-10">
            <div className="flex flex-row gap-1">
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

            <PiVideoCameraFill
              className="text-white  text-4xl mt-2"
              onClick={callhandler}
            />
          </div>
        ) : (
          <div className="flex justify-center p-2">
            <ClipLoader size={35} color="white" />
          </div>
        )}
      </div>
      {showcallscreen ? (
        <div className="z-50 relative w-[300px]  top-0 bg-white">
          <video className="min-w-[100px] " ref={myvidref} autoPlay />
          <video className="min-w-[100px] " ref={hisvidref} autoPlay />
        </div>
      ) : (
        <span></span>
      )}
      <Toaster />
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
                    ? "bg-white rounded-t-lg rounded-br-lg  inline-block max-w-xs m-1 md:max-w-md"
                    : "bg-yellow-200 rounded-t-lg  rounded-bl-lg  inline-block m-1 max-w-xs md:max-w-md"
                }`}
              >
                {singlechat.type == "text" ? (
                  <p className="p-2 w-full">{singlechat.message}</p>
                ) : (
                  <img src={singlechat.message} className="p-1 w-full" />
                )}
              </div>
            </div>
          ))}
          <div className="w-full h-[70px] bg-sky-300"></div>
        </div>
        <div className="fixed bottom-10 w-full flex justify-center gap-3">
          <Dialog>
            <DialogTrigger>
              <FaImage className="text-yellow-400 bg-black rounded-sm text-3xl  " />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Image</DialogTitle>
                <DialogDescription>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setimg(e.target.files[0])}
                    className="rounded-3xl bg-sky-300 p-1"
                  />
                  {sendingImage ? (
                    <ClipLoader loading="true" size={20} />
                  ) : (
                    <BiSolidSend
                      className="text-blue text-3xl"
                      onClick={SendImage}
                    />
                  )}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger>
              <MdEmojiEmotions className="text-yellow-400 bg-black rounded-full text-3xl  " />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Emoji</DialogTitle>
                <DialogDescription>
                  <Picker
                    onEmojiClick={(emoji) => {
                      setMessage(message + emoji.emoji);
                    }}
                  />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
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
