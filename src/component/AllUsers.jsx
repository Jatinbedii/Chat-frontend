"use client";

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

const oi = Mouse_Memoirs({ weight: "400", subsets: ["latin"] });

function AllUsers() {
  const path = usePathname();
  const { toast } = useToast();
  const { mysocket } = useSocketContext();
  const { user } = useUserContext();
  const [users, setUsers] = useState([]);
  const userRef = useRef(null);

  async function getUsers() {
    try {
      const res = await axios(`${process.env.NEXT_PUBLIC_BACKEND}/api/users`);
      setUsers(res.data);
      userRef.current = res.data;
    } catch (error) {
      console.log(error);
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

      mysocket.on("personalmessage", handlePersonalMessage);

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
