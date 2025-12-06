// public/script.js

// base is empty because the API is on the same origin as the frontend
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
  try {
    // Only set Content-Type when we send a body
    const headers = opts.body ? { "Content-Type": "application/json" } : {};
    const res = await fetch(base + path, { headers, ...opts });
    const text = await res.text();

    // Try to parse JSON, but return raw text if parsing fails
    try {
      return {
        ok: res.ok,
        status: res.status,
        data: text ? JSON.parse(text) : null,
      };
    } catch (e) {
      return { ok: res.ok, status: res.status, data: text };
    }
  } catch (networkError) {
    // Network or other fetch error --> return a consistent object
    return {
      ok: false,
      status: 0,
      data: { error: networkError.message || "Network error" },
    };
  }
}

// loadSuppliers fills the supplier dropdown in the add product form
async function loadSuppliers() {
  // Make sure the select exists before doing anything
  if (!supplierSelect) {
    console.warn("No #supplierSelect element found in DOM");
    return;
  }

  // Reset to a simple default option
  supplierSelect.innerHTML = '<option value="">No supplier</option>';

  const res = await api("/suppliers", { method: "GET" });

  console.log("loadSuppliers response:", res);

  if (!res.ok) {
    // silently ignore --> user can still add products without suppliers
    return;
  }

  const suppliers = res.data;
  if (!Array.isArray(suppliers) || suppliers.length === 0) {
    // No suppliers returned
    return;
  }

  // Add each supplier as an option
  suppliers.forEach((s) => {
    // Make sure we have sensible values to show
    const id =
      s && (s.id ?? s.ID ?? s.Id) != null ? String(s.id ?? s.ID ?? s.Id) : "";
    const name =
      s && (s.name ?? s.Name ?? s.company)
        ? String(s.name ?? s.Name ?? s.company)
        : "(no name)";

    const opt = document.createElement("option");
    opt.value = id; // string value
    opt.textContent = name;
    supplierSelect.appendChild(opt);
  });
}

// loadProducts fetches and displays the list of products
async function loadProducts() {
  if (!productsEl || !productsEmpty) return;
  productsEl.innerHTML = "";
  productsEmpty.hidden = true;

  const res = await api("/products", { method: "GET" });

  // Handle error from backend
  if (!res.ok) {
    productsEl.innerHTML = `<div style="color:#b91c1c">Failed to fetch products (status ${res.status})</div>`;
    return;
  }
  const data = res.data;
  if (!Array.isArray(data) || data.length === 0) {
    productsEmpty.hidden = false;
    return;
  }

  // Create a card for each product using the template
  data.forEach((p) => {
    const node = tpl.content.cloneNode(true);
    const wrap = node.querySelector(".product") || node;

    // Fill in product details
    $(".p-name", wrap).textContent = p.name ?? "";
    $(".p-qty", wrap).textContent = Number.isFinite(Number(p.quantity))
      ? p.quantity
      : "—";

    // Price: show number without decimals if it's a valid number
    const priceNum = Number(p.price);
    $(".p-price", wrap).textContent = Number.isFinite(priceNum)
      ? priceNum
      : "—";

    // Show category and supplier if available
    $(".p-category", wrap).textContent =
      (p.category || "") + (p.supplier ? ` — ${p.supplier.name}` : "");

    const updQty = $(".upd-qty", wrap);
    if (updQty)
      updQty.value = Number.isFinite(Number(p.quantity)) ? p.quantity : 0;

    // Update button --> sends PUT /products/:id
    const updateBtn = $(".updateBtn", wrap);
    if (updateBtn && updQty) {
      updateBtn.addEventListener("click", async () => {
        updateBtn.disabled = true;
        const newQty = parseInt(updQty.value, 10);
        if (!Number.isFinite(newQty)) {
          alert("Please enter a valid quantity");
          updateBtn.disabled = false;
          return;
        }
        const r = await api("/products/" + p.id, {
          method: "PUT",
          body: JSON.stringify({ quantity: newQty }),
        });
        updateBtn.disabled = false;
        if (!r.ok) {
          alert("Update failed: " + (r.data?.error || r.status));
          return;
        }

        // Update displayed quantity
        $(".p-qty", wrap).textContent = r.data.quantity;
        updQty.value = r.data.quantity;
      });
    }

    // Delete button --> deletes product and removes card
    const deleteBtn = $(".deleteBtn", wrap);
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (!confirm(`Delete "${p.name}"?`)) return;
        deleteBtn.disabled = true;
        const r = await api("/products/" + p.id, { method: "DELETE" });
        deleteBtn.disabled = false;
        if (!r.ok) {
          alert("Delete failed: " + (r.data?.error || r.status));
          return;
        }
        wrap.remove();
        if (productsEl.children.length === 0) productsEmpty.hidden = false;
      });
    }

    productsEl.appendChild(node);
  });
}

// Create product form submission
if (addForm) {
  addForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (formMsg) formMsg.hidden = true;

    // Get form values and validate BEFORE sending request
    const nameEl = $("#name");
    const qtyEl = $("#quantity");
    const priceEl = $("#price");
    const catEl = $("#category");

    const name = nameEl?.value?.trim() || "";
    if (!name) {
      if (formMsg) {
        formMsg.textContent = "Name is required";
        formMsg.hidden = false;
      } else {
        alert("Name is required");
      }
      return;
    }

    // Parse numbers safely
    const quantity = parseInt(qtyEl?.value, 10);
    const safeQuantity = Number.isFinite(quantity) ? quantity : 0;

    const priceRaw = priceEl?.value;
    const price = priceRaw === "" ? null : parseFloat(priceRaw);
    const safePrice = Number.isFinite(price) ? price : null;

    const category = catEl?.selectedOptions?.[0]?.textContent?.trim() || "";

    const supplier_id =
      supplierSelect && supplierSelect.value
        ? Number(supplierSelect.value)
        : null;

    const r = await api("/products", {
      method: "POST",
      body: JSON.stringify({
        name,
        quantity: safeQuantity,
        price: safePrice,
        category,
        supplier_id,
      }),
    });

    if (!r.ok) {
      if (formMsg) {
        formMsg.textContent = "Failed to add: " + (r.data?.error || r.status);
        formMsg.hidden = false;
      } else {
        alert("Failed to add: " + (r.data?.error || r.status));
      }
      return;
    }

    // Clear form
    if (nameEl) nameEl.value = "";
    if (qtyEl) qtyEl.value = 1;
    if (priceEl) priceEl.value = "";
    if (catEl) catEl.value = "";

    // Reload products to show the new one
    await loadProducts();
  });
}

// refresh button (if present)
if (refreshBtn) refreshBtn.addEventListener("click", loadProducts);

// Startup: run loads in a small async function so this file works without type="module"
(async function init() {
  await loadSuppliers();
  await loadProducts();
})();
