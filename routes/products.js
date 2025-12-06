// routes/products.js
import express from "express";
import { supabase } from "../db/index.js";

const router = express.Router();
console.log("Loaded products router");

// GET all products  ->  This becomes GET /products because the router is mounted in server.js
router.get("/", async (req, res) => {
  try {
    // Here we select products along with their supplier info in supabase
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, quantity, price, category, supplier_id, suppliers(id, name)"
      )
      .order("id", { ascending: true });

    if (error) throw error;

    // Supabase returns suppliers as an array, so here it gets "flattened" to a simple supplier
    const mapped = data.map((row) => {
      const supplier = row.suppliers
        ? Array.isArray(row.suppliers)
          ? row.suppliers[0] // take first item
          : row.suppliers // if not array, just use it as it is
        : null;
      const { suppliers, ...rest } = row;
      return {
        ...rest,
        supplier: supplier ? { id: supplier.id, name: supplier.name } : null,
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error(err);
    // Small typo fixed in message
    res.status(500).json({ error: err.message || "Something went wrong (DB)" });
  }
});

// GET one product by ID -> GET /products/:id
// This is almost the same as above but only returns one product
router.get("/:id", async (req, res) => {
  // Validate id and convert to number
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, quantity, price, category, supplier_id, suppliers(id, name)"
      )
      .eq("id", id)
      .single(); // Only one row

    if (error || !data) {
      // If supabase returns an error or no data, respond 404
      return res.status(404).json({ error: "Product not found" });
    }

    // Same logic as above with the supplier
    const supplier = data.suppliers
      ? Array.isArray(data.suppliers)
        ? data.suppliers[0]
        : data.suppliers
      : null;
    const { suppliers, ...rest } = data;

    res.json({
      ...rest,
      supplier: supplier ? { id: supplier.id, name: supplier.name } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong (DB)" });
  }
});

// POST create product -> POST /products
router.post("/", async (req, res) => {
  // Get fields from the client (frontend or Postman)
  const { name, quantity, price, category, supplier_id } = req.body;

  // Simple validation BEFORE inserting
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  // Parse numeric fields a little safely
  const safeQuantity = Number.isFinite(Number(quantity)) ? Number(quantity) : 0;
  const safePrice =
    price === null || price === undefined || price === ""
      ? null
      : Number.isFinite(Number(price))
      ? Number(price)
      : null;

  try {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: name.trim(),
          quantity: safeQuantity,
          price: safePrice,
          category: category || null,
          supplier_id: supplier_id || null,
        },
      ])
      .select()
      .single(); // Return the created product

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data); // 201 = Created
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong (DB)" });
  }
});

// PUT update a product -> PUT /products/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const fields = req.body; // Whatever the user wants to update

  if ("id" in fields) delete fields.id;

  try {
    const { data, error } = await supabase
      .from("products")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // Could be no rows updated or other DB error
      return res.status(400).json({ error: error.message });
    }

    // If data is null or undefined, treat as not found
    if (!data) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong (DB)" });
  }
});

// DELETE remove a product -> DELETE /products/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // If no rows were deleted, data may be empty
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(204).send(); // 204 = deleted, no content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong (DB)" });
  }
});

export default router;
