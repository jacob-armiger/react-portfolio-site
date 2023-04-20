import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import Navbar from "../components/NavigationBar";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Image
        src="/profile.jpg"
        alt="Picture of Jacob"
        quality={100}
        width={360}
        height={545}
      />

      <div className="max-w-prose text-center">
        <h1>Jacob Armiger</h1>

        <i>Welcome to my portfolio!</i>

        <p>
          I'm a special operations veteran pursuing a career in computer
          science. Looking to make meaningful changes in the lives of others in
          the world's most rapidly evolving industry.
        </p>

        <div className="space-x-5">
          <a target="_blank" href="https://github.com/jacob-armiger">
            Github
          </a>
          <a
            target="_blank"
            href="https://www.linkedin.com/in/jacob-armiger-64189317a/"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
