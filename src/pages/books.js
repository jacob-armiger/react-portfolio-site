import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import { createClient } from '@supabase/supabase-js'
import { useEffect } from "react";
import { useState } from 'react';

// Create a single supabase client for interacting with your database
const supabase = createClient('https://zzbmxyucqflrvgmkblox.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Ym14eXVjcWZscnZnbWtibG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODUwMjI1NzAsImV4cCI6MjAwMDU5ODU3MH0.OtoSkAzwELAX4dzADPtJx-z8lSrFQy-Du1y9LfnAgAE')

export default function Books() {
    const [books, setBooks] = useState([])


    let fetchBooks = async () => {
        // let data = await supabase.from("book_data").select('Title');
        // console.log(data.data)
        // setBooks(data.data.map(item => <p key={item.Title}>{item.Title}</p>))
        let data = await supabase.from("book_data").select().eq('Exclusive Shelf', 'read');
        console.log(data.data)
        setBooks(data.data)
     }
 
     useEffect(() => {
        fetchBooks()
     }, [])
    return (
        <div className="my-12 flex flex-col items-left gap-5">
            {/* {books} */}
            {books?.map(book => <p key={book.Title}> {book.Title}</p>)}
        </div>
    );
}
