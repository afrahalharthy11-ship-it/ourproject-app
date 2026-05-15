require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const doctorRoutes = require("./routes/doctor");
const patientRoutes = require("./routes/patient");
const managerRoutes = require("./routes/manager");

const app = express();

// connect database
connectDB();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// ✅ session بدون MongoStore (مؤقت عشان يشتغل)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/manager", managerRoutes);

// error handler

app(err.stack);app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
