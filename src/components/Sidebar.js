import { useState, useEffect } from "react";
import { compareAuthor, compareTitle, compareStars } from "@/utils/helper";

export default function Sidebar({ updateBooks, updateFilters, browsing, books, filters }) {
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

    const handleSortClick = (e) => {
        setSortType(e?.target.value);
    };

    const handleFilterClick = (e) => {
        let box = e.target.value;

        if (box == "read") {
            // Logic to keep at least one box checked
            if ((filters[0] && filters[1]) || filters[1]) {
                filters = [!filters[0], filters[1]];
            }
        } else {
            if ((filters[0] && filters[1]) || filters[0]) {
                filters = [filters[0], !filters[1]];
            }
        }
        updateFilters(filters);
    };

    return (
        <aside
            aria-label="Sidebar"
            className={`sticky top-64 -ml-48 h-full transition-all ${
                browsing ? "sm:ml-4" : "sm:-ml-48"
            }`}
        >
            <div className="h-64 w-48  rounded-lg border border-b-4 border-l-2 border-black px-3 py-4">
                <div className="space-x-1 space-y-1">
                    <p className="font-bold">Sort By</p>
                    <button
                        onClick={handleSortClick}
                        value="title"
                        className={`rounded-md px-4 py-2 hover:bg-gray-400 ${
                            sortType === "title" ? "border border-black" : null
                        }`}
                    >
                        Title
                    </button>
                    <button
                        onClick={handleSortClick}
                        value="stars"
                        className={`rounded-md px-4 py-2 hover:bg-gray-400 ${
                            sortType === "stars" ? "border border-black" : null
                        }`}
                    >
                        Rating
                    </button>
                    <button
                        onClick={handleSortClick}
                        value="author"
                        className={`rounded-md px-4 py-2 hover:bg-gray-400 ${
                            sortType === "author" ? "border border-black" : null
                        }`}
                    >
                        Author
                    </button>
                </div>
                <p className="font-bold">Filter By</p>
                <div className="flex flex-col">
                    <div className="flex flex-row items-center space-x-1">
                        <input
                            type="checkbox"
                            value="read"
                            checked={filters[0]}
                            onChange={handleFilterClick}
                        />
                        <label className="">Read</label>
                    </div>

                    <div className="flex flex-row items-center space-x-1">
                        <input
                            type="checkbox"
                            value="want-to-read"
                            checked={filters[1]}
                            onChange={handleFilterClick}
                        />
                        <label>Want to Read</label>
                    </div>
                </div>
            </div>
        </aside>
    );
}
