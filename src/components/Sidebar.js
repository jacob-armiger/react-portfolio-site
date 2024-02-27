import { useState, useEffect } from "react";
import { compareAuthor, compareTitle, compareStars } from "@/utils/helper";

export default function Sidebar({ updateBooks, browsing, books }) {
    const [sortType, setSortType] = useState(null);

    useEffect(() => {
        // Shallow copy array so state can be updated in parent
        let sorted_books = [...books];

        if (sortType == "title") {
            sorted_books.sort(compareTitle);
        } else if (sortType == "stars") {
            sorted_books.sort(compareStars);
        } else if (sortType == "author") {
            sorted_books.sort(compareAuthor);
        }

        // Call parent function when sort type changes
        updateBooks(sorted_books);
    }, [sortType]);

    const handleClick = (e) => {
        setSortType(e?.target.value);
    };

    return (
        <aside
            aria-label="Sidebar"
            className={`sticky top-64 -ml-48 h-full transition-all ${
                browsing ? "sm:ml-4" : "sm:-ml-48"
            }`}
        >
            <div className="h-64 w-48 space-x-1 space-y-1 rounded-lg border border-b-4 border-l-2 border-black px-3 py-4">
                <p className="font-bold">Sort By</p>
                <button
                    onClick={handleClick}
                    value="title"
                    className={`rounded-full px-4 py-2 hover:bg-gray-300 ${
                        sortType === "title" ? "border border-black" : null
                    }`}
                >
                    Title
                </button>
                <button
                    onClick={handleClick}
                    value="stars"
                    className={`rounded-full px-4 py-2 hover:bg-gray-300 ${
                        sortType === "stars" ? "border border-black" : null
                    }`}
                >
                    Rating
                </button>
                <button
                    onClick={handleClick}
                    value="author"
                    className={`rounded-full px-4 py-2 hover:bg-gray-300 ${
                        sortType === "author" ? "border border-black" : null
                    }`}
                >
                    Author
                </button>
            </div>
        </aside>
    );
}
