export default function Book({ book, sorted = false }) {
    if (sorted) {
        return (
            <div className="mb-6 max-h-44 max-w-lg break-inside-avoid overflow-auto rounded-lg border border-black p-2 sm:p-5 sm:pt-3">
                {/* dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 */}
                <h5 className="mb-1 text-xl font-bold tracking-tight text-gray-900 ">
                    {/* dark:text-white */}
                    {book.Title}
                </h5>
                <p className="font-normal text-gray-500 ">
                    {/*  dark:text-gray-400*/}
                    {book.Author}
                </p>
                <div className="flex">
                    <svg
                        className="me-1 h-4 w-4 text-yellow-300"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 22 20"
                    >
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <p>{book["My Rating"]}/5</p>
                </div>
                <p>{book["My Review"]}</p>
            </div>
        );
    } else {
        return (
            <div className="mb-6 max-w-lg break-inside-avoid rounded-lg border border-black p-2 sm:p-5 sm:pt-3">
                {/* dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 */}
                <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 ">
                    {/* dark:text-white */}
                    {book.Title}
                </h5>
                <p className="font-normal text-gray-500 ">
                    {/*  dark:text-gray-400*/}
                    {book.Author}
                </p>
                <div className="flex">
                    <svg
                        className="me-1 h-4 w-4 text-yellow-300"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 22 20"
                    >
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <p>{book["My Rating"]}/5</p>
                </div>
                <p>{book["My Review"]}</p>
            </div>
        );
    }
}
