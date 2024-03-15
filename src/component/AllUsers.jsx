"use client";
import { ClipLoader } from "react-spinners";
import { BiSolidSend } from "react-icons/bi";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { FaPhoneAlt } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mouse_Memoirs } from "next/font/google";
import { useSocketContext } from "@/context/SocketContext";
import { Toaster } from "@/components/ui/toaster";

import { useToast } from "@/components/ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { ToastAction } from "@/components/ui/toast";
import Peer from "peerjs";

const oi = Mouse_Memoirs({ weight: "400", subsets: ["latin"] });

function AllUsers() {
  const [changingpfp, setchangingpfp] = useState(false);
  const router = useRouter();
  const [img, setimg] = useState();
  const path = usePathname();
  const { toast } = useToast();
  const { mysocket, setmysocket } = useSocketContext();
  const { user, setUser } = useUserContext();
  const [users, setUsers] = useState([]);
  const userRef = useRef(null);
  function logout() {
    localStorage.removeItem("jwt");
    setmysocket(null);
    setUser(null);
  }
  async function getUsers() {
    try {
      const res = await axios(`${process.env.NEXT_PUBLIC_BACKEND}/api/users`);
      setUsers(res.data);
      userRef.current = res.data;
    } catch (error) {
      console.log(error);
    }
  }
  async function uploadimage() {
    setchangingpfp(true);
    const data = new FormData();
    data.append("file", img);
    data.append("upload_preset", "videoapp");
    data.append("cloud_name", "dur15pcjs");
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dur15pcjs/image/upload",
      data
    );
    const res2 = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/changepfp`,
      { image: res.data.secure_url },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );
    if (!res2.data.error) {
      setUser(res2.data);
    }
    setchangingpfp(false);
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

      mysocket.on("personalmessage", handlePersonalMessage);
      mysocket.on("callcoming", ({ from, peerid }) => {
        toast({
          title: "Call incoming",
          description: ".",
          action: (
            <ToastAction
              altText="answer"
              onClick={(e) => {
                router.push(`/videocall/${peerid}`);
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
              <Sheet>
                <SheetTrigger>
                  {" "}
                  <Image
                    height={50}
                    width={50}
                    alt="profile picture"
                    src={user.profile}
                    className="border-2 border-black rounded-full"
                  />
                </SheetTrigger>
                <SheetContent className="bg-sky-300">
                  <SheetHeader>
                    <SheetTitle className="w-full text-center">
                      @{user.username}
                    </SheetTitle>
                    <SheetDescription>
                      <div className="w-full flex justify-center">
                        <div className="flex flex-col">
                          <Image
                            height={50}
                            width={50}
                            alt="profile picture"
                            src={user.profile}
                            className="border-2 mx-auto border-black rounded-full"
                          />
                          <div className="text-gray-800">{user.email}</div>
                          <div className="w-full h-[30px]"></div>
                          <Dialog>
                            <DialogTrigger>
                              {" "}
                              <button className="bg-red text-white p-1 rounded-3xl bg-blue-600">
                                Change Profile
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Change your Profile Picture
                                </DialogTitle>
                                <DialogDescription>
                                  <div className="flex flex-col">
                                    Select your new Profile
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setimg(e.target.files[0])}
                                    className="rounded-3xl bg-sky-300 p-1"
                                  />{" "}
                                  {changingpfp ? (
                                    <ClipLoader loading="true" size={20} />
                                  ) : (
                                    <BiSolidSend
                                      className="text-blue text-3xl"
                                      onClick={uploadimage}
                                    />
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                          <button
                            className="bg-red text-white p-1 rounded-3xl bg-red-600 mt-2"
                            onClick={logout}
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
          <Toaster />
          <div className="bg-sky-300 min-h-screen">
            <div className="pt-[55px] max-w-[300px] 2 mx-auto">
              <div className="w-full text-2xl text-center text-blue-900 font-medium">
                Users
              </div>
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
                            <div className="text-sm pl-2 text-gray-600">
                              {singleUser.email}
                            </div>
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
