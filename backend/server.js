import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/Database/dbConnection.js";
import globalErrorHandler from "./src/Middlewares/errorMiddleware.js";
import ballBearingRoute from "./src/Routes/Mechanical/ballBearingRoute.js";
import usersRoute from "./src/Routes/users/usersRoute.js";
import rollRoute from "./src/Routes/Mechanical/rollRoute.js";
import contactorRoute from "./src/Routes/Electric/contactorRoute.js";
import cableRoute from "./src/Routes/Electric/cableRoute.js";
import purchaseRequestRouter from "./src/Routes/purchases/Purchaseroutes.js";
import offerRouter from "./src/Routes/purchases/offerRouter.js";
import orderRouter from "./src/Routes/purchases/orderRouter.js";
import inspectionRouter from "./src/Routes/purchases/inspectionRouter.js";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // كل يوزر بيدخل في room باسم الـ role بتاعه
  socket.on("join", (role) => {
    socket.join(role);
    console.log(`👤 ${socket.id} joined room: ${role}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ─── Middleware ──────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials: true,
}));

connectDB();

app.get("/", (req, res) => res.send("Hello World!"));

// ─── Routes ─────────────────────────────────────────────────────
app.use("/api/v1/ball-bearing",      ballBearingRoute);
app.use("/api/v1/users",             usersRoute);
app.use("/api/v1/rolls",             rollRoute);
app.use("/api/v1/contactors",        contactorRoute);
app.use("/api/v1/cables",            cableRoute);
app.use("/api/v1/purchase-requests", purchaseRequestRouter);
app.use("/api/v1/price-offers",      offerRouter);
app.use("/api/v1/purchase-orders",   orderRouter);
app.use("/api/v1/inspection",        inspectionRouter);

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});