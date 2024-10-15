import express from "express";
import cors from "cors";
import * as db from "./queries.js";

const app = express();
const port = 15432;

app.use(
    cors(
    //     {
    //   allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
    //   exposedHeaders: ["authorization"], // you can change the headers
    //   origin: "*",
    //   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    //   preflightContinue: false}
      ));

app.get("/", (req, res) => {
  res.send("Database is on.");
});

app.listen(port, '::',() => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/test", db.getUsers);
