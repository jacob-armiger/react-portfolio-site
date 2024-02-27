import { supabase } from "@/utils/supabase";
import { useEffect } from "react";
import { useState } from "react";
import Book from "@/components/Book";
import Sidebar from "@/components/Sidebar";

export default function Books() {
    const [books, setBooks] = useState([]);
    const [browsing, setBrowsing] = useState(false);
    const [filters, setFilters] = useState([true, false]);

    useEffect(() => {
        fetchBooks(filters);
    }, [filters]);

    let fetchBooks = async (filters) => {
        let data;
        if (filters[0] && !filters[1]) {
            console.log("TEST");
            data = await supabase
                .from("book_data2")
                .select()
                .eq("Exclusive Shelf", "read");
        } else if (filters[0] && filters[1]) {
            data = await supabase.from("book_data2").select();
        } else if (!filters[0] && filters[1]) {
            data = await supabase
                .from("book_data2")
                .select()
                .eq("Exclusive Shelf", "to-read");
        }
        setBooks(data?.data);
    };

    let updateBooks = (book_list) => {
        setBooks(book_list);
    };

    let updateFilters = (filters) => {
        setFilters(filters);
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
                    className="rounded border border-b-4 border-black px-4 py-1 hover:border hover:bg-gray-400"
                >
                    Search
                </button>
            </div>
            <div className="flex">
                <Sidebar
                    updateBooks={updateBooks}
                    updateFilters={updateFilters}
                    browsing={browsing}
                    books={books}
                    filters={filters}
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
