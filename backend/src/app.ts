//express app setup
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js"; 

const app = express();

app.use(express.json());


app.get("/", (req,res) => {
    res.status(200).json("Api is running");
});

app.use("/api/auth", authRoutes);

export default app;