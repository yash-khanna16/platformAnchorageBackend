import bodyParser from "body-parser";
import express, { Request, Response } from "express";
const cookieParser = require("cookie-parser");
import cors from "cors";
import bcrypt, { hash } from "bcrypt";
import guestRoutes from "./routes/guestroutes";
import { loginAdmin } from "./controllers/guestcontroller";
import { verifyAdmin } from "./middlewares/middleware";
import analyticsroutes from "./routes/analyticroutes";
import movementroutes from "./routes/movementroutes";
import cron from "node-cron";
import pool from "./db";

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}`);
});
// app.get("/abc",async function(req:Request,res:Response){
//     const {password}=req.body;
//     const hashPassword=await bcrypt.hash(password,10);
//     console.log(hashPassword);
//     res.send("password mil gya :)");
// })

app.post("/createlogin", async (req: Request, res: Response) => {
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
});
app.get("/loginAdmin", loginAdmin);

app.use("/api/admin", verifyAdmin, guestRoutes);
app.use("/api/analytics", verifyAdmin, analyticsroutes);
app.use("/api/movement", verifyAdmin, movementroutes);


// app.get("/test", (req:Request, res:Response)=>{
//     pool.query("SELECT *FROM guests").then((results:any)=>{
//         res.send(results.rows);
//     }).catch((error:any)=>{
//         res.send(error);
//     })
// })

async function moveExpiredBookings() {
  try {
    let query = `
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
    console.log("Expired bookings moved to logs table");

    query = `
      WITH valid_movements AS (
          SELECT m.movement_id
          FROM movement m
          LEFT JOIN passengers p ON m.movement_id = p.movement_id
          GROUP BY m.movement_id
          HAVING COUNT(CASE WHEN p.booking_id IS NULL THEN 1 END) = 0
        ),
        moved_movements AS (
          DELETE FROM movement
          WHERE "return_time" < NOW()
          AND movement_id IN (SELECT movement_id FROM valid_movements)
          RETURNING *
        ),
        moved_passengers AS (
          DELETE FROM passengers
          WHERE movement_id IN (SELECT movement_id FROM moved_movements)
          RETURNING *
        ),
        insert_movements AS (
          INSERT INTO movement_logs (movement_id, pickup_location, pickup_time, return_time, car_number, driver, drop_location)
          SELECT movement_id, pickup_location, pickup_time, return_time, car_number, driver, drop_location
          FROM moved_movements
          RETURNING *
        )
        INSERT INTO passengers_logs (booking_id, movement_id, passenger_id, remark)
        SELECT booking_id, movement_id, passenger_id, remark
        FROM moved_passengers;
    `;

    const movedPassengersResult = await pool.query(query);
    console.log(`Moved ${movedPassengersResult.rowCount} passengers to passengers_logs table`);
  } catch (err) {
    console.error("Error moving expired bookings:", err);
  }
}

async function moveExpiredData() {
  try {
    const query = `
      WITH moved_movements AS (
        DELETE FROM movement
        WHERE "return_time" < NOW()
        RETURNING *
      ),
      moved_passengers AS (
        DELETE FROM passengers
        WHERE movement_id IN (SELECT movement_id FROM moved_movements)
        RETURNING *
      ),
      moved_external_passengers AS (
        DELETE FROM external_passenger
        WHERE movement_id IN (SELECT movement_id FROM moved_movements)
        RETURNING *
      ),
      insert_movements AS (
        INSERT INTO movement_logs (movement_id, pickup_location, pickup_time, return_time, car_number, driver, drop_location)
        SELECT movement_id, pickup_location, pickup_time, return_time, car_number, driver, drop_location
        FROM moved_movements
        RETURNING *
      ),
      insert_passengers AS (
        INSERT INTO passengers_logs (booking_id, movement_id, passenger_id, remark)
        SELECT booking_id, movement_id, passenger_id, remark
        FROM moved_passengers
        RETURNING *
      )
      INSERT INTO external_passenger_logs (company, phone, name, passenger_id, movement_id)
      SELECT company, phone, name, passenger_id, movement_id
      FROM moved_external_passengers;
    `;

    const result = await pool.query(query);
    console.log("Expired data moved to log tables");
  } catch (err) {
    console.error("Error moving expired data:", err);
  }
}
const moveExpiredAuditLogs = async () => {
  try {
    const query = `
      DELETE FROM audit_logs 
      WHERE time < NOW() - INTERVAL '15 days'
    `;
    const result = await pool.query(query);
    console.log(`Deleted ${result.rowCount} old audit log(s)`);
  } catch (error) {
    console.error('Error deleting old audit logs:', error);
  }
};




// Schedule the job to run at 12:00 AM every day
cron.schedule("0 0 * * *", () => {
  console.log("Moving expired booking and movements to logs...");
  moveExpiredBookings();
});

// Schedule the job to run at 12:00 AM every 2 months
cron.schedule("0 0 * */2 *", () => {
  console.log('Moving all movements to logs...');
  moveExpiredData(); 
});

// Schedule the job to run at 12:00 AM every 2 months
cron.schedule("0 0 * * *", () => {
  console.log("Deleting logs..");
  moveExpiredAuditLogs();
});
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});
