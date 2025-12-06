// routes/suppliers.js

// Importing express so I can create a router for all supplier-related routes
import express from "express";
// Importing the supabase client so I can talk to my database
import { supabase } from "../db/index.js";

const router = express.Router();

// GET /suppliers
// Returns all suppliers
router.get("/", async (req, res) => {
  try {
    // Getting all suppliers from the "suppliers" table in the database
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    // If something goes wrong, I send a 500 status with the error message
    res.status(500).json({ error: err.message || "DB error" });
  }
});

// GET /suppliers/:id/products
// Returns all products belonging to a supplier
router.get("/:id/products", async (req, res) => {
  const id = Number(req.params.id);
  // Validate id
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid supplier id" });
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("supplier_id", id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "DB error" });
  }
});

// GET /suppliers/:id
// Gets one supplier and also returns how many products they have
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  // Validate id
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid supplier id" });
  }

  try {
    // I select the supplier and also the related products
    // Supabase automatically loads them if the relation exists
    const { data, error } = await supabase
      .from("suppliers")
      .select("id, name, contact_person, email, phone, country, products(id)") // products relation
      .eq("id", id)
      .single();

    // If the supplier doesn't exist, return 404
    if (error) {
      console.error(error);
      return res.status(404).json({ error: "Supplier not found" });
    }

    // Calculate the number of products for this supplier
    const product_count = Array.isArray(data.products)
      ? data.products.length
      : 0;
    // Remove products because we only want to return the count
    delete data.products;

    // Return supplier + product count
    res.json({ ...data, product_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "DB error" });
  }
});

// POST /suppliers
// Here we create a new supplier
router.post("/", async (req, res) => {
  try {
    const { name, contact_person, email, phone, country } = req.body;
    // Basic check so we make sure name is provided
    if (!name || !String(name).trim())
      return res.status(400).json({ error: "Name required" });

    const { data, error } = await supabase
      .from("suppliers")
      .insert([
        { name: String(name).trim(), contact_person, email, phone, country },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "DB error" });
  }
});

// PUT /suppliers/:id
// Here we update an existing supplier
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  // Validate id
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid supplier id" });
  }

  try {
    // Only update fields that the user sends
    const { name, contact_person, email, phone, country } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (contact_person !== undefined) updates.contact_person = contact_person;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (country !== undefined) updates.country = country;

    // If no fields to update, return 400
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No fields to update" });

    // Check supplier exists
    const { data: existing, error: findError } = await supabase
      .from("suppliers")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !existing)
      return res.status(404).json({ error: "Supplier not found" });

    // Here we do the update
    const { data, error } = await supabase
      .from("suppliers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "DB error" });
  }
});

// DELETE /suppliers/:id
// Deletes a supplier if it has no products
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  // Validate id
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid supplier id" });
  }

  try {
    // Prevent deletion if products exist --> safer default
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("id")
      .eq("supplier_id", id)
      .limit(1);
    if (pErr) throw pErr;
    if (products && products.length > 0) {
      return res.status(400).json({
        error: "Supplier has products; delete or reassign them first",
      });
    }

    // Delete the supplier and return deleted rows so we can check if any row was removed
    const { data: deleted, error } = await supabase
      .from("suppliers")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;

    // If nothing was deleted, return 404
    if (!deleted || (Array.isArray(deleted) && deleted.length === 0)) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "DB error" });
  }
});

export default router;
