"use client";
import { FaPhoneAlt } from "react-icons/fa";

import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mouse_Memoirs } from "next/font/google";
import { useSocketContext } from "@/context/SocketContext";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";
import { ToastAction } from "@/components/ui/toast";
import Peer from "peerjs";

const oi = Mouse_Memoirs({ weight: "400", subsets: ["latin"] });

function AllUsers() {
  const mycamreference = useRef(null);
  const hiscamreference = useRef(null);
  const [showincomingcall, setshowincomingcall] = useState(false);
  const path = usePathname();
  const { toast } = useToast();
  const { mysocket } = useSocketContext();
  const { user } = useUserContext();
  const [users, setUsers] = useState([]);
  const userRef = useRef(null);
  const callinguser = useRef(null);

  async function getUsers() {
    try {
      const res = await axios(`${process.env.NEXT_PUBLIC_BACKEND}/api/users`);
      setUsers(res.data);
      userRef.current = res.data;
    } catch (error) {
      console.log(error);
    }
  }
  async function call(peerid) {
    if (typeof window !== "undefined") {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mycamreference.current.srcObject = stream;
      const mypeer = new Peer();
      mypeer.on("open", (id) => {
        const call = mypeer.call(peerid, stream);

        call.on("stream", (remotestream) => {
          hiscamreference.current.srcObject = remotestream;
        });
      });
    }
  }
  useEffect(() => {
    if (mysocket && path === "/") {
      const handlePersonalMessage = (data) => {
        const name = userRef.current.find(
          (singleuser) => singleuser._id === data.from
        );

        toast({
          title: `from, @${name.username}`,
          description: data.message,
        });
      };
      mysocket.on("callcut", () => {
        mycamreference.current = null;
        hiscamreference.current = null;
        setshowincomingcall(null);
      });
      mysocket.on("personalmessage", handlePersonalMessage);
      mysocket.on("callcoming", ({ from, peerid }) => {
        toast({
          title: "Call incoming",
          description: ".",
          action: (
            <ToastAction
              altText="answer"
              onClick={(e) => {
                setshowincomingcall(true);
                call(peerid);
              }}
            >
              answer
            </ToastAction>
          ),
        });
      });

      return () => {
        mysocket.off("personalmessage", handlePersonalMessage);
      };
    }
  }, [mysocket, path, toast]);

  useEffect(() => {
    if (path === "/") {
      getUsers();
    }
  }, [path]);

  return (
    <div>
      {users && user ? (
        <div className="w-full">
          <nav className="flex justify-between md:justify-around w-full bg-blue-900 fixed">
            <div className={`text-5xl text-white ${oi.className}`}>
              Cam Chat
            </div>
            <div>
              <Image
                height={50}
                width={50}
                alt="profile picture"
                src={user.profile}
                className="border-2 border-black rounded-full"
              />
            </div>
          </nav>
          <Toaster />
          {showincomingcall ? (
            <div className="z-50 absolute w-full top-0">
              <div className=" w-[300px]  mx-auto bg-white border-2 border-black p-2 rounded-lg">
                <div className="w-fit mx-auto">Video call</div>
                <video
                  className="max-w-[60px] mb-1 rounded-md border-2 border-blue-900 bg-black"
                  autoPlay
                  ref={mycamreference}
                />
                <video
                  className="max-w-[280px] rounded-lg border-2 border-blue-900 bg-black"
                  autoPlay
                  ref={hiscamreference}
                />
                <div className="w-full flex justify-center pt-1">
                  <button className="text-red-500 ">
                    <FaPhoneAlt />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <span></span>
          )}
          <div className="bg-sky-300 min-h-screen">
            <div className="pt-[50px] max-w-[300px] 2 mx-auto">
              {users.map((singleUser) => {
                if (user.username !== singleUser.username)
                  return (
                    <div
                      key={singleUser._id}
                      className="w-full bg-sky-500 mt-1 rounded-md p-1"
                    >
                      <Link href={`/chat/${singleUser._id}`}>
                        <div className="w-full flex flex-row">
                          <Image
                            src={singleUser.profile}
                            alt="profile"
                            height={50}
                            width={50}
                            className="rounded-full border-blue-900 border-2"
                          />
                          <div className="h-full flex flex-col">
                            <div className="ml-1 text-white text-xl">
                              @{singleUser.username}
                            </div>
                            <div>.</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center"></div>
      )}
    </div>
  );
}

export default AllUsers;
