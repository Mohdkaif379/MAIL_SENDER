import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import mysql from "mysql2";
import { contactEmailTemplate } from "./templates/contactEmail.js";
import { serviceInquiryEmailTemplate } from "./templates/serviceInquiryEmail.js";

dotenv.config();
const db = mysql.createConnection(process.env.DATABASE_URL);
const app = express();

app.set("trust proxy", true);

const ensureVisitorsTable = () => {
  const createVisitorsTableSql = `
    CREATE TABLE IF NOT EXISTS visitors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip_address VARCHAR(45) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createVisitorsTableSql, err => {
    if (err) {
      console.log("Visitors table create error:", err);
      return;
    }
    console.log("Visitors table ready");
  });
};

db.connect(err => {
  if (err) {
    console.log("MySQL Error:", err);
  } else {
    console.log("MySQL Connected");
    ensureVisitorsTable();
  }
});

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

const createTransporter = () => {
  const connectionTimeout = Number(process.env.EMAIL_CONNECTION_TIMEOUT || 60000);
  const greetingTimeout = Number(process.env.EMAIL_GREETING_TIMEOUT || 60000);
  const socketTimeout = Number(process.env.EMAIL_SOCKET_TIMEOUT || 60000);

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
  });
};

// Contact form route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please provide name, email, and message." });
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      html: contactEmailTemplate(name, email, message),
    });

    res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// Service inquiry form route
app.post("/service-inquiry", async (req, res) => {
  const { name, email, phone, message } = req.body;
  const serviceName = req.body.serviceName || req.body.service;

  if (!name || !email || !phone || !serviceName || !message) {
    return res.status(400).json({
      error: "Please provide name, email, phone, serviceName, and message.",
    });
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Service Inquiry from ${name}`,
      html: serviceInquiryEmailTemplate(name, email, phone, serviceName, message),
    });

    res.status(200).json({ message: "Service inquiry has been sent successfully!" });
  } catch (error) {
    console.error("Service inquiry email error:", error);
    res.status(500).json({ error: "Failed to send service inquiry." });
  }
});

// Simple GET route
app.get("/", (req, res) => {
  res.status(200).json({ message: "MOHD KAIF BACKEND DEVELOPER!" });
});

app.get("/api/visit", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.log(`[VISIT] /api/visit hit | ip=${ip} | time=${new Date().toISOString()}`);

  db.query("SELECT * FROM visitors WHERE ip_address = ?", [ip], (err, result) => {
    if (err) return res.json({ error: err });

    if (result.length === 0) {
      db.query("INSERT INTO visitors (ip_address) VALUES (?)", [ip]);
    }

    db.query("SELECT COUNT(*) AS total", (err, count) => {
      if (err) return res.json({ error: err });
      res.json({ visits: count[0].total });
    });
  });
});

const startAutoVisitRunner = port => {
  const baseUrl = process.env.AUTO_VISIT_BASE_URL || `http://127.0.0.1:${port}`;

  setInterval(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/visit`);
      const payload = await response.json();
      console.log(`[AUTO] /api/visit called | status=${response.status} | visits=${payload.visits ?? "n/a"}`);
    } catch (error) {
      console.log("Auto /api/visit error:", error.message);
    }
  }, 5000);
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
  console.log(`Auto visit base URL: ${process.env.AUTO_VISIT_BASE_URL || `http://127.0.0.1:${PORT}`}`);
  console.log("Auto /api/visit runner started (every 5 seconds)");
  startAutoVisitRunner(PORT);
});
