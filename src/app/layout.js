import { Outfit } from "next/font/google";
import "./globals.css";
import { UserContextProvider } from "@/context/UserContext";
import { SocketContextProvider } from "@/context/SocketContext";
import { PeerContextProvider } from "@/context/PeerContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <UserContextProvider>
          <SocketContextProvider>
            <PeerContextProvider>{children}</PeerContextProvider>
          </SocketContextProvider>
        </UserContextProvider>
      </body>
    </html>
  );
}
