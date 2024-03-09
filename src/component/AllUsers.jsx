"use client";
import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
      <div>hi</div>
      {users && user ? (
        <div>
          {users.map((Singleuser) => {
            if (user.username != Singleuser.username)
              return (
                <Link href={`/chat/${Singleuser._id}`}>
                  {Singleuser.username}
                </Link>
              );
          })}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default AllUsers;
