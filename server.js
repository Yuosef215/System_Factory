import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import connectDB from "./src/Database/dbConnection.js";
import globalErrorHandler from "./src/Middlewares/errorMiddleware.js";
import ballBearingRoute from "./src/Routes/Mechanical/ballBearingRoute.js";
import usersRoute from "./src/Routes/users/usersRoute.js";
import rollRoute from "./src/Routes/Mechanical/rollRoute.js";
import contactorRoute from "./src/Routes/Electric/contactorRoute.js";
import cableRoute from "./src/Routes/Electric/cableRoute.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/ball-bearing", ballBearingRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/rolls", rollRoute);
app.use("/api/v1/contactors", contactorRoute);
app.use("/api/v1/cables", cableRoute);

// Global Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});