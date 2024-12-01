import Papa from "papaparse";
import fs from "fs";

let file = fs.createReadStream('books.csv')
// console.log(file)

Papa.parse(file, {
    header:true,
    complete: (results) => {
        results.data = results.data.filter((book) => {
            return book["Exclusive Shelf"] != "to-read"
        })

        for(const book of results.data) {
            book["My Review"] = book["My Review"].replaceAll("<br/><br/>", "\n\n")
        }

        fs.writeFileSync("../src/assets/books.json", JSON.stringify(results.data, null, 4))
    },
})

file.on('end', () => {
    file.close();
});