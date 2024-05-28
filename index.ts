import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import guestRoutes from "./routes/guestroutes"
 

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

app.use("/api/admin",  guestRoutes)

// app.get("/test", (req:Request, res:Response)=>{
//     pool.query("SELECT *FROM guests").then((results:any)=>{
//         res.send(results.rows);
//     }).catch((error:any)=>{
//         res.send(error);
//     })
// })

app.get("/", (req:Request, res: Response)=>{
    res.send("Server is running")
})

