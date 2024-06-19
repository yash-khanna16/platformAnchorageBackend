import bodyParser from "body-parser";
import express, { Request, Response } from "express";
const cookieParser = require('cookie-parser');
import cors from "cors";
import bcrypt, { hash } from "bcrypt";
import guestRoutes from "./routes/guestroutes";
import { loginAdmin } from "./controllers/guestcontroller";
import { verifyAdmin } from "./middlewares/middleware";
import analyticsrouters from "./routes/analyticroutes"
import cron from 'node-cron';
import pool from "./db";

 

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Server is running on port: http://localhost:${port}`)
})
// app.get("/abc",async function(req:Request,res:Response){
//     const {password}=req.body;
//     const hashPassword=await bcrypt.hash(password,10);
//     console.log(hashPassword);
//     res.send("password mil gya :)");
// })

app.post("/createlogin", async (req: Request, res: Response)=> {
  const data = req.body; // Assuming req.body is an array of objects
  const insertions = [];
  
  for (const item of data) {
      const email = item.email;
      const password = item.password;
      const role = item.role;

      const pwd = await hash(password, 10);

      try {
          const result = await pool.query("INSERT INTO admin (email,password,role) values ($1, $2, $3)", [email, pwd, role]);
          insertions.push({ email, message: `Admin added for email: ${email} and role: ${role} ` });
      } catch (error) {
          insertions.push({ email, message: "Internal Server Error!" });
      }
  }

  res.send(insertions);
})
app.get("/loginAdmin",loginAdmin);

app.use("/api/admin",  guestRoutes)
app.use("/api/analytics", analyticsrouters)

// app.get("/test", (req:Request, res:Response)=>{
//     pool.query("SELECT *FROM guests").then((results:any)=>{
//         res.send(results.rows);
//     }).catch((error:any)=>{
//         res.send(error);
//     })
// })

async function moveExpiredBookings() {
    try {
      const query = `
        WITH moved_rows AS (
          DELETE FROM bookings
          WHERE checkout < NOW()
          RETURNING *
        )
        INSERT INTO logs (booking_id, checkin, checkout, guest_email, meal_veg, meal_non_veg, remarks, additional_info, room, breakfast)
        SELECT booking_id, checkin, checkout, guest_email, meal_veg, meal_non_veg, remarks, additional_info, room, breakfast
        FROM moved_rows;
      `;
  
      await pool.query(query);
      console.log('Expired bookings moved to logs table');
    } catch (err) {
      console.error('Error moving expired bookings:', err);
    }
  }
  
  // Schedule the job to run at 12:00 AM every day
  cron.schedule('0 0 * * *', () => {
    console.log('Moving expired booking to logs...');
    moveExpiredBookings();
  });
  
app.get("/", (req:Request, res: Response)=>{
    res.send("Server is running")
})

