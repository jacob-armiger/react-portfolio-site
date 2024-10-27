import Papa from "papaparse";
import fs from "fs";

let file = fs.createReadStream('books.csv')
// console.log(file)

Papa.parse(file, {
    header:true,
    complete: (results) => {
        let books = results.data;
        
        for(const book of results.data) {
            book["My Review"] = book["My Review"].replaceAll("<br/><br/>", "\n\n")
        }

        fs.writeFileSync("../src/bookData/books.json", JSON.stringify(books, null, 4))
    },
})