import { Outfit } from "next/font/google";
import "./globals.css";
import { UserContextProvider } from "@/context/UserContext";
import { SocketContextProvider } from "@/context/SocketContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "ChatCam",
  description:
    "ChatCam, here you can do video call and chatting with your friends",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <UserContextProvider>
          <SocketContextProvider>{children}</SocketContextProvider>
        </UserContextProvider>
      </body>
    </html>
  );
}
