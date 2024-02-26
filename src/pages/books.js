import { supabase } from "@/utils/supabase";
import { useEffect } from "react";
import { useState } from "react";
import Book from "@/components/Book";

export default function Books() {
    const [books, setBooks] = useState([]);
    const [browsing, setBrowsing] = useState(false);
    const [sortType, setSortType] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    let fetchBooks = async () => {
        let data = await supabase
            .from("book_data2")
            .select()
            .eq("Exclusive Shelf", "read");
        console.log(data.data);
        setBooks(data.data);
    };

    let compareTitle = (a, b) => {
        if (a?.Title > b?.Title) {
            return 1;
        } else {
            return -1;
        }
    };
    let compareStars = (a, b) => {
        if (a["My Rating"] > b["My Rating"]) {
            return -1;
        } else {
            return 1;
        }
    };

    let handleClick = async (e) => {
        let selection = e?.target.value;

        if (sortType == selection) {
            setSortType(null);
            return;
        }

        if (selection == "title") {
            books.sort(compareTitle);
            setSortType("title");
        } else if (selection == "stars") {
            books.sort(compareStars);
            setSortType("stars");
        }
    };

    let handleSortClick = () => {
        if (browsing) {
            setBrowsing(false);
        } else {
            setBrowsing(true);
        }
    };

    return (
        <>
            <div className="ml-6 mt-2 hidden h-8 w-8 sm:block">
                <button
                    onClick={handleSortClick}
                    className="rounded border border-b-4 border-black px-4 py-1 hover:border hover:bg-gray-400"
                >
                    Search
                </button>
            </div>
            <div className="flex">
                <aside
                    aria-label="Sidebar"
                    className={`sticky top-64 -ml-48 h-full transition-all ${
                        browsing ? "sm:ml-4" : "sm:-ml-48"
                    }`}
                >
                    <div className="h-64 w-48 rounded-lg border border-b-4 border-l-2 border-black px-3 py-4">
                        <p className="font-bold">Sort By</p>
                        <button
                            onClick={handleClick}
                            value="title"
                            className={`rounded-full px-4 py-2 hover:bg-gray-300 ${
                                sortType === "title"
                                    ? "border border-black"
                                    : null
                            }`}
                        >
                            Title
                        </button>
                        <button
                            onClick={handleClick}
                            value="stars"
                            className={`rounded-full px-4 py-2 hover:bg-gray-300 ${
                                sortType === "stars"
                                    ? "border border-black"
                                    : null
                            }`}
                        >
                            Stars
                        </button>
                    </div>
                </aside>
                <div
                    className={`${
                        !browsing
                            ? "mx-2 mb-8 mt-10 columns-2 gap-2 sm:mx-6 sm:mt-4 sm:gap-6 md:columns-3 lg:columns-4"
                            : "mx-4 mt-10 sm:mt-4 mb-8 grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
                    }`}
                >
                    {books?.map((book) => (
                        <Book key={book.Title} book={book} browsing={browsing} />
                    ))}
                </div>
            </div>
        </>
    );
}
