"use client";
import { AiFillWarning } from "react-icons/ai";
import Image from "next/image";
import { Mouse_Memoirs } from "next/font/google";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useUserContext } from "@/context/UserContext.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocketContext } from "@/context/SocketContext";
import { io } from "socket.io-client";
import { Progress } from "@/components/ui/progress";
import { usePeerContext } from "@/context/PeerContext";
const oi = Mouse_Memoirs({ subsets: ["latin"], weight: "400" });
function Hero() {
  const [progress, setProgress] = useState(5);
  const { mysocket, setmysocket } = useSocketContext();
  const { setmypeer, mypeer } = usePeerContext();
  const { user, setUser } = useUserContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mail, setMail] = useState("");
  const [loading, setLoading] = useState(true);
  async function VerifyJwt() {
    const res = await axios(`${process.env.NEXT_PUBLIC_BACKEND}/api/user`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    });

    if (!res.data.error) {
      const socket = io(process.env.NEXT_PUBLIC_BACKEND);
      socket.emit("registerid", { id: res.data._id });
      setmysocket(socket);
      setUser(res.data);
    }
  }
  useEffect(() => {
    setProgress(0);

    if (localStorage.getItem("jwt")) {
      VerifyJwt();
    }
    setProgress(35);

    const delay = setTimeout(() => {
      setProgress(80);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }, 500);
    return () => clearTimeout(delay);
  }, []);
  async function RegisterHandler() {
    setError("");
    if (!username || !password) {
      return setError("Fill all fields");
    }
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/register`,
      { email: mail, username, password }
    );

    if (res.status == 201) {
      const socket = io(process.env.NEXT_PUBLIC_BACKEND);
      socket.emit("registerid", { id: res.data.user._id });
      setmysocket(socket);
      setUser(res.data.user);
      localStorage.setItem("jwt", res.data.jwt);
    } else {
      setError(res.data.error);
    }
  }
  async function loginHandler() {
    setError("");
    if (!username || !password) {
      return setError("Fill all fields");
    }
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/login`,
      {
        username,
        password,
      }
    );

    if (res.status == 201) {
      const socket = io(process.env.NEXT_PUBLIC_BACKEND);
      socket.emit("registerid", { id: res.data.user._id });
      setmysocket(socket);

      setUser(res.data.user);
      localStorage.setItem("jwt", res.data.jwt);
    } else {
      setError(res.data.error);
    }
  }

  return (
    <div className="min-h-screen bg-sky-300">
      {loading ? (
        <div>
          <div>
            <h1 className="w-full text-center text-blue-900  pt-6 text-8xl lg:text-7xl">
              <span className={oi.className}>Cam Chat</span>
            </h1>
            <h2 className="w-full text-center  text-white bordered-text lg:text-4xl">
              Chat or Video call with friends{" "}
            </h2>
            <div className="w-full mt-8">
              {" "}
              <Image
                className="mx-auto"
                height={500}
                width={500}
                alt="logo"
                src={"/dino.png"}
              />
            </div>
            <div className="mt-9 w-full">
              <Progress
                value={progress}
                className="max-w-[300px] m-1 mx-auto"
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-around pt-3 flex-col sm:flex-row">
            <Image src={"/dino.png"} alt="logo" height={200} width={200} />
            <div className="bordered-text text-9xl sm:w-full md:w-fit text-center">
              <span className={`${oi.className} mt-9`}>Cam Chat</span>
            </div>
          </div>
          <div className="flex justify-center">
            <Dialog>
              <DialogTrigger>
                <button className="bg-white border-2 border-black rounded-full pr-3 pl-3 text-2xl">
                  Join
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="w-full text-center">
                    Join CamChat
                  </DialogTitle>
                  <DialogDescription>
                    <Tabs defaultValue="login" className="max-w-[700px]">
                      <TabsList className="grid max-w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login">
                        <span className="flex flex-col gap-2 bg-sky-300 rounded-lg p-1">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-fit rounded-full p-1 mx-auto border-2 border-sky-600"
                          />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-fit rounded-full p-1 mx-auto border-2 border-sky-600"
                          />
                          <div>
                            {error ? (
                              <div className="w-fit mx-auto text-black bg-yellow-500 pl-2 pr-2 rounded-md border-2 border-black flex flex-row gap-1">
                                <span className=" text-xl">
                                  <AiFillWarning />
                                </span>{" "}
                                {error}
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                          <button
                            onClick={loginHandler}
                            className="bg-blue-500 w-fit mx-auto p-1 rounded-lg border-2 border-black text-black"
                          >
                            Login
                          </button>
                        </span>
                      </TabsContent>
                      <TabsContent value="register">
                        <span className="flex flex-col gap-2 bg-sky-300 rounded-lg p-1">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-fit rounded-full p-1 mx-auto border-2 border-sky-600"
                          />
                          <input
                            type="email"
                            value={mail}
                            onChange={(e) => setMail(e.target.value)}
                            placeholder="Email"
                            className="w-fit rounded-full p-1 mx-auto border-2 border-sky-600"
                          />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-fit rounded-full p-1 mx-auto border-2 border-sky-600"
                            placeholder="Password"
                          />
                          <div>
                            {error ? (
                              <div className="w-fit mx-auto text-black bg-yellow-500 pl-2 pr-2 rounded-md border-2 border-black flex flex-row gap-1">
                                <span className=" text-xl">
                                  <AiFillWarning />
                                </span>{" "}
                                {error}
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                          <button
                            className="bg-blue-500 w-fit mx-auto p-1 rounded-lg border-2 border-black text-black"
                            onClick={RegisterHandler}
                          >
                            Regiser
                          </button>
                        </span>
                      </TabsContent>
                    </Tabs>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex justify-center mt-3">
            <div className="max-w-[700px] m-1 ">
              <div className="w-full h-[20px] bg-blue-900 rounded-t-full"></div>
              <div className="w-full bg-blue-900 p-2 text-white">
                "Cam Chat" is your premier destination for seamless,
                personalized one-on-one chatting experiences with the added
                option of video calls. As a dynamic chatting app, it offers
                users the opportunity to connect instantly with others in
                real-time, fostering meaningful interactions and connections.
                With Cam Chat, users can engage in text-based conversations with
                ease, allowing for fluid communication without any
                interruptions. Whether it's casual banter, deep discussions, or
                sharing interests, the platform provides a versatile environment
                for diverse interactions. But Cam Chat doesn't stop there – it
                elevates the experience by offering one-on-one video calls. This
                feature brings conversations to life, allowing users to see and
                hear each other in real-time, creating a more immersive and
                personal connection. Whether catching up with friends, meeting
                new people, or conducting virtual business meetings, the video
                call feature ensures that interactions are as authentic and
                engaging as possible. The interface of Cam Chat is intuitive and
                user-friendly, ensuring a seamless experience for both seasoned
                chatters and newcomers alike. Robust privacy and security
                measures are also implemented to safeguard users' personal
                information and ensure a safe chatting environment. In essence,
                Cam Chat is not just another chatting app – it's a platform that
                fosters genuine connections through its combination of
                text-based conversations and one-on-one video calls, redefining
                the way people interact and communicate online.
              </div>
              <div className="w-full h-[20px] bg-blue-900 rounded-b-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hero;
