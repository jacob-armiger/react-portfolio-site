import Papa from "papaparse";
import fs from "fs";

let file = fs.createReadStream('book.csv')
// console.log(file)

Papa.parse(file, {
    header:true,
    complete: results => {
        fs.writeFileSync("../src/content/books.json", JSON.stringify(results.data, null, 4))
    },
})