import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import morgan from "morgan";
import { sequelize } from "./models/index.js";

import user from "./models/user.js";
import account from "./models/account.js";
import transaction from "./models/transaction.js";

import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8081;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.use("/", authRoutes);
app.use("/users", accountRoutes);
app.use("/accounts", transactionRoutes);

sequelize
  .sync()
  .then(async () => {
    console.log("Database & tables created!");
    // Seed initial data here if needed
    app.listen(PORT, () => {
      console.log(`Server is running at http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => console.error("Database sync error:", err));

app.use((req, res) => {
  res.status(404).render("404", { title: "404 - Not Found" });
});

export default app;
