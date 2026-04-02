//express app setup
import express from "express";

const app = express();

app.use(express.json());


app.get("/", (req,res) => {
    res.status(200).json("Api is running");
});

export default app;