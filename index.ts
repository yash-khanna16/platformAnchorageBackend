import bodyParser from "body-parser";
import express, { Request, Response } from "express";
const cookieParser = require('cookie-parser');
import cors from "cors";
import bcrypt from "bcrypt";
import guestRoutes from "./routes/guestroutes";
 

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Server is running on port: http://localhost:${port}`)
})
app.get("/abc",async function(req:Request,res:Response){
    const {password}=req.body;
    const hashPassword=await bcrypt.hash(password,10);
    console.log(hashPassword);
    res.send("password mil gya :)");
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

