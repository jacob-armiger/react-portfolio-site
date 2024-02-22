import { supabase } from "@/utils/supabase";
import { useEffect } from "react";
import { useState } from "react";
import Book from "@/components/Book";

export default function Books() {
    const [books, setBooks] = useState([]);
    const [sorted, setSorted] = useState(false);
    const [sortType, setSortType] = useState("none");

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
            setSortType("none");
            setSorted(false);
            return;
        }

        if (selection == "title") {
            books.sort(compareTitle);
            setSortType("title");
        } else if (selection == "stars") {
            books.sort(compareStars);
            setSortType("stars");
        }
        setSorted(true);
    };

    return (
        <div className="mx-auto mt-16 flex flex-row sm:mx-16 2xl:mx-48">
            <aside
                className="fixed top-64 h-3/5 w-64 -translate-x-full transition-transform sm:left-2 sm:translate-x-8 2xl:translate-x-40"
                aria-label="Sidebar"
            >
                <div className="h-full space-x-1 overflow-y-auto rounded-lg border border-black px-3 py-4">
                    <p className="font-bold">Sort By</p>
                    <button
                        onClick={handleClick}
                        className={`rounded-full px-4 py-2 hover:bg-gray-300 ${
                            sortType === "title" ? "bg-gray-400" : null
                        }`}
                        value="title"
                    >
                        Title
                    </button>
                    <button
                        onClick={handleClick}
                        className={`rounded-full px-4 py-2 hover:bg-gray-300 ${
                            sortType === "stars" ? "bg-gray-400" : null
                        }`}
                        value="stars"
                    >
                        Stars
                    </button>
                </div>
            </aside>

            <div className="mt-8 w-full sm:ml-64 sm:w-3/4">
                {!sorted ? (
                    <div className="mx-2 mb-12 columns-2 gap-2 sm:mx-6 sm:columns-1 sm:gap-6 md:columns-2 lg:columns-3">
                        {books?.map((book) => (
                            <Book
                                key={book.Title}
                                book={book}
                                sorted={sorted}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mx-4 mb-12 grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                        {books?.map((book) => (
                            <Book
                                key={book.Title}
                                book={book}
                                sorted={sorted}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
