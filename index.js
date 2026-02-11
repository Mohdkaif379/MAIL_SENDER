import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import mysql from "mysql2";
import { randomUUID } from "node:crypto";
import { contactEmailTemplate } from "./templates/contactEmail.js";
import { serviceInquiryEmailTemplate } from "./templates/serviceInquiryEmail.js";

dotenv.config();
const db = mysql.createConnection(process.env.DATABASE_URL);
const app = express();
const TRACKED_URL = process.env.TRACKED_URL || "https://webbuyer.netlify.app/";
const VISIT_TIMEZONE = process.env.VISIT_TIMEZONE || "Asia/Kolkata";

app.set("trust proxy", true);

const ensureVisitorsTable = () => {
  const createVisitorKeysSql = `
    CREATE TABLE IF NOT EXISTS visitor_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      visitor_key VARCHAR(255) NOT NULL UNIQUE,
      ip_address VARCHAR(45),
      user_agent VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createDailyPageVisitsSql = `
    CREATE TABLE IF NOT EXISTS daily_page_visits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_url VARCHAR(1024) NOT NULL,
      visitor_key VARCHAR(255) NOT NULL,
      visit_day DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_daily_page_visitor (page_url(255), visitor_key, visit_day)
    )
  `;

  db.query(createVisitorKeysSql, err => {
    if (err) {
      console.log("Visitor keys table create error:", err);
      return;
    }
    db.query(createDailyPageVisitsSql, innerErr => {
      if (innerErr) {
        console.log("Daily page visits table create error:", innerErr);
        return;
      }
      console.log("Visitor tracking tables ready");
    });
  });
};

const getIpAddress = req => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
};

const getCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [cookieName, ...rest] = part.trim().split("=");
    if (cookieName === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
};

const normalizeUrl = value => {
  try {
    const raw = String(value).trim();
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    parsed.hash = "";
    parsed.search = "";
    return `${parsed.protocol}//${hostname}${pathname}`;
  } catch {
    return null;
  }
};

const normalizeSiteKey = value => {
  try {
    const raw = String(value).trim();
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    return `${parsed.protocol}//${hostname}`;
  } catch {
    return null;
  }
};

const getVisitDay = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: VISIT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

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
  const ip = getIpAddress(req);
  const userAgent = (req.headers["user-agent"] || "unknown").slice(0, 255);
  const existingVisitorId = getCookieValue(req.headers.cookie, "vid");
  const visitorIdFromQuery = typeof req.query.visitorId === "string" ? req.query.visitorId.trim() : "";
  const acceptedLanguage = (req.headers["accept-language"] || "").slice(0, 100);
  const incomingUrl = req.query.url || req.headers.referer || req.headers.origin || "";
  const rawUrl = incomingUrl || TRACKED_URL;
  const trackedUrl = normalizeUrl(TRACKED_URL);
  const pageUrl = normalizeUrl(rawUrl);
  const trackedSiteKey = normalizeSiteKey(TRACKED_URL);
  const requestSiteKey = normalizeSiteKey(rawUrl);
  const visitDay = getVisitDay();
  let visitorKey = "";

  if (!trackedSiteKey || !requestSiteKey || requestSiteKey !== trackedSiteKey) {
    return res.status(200).json({
      tracked: false,
      message: "URL is not tracked",
      trackedUrl: TRACKED_URL,
      receivedUrl: incomingUrl || null,
    });
  }

  if (visitorIdFromQuery) {
    visitorKey = `vid:${visitorIdFromQuery.slice(0, 100)}`;
  } else if (existingVisitorId) {
    visitorKey = `vid:${existingVisitorId.slice(0, 100)}`;
  } else {
    visitorKey = `fp:${ip}|${userAgent}|${acceptedLanguage}`;
    const newVisitorId = randomUUID();
    res.setHeader("Set-Cookie", `vid=${newVisitorId}; Path=/; Max-Age=31536000; SameSite=None; Secure`);
  }

  const trackedPage = pageUrl || trackedUrl;
  console.log(`[VISIT] /api/visit hit | ip=${ip} | url=${trackedPage} | day=${visitDay} | time=${new Date().toISOString()}`);

  db.query(
    "INSERT IGNORE INTO visitor_keys (visitor_key, ip_address, user_agent) VALUES (?, ?, ?)",
    [visitorKey, ip, userAgent],
    err => {
      if (err) return res.json({ error: err });

      db.query(
        "INSERT IGNORE INTO daily_page_visits (page_url, visitor_key, visit_day) VALUES (?, ?, ?)",
        [trackedPage, visitorKey, visitDay],
        insertErr => {
          if (insertErr) return res.json({ error: insertErr });

          db.query(
            "SELECT COUNT(*) AS total FROM daily_page_visits WHERE page_url = ? AND visit_day = ?",
            [trackedPage, visitDay],
            (countErr, count) => {
              if (countErr) return res.json({ error: countErr });
              res.json({
                tracked: true,
                url: trackedPage,
                day: visitDay,
                visits: count[0].total,
              });
            }
          );
        }
      );
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
