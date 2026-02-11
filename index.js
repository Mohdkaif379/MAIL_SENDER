import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import { contactEmailTemplate } from "./templates/contactEmail.js";
import { serviceInquiryEmailTemplate } from "./templates/serviceInquiryEmail.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
