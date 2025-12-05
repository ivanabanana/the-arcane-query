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
          : row.suppliers // if not array, just use it  as it is
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
    res.status(500).json({ error: err.message || "Somwthing went wrong (DB)" });
  }
});

// GET one product by ID -> GET /products/:id
// This is almost the same as above but only returns one product
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, quantity, price, category, supplier_id, suppliers(id, name)"
      )
      .eq("id", id)
      .single(); // Only one row

    if (error || !data)
      return res.status(404).json({ error: "Product not found" });
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

  const { data, error } = await supabase
    .from("products")
    .insert([{ name, quantity, price, category, supplier_id }])
    .select()
    .single(); // Return the created product

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data); // 201 = Created
});

// PUT update a product -> PUT /products/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const fields = req.body; // Whatever the user wants to update

  const { data, error } = await supabase
    .from("products")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE remove a product -> DELETE /products/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });

  res.status(204).send(); // 204 = deleted, no content
});

export default router;
