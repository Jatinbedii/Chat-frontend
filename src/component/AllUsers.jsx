"use client";
import Image from "next/image";
import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Mouse_Memoirs } from "next/font/google";
const oi = Mouse_Memoirs({ weight: "400", subsets: ["latin"] });
function AllUsers() {
  const { user } = useUserContext();
  const [users, setusers] = useState();
  async function getUsers() {
    try {
      const res = await axios(`${process.env.NEXT_PUBLIC_BACKEND}/api/users`);
      console.log(res);
      setusers(res.data);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getUsers();
  }, []);
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
          <div className="bg-sky-300 min-h-screen">
            <div className="pt-[50px] max-w-[300px] 2 mx-auto">
              {users.map((Singleuser) => {
                if (user.username != Singleuser.username)
                  return (
                    <div className="w-full bg-sky-500 mt-1 rounded-md p-1">
                      <Link href={`/chat/${Singleuser._id}`}>
                        <div className="w-full flex flex-row">
                          <Image
                            src={Singleuser.profile}
                            alt="profile"
                            height={50}
                            width={50}
                            className="rounded-full border-blue-900 border-2"
                          />
                          <div className="h-full flex flex-col">
                            <div className="ml-1 text-white text-xl">
                              @{Singleuser.username}
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
