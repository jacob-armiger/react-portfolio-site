import Link from "next/link";

export default function Button({ length, url = "", title = "Lorem Ipsum" }) {
    return (
        <Link
            className="h-14 w-40 rounded-3xl border border-black pt-3.5 text-center hover:border-b-4 hover:bg-gray-400 sm:m-auto"
            target="_blank"
            href={url}
        >
            {title}
        </Link>
    );
}
