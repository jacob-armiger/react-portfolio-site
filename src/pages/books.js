import { useState } from "react";
import Book from "@/components/Book";
import Sidebar from "@/components/Sidebar";

export default function Books() {
    const [books, setBooks] = useState([]);
    const [browsing, setBrowsing] = useState(false);

    let updateBooks = (book_list) => {
        setBooks(book_list);
    };

    let handleSearchClick = () => {
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
                    onClick={handleSearchClick}
                    className={`h-10 w-16 rounded border border-black hover:border hover:bg-gray-400 ${
                        browsing ? "border" : "border-b-4"
                    }`}
                >
                    Search
                </button>
            </div>
            <div className="flex">
                <Sidebar
                    updateBooks={updateBooks}
                    browsing={browsing}
                    books={books}
                />
                <div
                    className={`${
                        !browsing
                            ? "mx-2 mb-8 mt-10 columns-2 gap-2 sm:mx-6 sm:mt-4 sm:gap-6 md:columns-3 lg:columns-4"
                            : "mx-4 mb-8 mt-10 grid grid-cols-2 gap-4 sm:mt-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
                    }`}
                >
                    {books?.map((book) => (
                        <Book
                            key={book.Title}
                            book={book}
                            browsing={browsing}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
