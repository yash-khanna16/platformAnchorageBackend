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
import cosAdminRoutes from "./routes/cosAdminRoutes";
import cosroutes from "./routes/cosroutes";
import cron from "node-cron";
import pool from "./db";
import http from "http";
import dotenv from "dotenv";
import { initializeSocket } from "./socket";
import AWS from "aws-sdk";
import dayjs from "dayjs";
import nodemailer from "nodemailer";

dotenv.config();
const { ROOM_CODE } = process.env;

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);

initializeSocket(server); // Initialize Socket.IO with the server

server.listen(port, () => {
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

app.use("/api/admin/cos", cosAdminRoutes);
app.use("/api/admin", verifyAdmin, guestRoutes);
app.use("/api/analytics", verifyAdmin, analyticsroutes);
app.use("/api/movement", verifyAdmin, movementroutes);
app.use("/api/cos", cosroutes);

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
        INSERT INTO logs (booking_id, checkin, checkout, guest_email, meal_veg, meal_non_veg, remarks, additional_info, room, breakfast,document_url,document_url_back)
        SELECT booking_id, checkin, checkout, guest_email, meal_veg, meal_non_veg, remarks, additional_info, room, breakfast,document_url,document_url_back
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
    console.error("Error deleting old audit logs:", error);
  }
};

const s3 = new AWS.S3({
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const transporter = nodemailer.createTransport({
  // service: "gmail", // You can use any email service
  host: "smtp.mailgun.org",
  port: 587,
  auth: {
    user: process.env.NODE_MAIL_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

async function deleteExpiredBookingDocuments() {
  try {
    // Connect to the PostgreSQL database
    await pool.connect();

    // Calculate the date 15 days ago from today
    const fifteenDaysAgo = dayjs().subtract(15, "day").toDate();
    console.log("fifteenDaysAgo: ", fifteenDaysAgo);

    // SQL query to get expired bookings older than 15 days
    console.log("Deleting expired documents...");
    const res = await pool.query(
      `
          SELECT booking_id, document_url_back
          FROM public.bookings
          WHERE checkout < $1 AND document_url_back IS NOT NULL
          UNION
          SELECT booking_id, document_url_back
          FROM public.logs
          WHERE checkout < $1 AND document_url_back IS NOT NULL;
      `,
      [fifteenDaysAgo]
    );

    console.log("res: ", res.rows);

    let count = 0;
    for (const row of res.rows) {
      const { booking_id, document_url_back } = row;
      count++;

      if (document_url_back) {
        // Construct the S3 key from booking_id and document_url
        const s3Key = document_url_back.replace('https://platformanchoragectp.s3.amazonaws.com/', '');

        try {
          if (BUCKET_NAME) {
            console.log("S3 key: ", s3Key)
            await deleteS3Object(BUCKET_NAME, s3Key);
            console.log(`Successfully deleted document: ${s3Key} for booking ID: ${booking_id}`);
          }
        } catch (s3Error) {
          console.error(`Failed to delete document for booking ID: ${booking_id} -`, s3Error);
        }
      } else {
        console.log(`No document found for booking ID: ${booking_id}`);
      }
    }
    console.log(`Successfully deleted ${count} documents`);

    // SQL query to get expired bookings older than 15 days
    console.log("Deleting expired documents...");
    const res2 = await pool.query(
      `
          SELECT booking_id, document_url
          FROM public.bookings
          WHERE checkout < $1 AND document_url IS NOT NULL
          UNION
          SELECT booking_id, document_url
          FROM public.logs
          WHERE checkout < $1 AND document_url IS NOT NULL;
      `,
      [fifteenDaysAgo]
    );

    console.log("res: ", res2.rows);

    count = 0;
    for (const row of res2.rows) {
      const { booking_id, document_url } = row;
      count++;

      if (document_url) {
        // Construct the S3 key from booking_id and document_url
        const s3Key = document_url.replace('https://platformanchoragectp.s3.amazonaws.com/', '');

        try {
          if (BUCKET_NAME) {
            console.log("S3 key: ", s3Key)
            await deleteS3Object(BUCKET_NAME, s3Key);
            console.log(`Successfully deleted document: ${s3Key} for booking ID: ${booking_id}`);
          }
        } catch (s3Error) {
          console.error(`Failed to delete document for booking ID: ${booking_id} -`, s3Error);
        }
      } else {
        console.log(`No document found for booking ID: ${booking_id}`);
      }
    }
    console.log(`Successfully deleted ${count} documents`);
  } catch (dbError) {
    console.error("Database query failed:", dbError);
    try {
      const mailOptions = {
        from: process.env.NODE_MAIL_FROM_EMAIL,
        to: 'deepanshupal2003@gmail.com',
        subject: 'ERROR',
        text: 'Error deleting expired booking documents: ' + dbError,
      };
      console.log(
        `Sending Error Email`,
      );
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent!", "response: ", info.response);
        }
      });
    } catch(error) {
      console.log("Error sending email:", error);
    }
  }

}

try {
  cron.schedule("0 12 * * *", deleteExpiredBookingDocuments);
} catch (err) {
  console.error("Error scheduling cron job:", err);
  try {
    const mailOptions = {
      from: process.env.NODE_MAIL_FROM_EMAIL,
      to: 'deepanshupal2003@gmail.com',
      subject: 'ERROR',
      text: 'Error deleting expired booking documents: ' + err,
    };
    console.log(
      `Sending Error Email`,
    );
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent!", "response: ", info.response);
      }
    });
  } catch(error) {
    console.log("Error sending email:", error);
  }
}

function deleteS3Object(bucket: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    s3.deleteObject({ Bucket: bucket, Key: key }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Schedule the job to run at 12:00 AM every day
cron.schedule("0 0 * * *", () => {
  console.log("Moving expired booking and movements to logs...");
  moveExpiredBookings();
});

// Schedule the job to run at 12:00 AM every 5 days
cron.schedule("0 0 */5 * *", () => {
  console.log("Moving all movements to logs...");
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
