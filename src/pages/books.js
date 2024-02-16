import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import { createClient } from '@supabase/supabase-js'
import { useEffect } from "react";
import { useState } from 'react';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export default function Books() {
    const [books, setBooks] = useState([])


    let fetchBooks = async () => {
        let data = await supabase.from("book_data").select().eq('Exclusive Shelf', 'read');
        console.log(data.data)
        setBooks(data.data)
     }
 
     useEffect(() => {
        fetchBooks()
     }, [books])

    return (
        <div className="my-12 flex flex-col items-left gap-5">
            {books?.map(book => <p key={book.Title}> {book.Title}</p>)}
        </div>
    );
}
