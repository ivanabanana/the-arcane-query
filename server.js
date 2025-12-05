// server.js

//Importing express so I can create my server and set up routes
import express from "express";
// dotenv lets me use a .env file so I don't expose my keys
import dotenv from "dotenv";
// Importing my route files for products and suppliers
import productsRouter from "./routes/products.js";
import suppliersRouter from "./routes/suppliers.js";

// Load environment variables from .env
dotenv.config();

const app = express();

// This allows the server to read JSON coming in from the client (like Postman or my frontend)
app.use(express.json());

// This makes the "public" folder available so I can open index.html in my browser
app.use(express.static("public")); // serves files from the public folder

// Here I'm setting up my routes for products and suppliers. Everything with /products will go to productsRouter, and /suppliers to suppliersRouter.
app.use("/products", productsRouter);
app.use("/suppliers", suppliersRouter);

// A simple route to check if the API is running
app.get("/", (req, res) => res.send("Inventory API OK"));

// Start the server on the specified PORT or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
