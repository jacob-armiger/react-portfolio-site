import { supabase } from "@/utils/supabase";
import { useEffect } from "react";
import { useState } from 'react';
import Book from "@/components/Book";

export default function Books() {
    const [books, setBooks] = useState([]);

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

    return (
        <div className="mx-6 my-12 columns-2 md:columns-3 lg:columns-4">
            {books?.map((book) => (
                <Book key={book.Title} book={book} />
            ))}
        </div>
    );
}
