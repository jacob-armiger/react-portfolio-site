import { supabase } from "@/utils/supabase";
import { useEffect } from "react";
import { useState } from "react";
import Book from "@/components/Book";
import Sidebar from "@/components/Sidebar";

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
    let compareAuthor = (a, b) => {
        if (a.Author > b.Author) {
            return 1;
        } else {
            return -1;
        }
    };

    let handleSearchClick = () => {
        if (browsing) {
            setBrowsing(false);
        } else {
            setBrowsing(true);
        }
    };

    let updateSortType = (type) => {
        setSortType(type);

        if (type == "title") {
            books.sort(compareTitle);
        } else if (type == "stars") {
            books.sort(compareStars);
        } else if (type == "author") {
            books.sort(compareAuthor);
        }
    };

    return (
        <>
            <div className="ml-6 mt-2 hidden h-8 w-8 sm:block">
                <button
                    onClick={handleSearchClick}
                    className="rounded border border-b-4 border-black px-4 py-1 hover:border hover:bg-gray-400"
                >
                    Search
                </button>
            </div>
            <div className="flex">
                <Sidebar onSortChange={updateSortType} browsing={browsing}/>
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
