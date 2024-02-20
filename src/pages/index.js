import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import Button from "@/components/Button";

export default function Home() {
    return (
        <div className="flex flex-col items-center md:flex-row">
            <div className="h-10/12 mx-6 mb-6 mt-12 flex flex-col justify-center pb-0 sm:ml-24 sm:mt-0 sm:h-screen sm:pb-48">
                <div className="pb-8">
                    <p className="text-7xl sm:text-9xl">Hello,</p>
                    <p className="text-7xl sm:text-9xl">I'm Jacob</p>
                </div>

                <div className="max-w-sm">
                    <p className="text-left">
                        I'm a special operations veteran pursuing a career in
                        the world's most rapidly evolving industry.
                    </p>
                </div>
            </div>

            <Button url={"https://github.com/jacob-armiger"} title={"Github"} />
        </div>
    );
}
