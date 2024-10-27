import react, { useState } from "react"

export default function BookCard({ book }: any) {

    const [expand, setExpand] = useState(false);

    return (
        <div
            onClick={() => {setExpand(!expand)}}
            className={`${expand && book["My Review"] ? "row-span-2 max-h-[20.75rem] overflow-y-scroll" : "h-36"} ${book["My Review"] ? "hover:cursor-pointer" : ""} grid border border-solid border-black text-xl p-4 m-5 rounded-md transition-all duration-600 overflow-y-clip `}
        >
            <div>
                <p className="font-bold">{book.Title}</p>
                <p className="italic pb-3 text-sm">by {book.Author}</p>
                <p className="whitespace-pre-line">{book["My Review"]}</p>
            </div>
        </div>
    )
}