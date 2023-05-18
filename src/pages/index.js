import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    return (
        <div className="flex flex-col items-center md:flex-row">
            <div className="h-10/12 mx-6 mt-12 flex flex-col justify-center sm:ml-24 sm:mt-0 sm:h-screen sm:pb-48">
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

            <a
                className="mb-24 mt-16 h-14 w-32 rounded-full border border-black pt-3.5 text-center hover:border-b-4 hover:bg-gray-400 sm:m-auto"
                target="_blank"
                href="https://github.com/jacob-armiger"
            >
                Github
            </a>
        </div>
    );
}
