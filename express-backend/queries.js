import pg from "pg";

// const { Pool } = pg;
// const { Client } = pg;



// const client = new pg.Client({cn})
// await client.connect()

// await client.connect()
// const getUsers = (request, response) => {
//     pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
//       if (error) {
//         throw error;
//       }
//       response.status(200).json(results.rows);
//     });
//   };
const getUsers = (request, response) => {
    console.log("CALLING /TEST")
    console.log(process.env.DATABASE_URL)
    // let cn = "postgres://postgres:JGT7vwH0CYu50D0@this-is-a-test-db.internal:5432/template1"
    // process.env.DATABASE_URL
    // let cn = process.env.DATABASE_URL
    const pool = new pg.Pool({
      connectionString : process.env.DATABASE_URL
    });

    pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
        if (error) {
          console.log(error);
        }
        console.log("SUCCESS?")
        response.status(200).json(results);
    });
};


export { getUsers };
