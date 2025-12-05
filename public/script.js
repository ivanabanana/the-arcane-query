// public/script.js

//base is empty because the API is on the same origin as the frontend
const base = ""; // same origin

// Tiny DOM helpers to make selectors easier and shorter!
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

// Some important DOM nodes that are used a lot
const productsEl = $("#products");
const productsEmpty = $("#productsEmpty");
const addForm = $("#addForm");
const refreshBtn = $("#refreshBtn");
const formMsg = $("#formMsg");
const tpl = document.getElementById("productTpl");
const supplierSelect = $("#supplierSelect");

// API helper, wraps fetch and handles JSON, returns a consistent object
async function api(path, opts = {}) {
  // Always send JSON header by default
  const res = await fetch(base + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const text = await res.text();
  try {
    return {
      ok: res.ok,
      status: res.status,
      data: text ? JSON.parse(text) : null,
    };
  } catch (e) {
    return { ok: res.ok, status: res.status, data: text };
  }
}

// loadSuppliers fills the supplier dropdown in the add product form
async function loadSuppliers() {
  if (!supplierSelect) return;
  supplierSelect.innerHTML = '<option value="">No supplier</option>';
  const { ok, status, data } = await api("/suppliers", { method: "GET" });
  if (!ok) {
    // silently ignore
    //If suppliers can't be loaded, user can still add products without suppliers
    return;
  }

  // Add each supplier as an option
  data.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id; // Numberic ID from DB
    opt.textContent = s.name;
    supplierSelect.appendChild(opt);
  });
}

// loadProducts fetches and displays the list of products
async function loadProducts() {
  productsEl.innerHTML = "";
  productsEmpty.hidden = true;
  const { ok, status, data } = await api("/products", { method: "GET" });

  // Handle error from backend
  if (!ok) {
    productsEl.innerHTML = `<div style="color:#b91c1c">Failed to fetch products (status ${status})</div>`;
    return;
  }
  if (!data || data.length === 0) {
    productsEmpty.hidden = false;
    return;
  }

  // Create a card for each product using the template
  data.forEach((p) => {
    const node = tpl.content.cloneNode(true);
    const wrap = node.querySelector(".product");

    // Fill in product details
    $(".p-name", wrap).textContent = p.name;
    $(".p-qty", wrap).textContent = p.quantity;
    $(".p-price", wrap).textContent = Number(p.price).toFixed(2);
    // Show category and supplier if available
    $(".p-category", wrap).textContent =
      (p.category || "") + (p.supplier ? ` — ${p.supplier.name}` : "");

    const updQty = $(".upd-qty", wrap);
    updQty.value = p.quantity ?? 0;

    // Update button - sends PUT /products/:id
    const updateBtn = $(".updateBtn", wrap);
    updateBtn.addEventListener("click", async () => {
      const newQty = Number(updQty.value || 0);
      const patch = { quantity: newQty };
      const { ok, status, data } = await api("/products/" + p.id, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      if (!ok) {
        alert("Update failed: " + (data?.error || status));
        return;
      }

      // Update displayed quantity
      $(".p-qty", wrap).textContent = data.quantity;
      updQty.value = data.quantity;
    });

    // Delete button - deletes product and removes card
    const deleteBtn = $(".deleteBtn", wrap);
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete "${p.name}"?`)) return;
      const { ok, status, data } = await api("/products/" + p.id, {
        method: "DELETE",
      });
      if (!ok && status !== 204) {
        alert("Delete failed: " + (data?.error || status));
        return;
      }
      wrap.remove();
      if (productsEl.children.length === 0) productsEmpty.hidden = false;
    });

    productsEl.appendChild(node);
  });
}

// Create product form submission
addForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  formMsg.hidden = true;

  // Get form values
  const name = $("#name").value.trim();
  const quantity = Number($("#quantity").value || 0);
  const price = Number($("#price").value || 0);
  const category = $("#category").value.trim();

  const supplier_id = supplierSelect.value
    ? Number(supplierSelect.value)
    : null;

  const { ok, status, data } = await api("/products", {
    method: "POST",
    body: JSON.stringify({ name, quantity, price, category, supplier_id }),
  });

  // Check required fields before sending request
  if (!name) {
    formMsg.textContent = "Name is required";
    formMsg.hidden = false;
    return;
  }

  if (!ok) {
    formMsg.textContent = "Failed to add: " + (data?.error || status);
    formMsg.hidden = false;
    return;
  }

  // Clear form
  $("#name").value = "";
  $("#quantity").value = 1;
  $("#price").value = "";
  $("#category").value = "";

  // Reload products to show the new one
  loadProducts();
});

refreshBtn.addEventListener("click", loadProducts);

await loadSuppliers();
loadProducts();
