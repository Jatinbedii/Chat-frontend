"use client";
import React, { useEffect, useRef } from "react";
import Peer from "peerjs";
import { useSocketContext } from "@/context/SocketContext";
import { useRouter } from "next/navigation";
import { FaPhoneAlt } from "react-icons/fa";
function page({ params }) {
  const router = useRouter();
  const mycamreference = useRef(null);
  const hiscamreference = useRef(null);
  const { mysocket } = useSocketContext();
  function callcut(e) {
    mysocket.emit("callcutclient", { peer: params.id });
    router.push("/");
  }
  useEffect(() => {
    if (mysocket) {
      mysocket.on("callcut", () => {
        mycamreference.current = null;
        hiscamreference.current = null;
        router.push("/");
      });
    }
  }, [mysocket]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          mycamreference.current.srcObject = stream;
          const mypeer = new Peer();
          mypeer.on("open", (id) => {
            const call = mypeer.call(params.id, stream);

            call.on("stream", (remotestream) => {
              hiscamreference.current.srcObject = remotestream;
            });
          });
        });
    }
  }, []);
  return (
    <div className="bg-blue-300 min-h-screen">
      <div className="w-full text-center bg-blue-900 p-1 text-white text-2x">
        Video Call
      </div>
      <div className="w-full">
        {" "}
        <video
          ref={mycamreference}
          autoPlay
          className="bg-black border-blue-900 mt-3 max-w-[100px] md:max-w-[300px] mx-auto border-2 rounded-lg"
        />
      </div>

      <video
        className="bg-black border-blue-900 mt-3 max-w-[300px] md:max-w-[650px] mx-auto border-2 rounded-lg"
        ref={hiscamreference}
        autoPlay
      />
      <div className="w-full flex justify-center">
        <button
          onClick={callcut}
          className="text-red-600 text-3xl mt-3 mx-auto"
        >
          <FaPhoneAlt />
        </button>
      </div>
    </div>
  );
}

export default page;
