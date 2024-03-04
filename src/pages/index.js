import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import Button from "@/components/Button";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    test();
  }, []);

  let test = async () => {
    try {
      let res = await fetch("https://my-express-backend.fly.dev/users", {
        method: "GET",
      });

      let data = await res.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-evenly sm:flex-row 2xl:justify-center 2xl:space-x-24">
      <div className="h-10/12 mx-6 mb-6 mt-12 flex flex-col justify-center pb-0 sm:ml-24 sm:mt-0 sm:h-screen sm:pb-48">
        <div className="pb-8 text-7xl sm:text-9xl">
          <p>Hello,</p>
          <p>I'm Jacob</p>
        </div>

        <div className="max-w-sm">
          <p className="text-left">
            I'm a special operations veteran pursuing a career in the world's
            most rapidly evolving industry.
          </p>
        </div>
      </div>

      <Button url={"https://github.com/jacob-armiger"} title={"Github"} />
    </div>
  );
}
