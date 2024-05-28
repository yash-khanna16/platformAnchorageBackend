import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

app.get("/", (req:Request, res: Response)=>{
    res.send("Server is running")
})

