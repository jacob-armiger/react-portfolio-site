import Link from "next/link";

export default function Button({ length, url = "", title = "Lorem Ipsum" }) {
    // bg-[#ba8c54]
    return (
        <Link
            className="h-14 w-40 rounded-3xl border border-b-4 border-black pt-3.5 text-center hover:border hover:bg-gray-400"
            target="_blank"
            href={url}
        >
            {title}
        </Link>
    );
}
