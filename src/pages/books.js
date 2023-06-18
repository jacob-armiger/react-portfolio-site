import { useEffect, useState } from "react";
export default function Projects() {

    let [books, setBooks] = useState([]);

    let fetchBooks = async () => {
       let response = await fetch('/api/books/');
       let data = await response.json()
    //    console.log(data)
       setBooks(data)
    }

    useEffect(() => {
        fetchBooks()
    }, [])

    return (
        <div className="my-12 flex flex-col items-center gap-5">
            {books.map((book) => (
                <p>{book.Title}</p>
            ))}
        </div>
    );
}
