"use client";
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

function Hero() {
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
      setUser(res.data);
    }
  }
  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      VerifyJwt();
    }
    setLoading(false);
  }, []);
  async function RegisterHandler() {
    setError("");
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/register`,
      { email: mail, username, password }
    );

    if (res.status == 201) {
      setUser(res.data.user);
      localStorage.setItem("jwt", res.data.jwt);
    } else {
      setError(res.data.error);
    }
  }
  async function loginHandler() {
    setError("");
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/login`,
      {
        username,
        password,
      }
    );

    if (res.status == 201) {
      setUser(res.data.user);
      localStorage.setItem("jwt", res.data.jwt);
    } else {
      setError(res.data.error);
    }
  }

  return (
    <div className="min-h-screen bg-sky-400">
      {loading ? (
        <div>Loading</div>
      ) : (
        <div>
          <Dialog>
            <DialogTrigger>Login</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="w-full text-center">
                  Join CamChat
                </DialogTitle>
                <DialogDescription>
                  <Tabs defaultValue="login" className="max-w-[700px]">
                    <TabsList>
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Username"
                          className="w-fit"
                        />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-fit"
                        />
                        <button onClick={loginHandler}>Login</button>
                      </div>
                    </TabsContent>
                    <TabsContent value="register">
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Username"
                          className="w-fit"
                        />
                        <input
                          type="email"
                          value={mail}
                          onChange={(e) => setMail(e.target.value)}
                          placeholder="Email"
                          className="w-fit"
                        />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-fit"
                        />
                        <button onClick={RegisterHandler}>Login</button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default Hero;
