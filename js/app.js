"use strict";

/* =======================
   گرفتن المنت‌ها
======================= */

const productsGrid = document.getElementById("productsGrid");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const sortProducts = document.getElementById("sortProducts");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");
const resetFilters = document.getElementById("resetFilters");

const cartButton = document.getElementById("cartButton");
const closeCart = document.getElementById("closeCart");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const categoryButtons = document.querySelectorAll(".category-card");

/* =======================
   متغیرهای اصلی
======================= */

let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("nexoraCart")) || [];

/* =======================
   تبدیل عدد به فارسی
======================= */

function toPersianNumber(number) {
  return number.toLocaleString("fa-IR");
}

function formatPrice(price) {
  return `${toPersianNumber(price)} تومان`;
}

/* =======================
   گرفتن محصولات از JSON
======================= */

async function loadProducts() {
  try {
    const response = await fetch("data/products.json");

    if (!response.ok) {
      throw new Error("فایل محصولات پیدا نشد");
    }

    products = await response.json();
    filteredProducts = [...products];

    renderProducts(filteredProducts);
    updateCart();
    updatePriceText();
  } catch (error) {
    productsGrid.innerHTML = `
      <p class="no-products">
        خطا در دریافت محصولات. مسیر فایل data/products.json را بررسی کن.
      </p>
    `;
    console.error(error);
  }
}

/* =======================
   نمایش محصولات
======================= */

function renderProducts(items) {
  productsGrid.innerHTML = "";

  if (items.length === 0) {
    productsGrid.innerHTML = `
      <p class="no-products">محصولی با این مشخصات پیدا نشد.</p>
    `;
    return;
  }

  items.forEach((product) => {
    const productCard = document.createElement("article");
    productCard.className = "product-card";

    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
      </div>

      <span class="product-category">${product.categoryFa}</span>

      <h3 class="product-title">${product.title}</h3>

      <div class="product-info">
        <div class="discount-row">
          <span class="discount-badge">${toPersianNumber(product.discount)}٪</span>
          <span class="old-price">${formatPrice(product.oldPrice)}</span>
        </div>

        <strong class="product-price">${formatPrice(product.price)}</strong>

        <button class="add-to-cart" data-id="${product.id}">
          افزودن به سبد خرید
        </button>
      </div>
    `;

    productsGrid.appendChild(productCard);
  });
}

/* =======================
   فیلتر و مرتب‌سازی
======================= */

function applyFilters() {
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const maxPrice = Number(priceFilter.value);
  const sortValue = sortProducts.value;

  filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchText);
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice = product.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (sortValue === "cheap") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sortValue === "expensive") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (sortValue === "discount") {
    filteredProducts.sort((a, b) => b.discount - a.discount);
  }

  renderProducts(filteredProducts);
}

/* =======================
   سبد خرید
======================= */

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  const cartItem = cart.find((item) => item.id === id);

  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  updateCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  updateCart();
}

function changeQuantity(id, type) {
  const item = cart.find((product) => product.id === id);

  if (!item) return;

  if (type === "plus") {
    item.quantity += 1;
  }

  if (type === "minus") {
    item.quantity -= 1;

    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
  }

  saveCart();
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p class="empty-cart">سبد خرید شما خالی است.</p>
    `;
  }

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <h4>${item.title}</h4>

      <span>${formatPrice(item.price)}</span>

      <div class="cart-item-actions">
        <button data-id="${item.id}" data-action="plus">+</button>
        <strong>${toPersianNumber(item.quantity)}</strong>
        <button data-id="${item.id}" data-action="minus">-</button>
        <button data-id="${item.id}" data-action="remove">حذف</button>
      </div>
    `;

    cartItems.appendChild(cartItem);
  });

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent = toPersianNumber(totalCount);
  cartTotal.textContent = formatPrice(totalPrice);
}

function saveCart() {
  localStorage.setItem("nexoraCart", JSON.stringify(cart));
}

/* =======================
   باز و بسته شدن سبد خرید
======================= */

function openCart() {
  cartPanel.classList.add("active");
  overlay.classList.add("active");
}

function closeCartPanel() {
  cartPanel.classList.remove("active");
  overlay.classList.remove("active");
}

/* =======================
   قیمت فیلتر
======================= */

function updatePriceText() {
  priceValue.textContent = formatPrice(Number(priceFilter.value));
}

/* =======================
   رویدادها
======================= */

productsGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-to-cart");

  if (!button) return;

  const productId = Number(button.dataset.id);
  addToCart(productId);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "plus") changeQuantity(id, "plus");
  if (action === "minus") changeQuantity(id, "minus");
  if (action === "remove") removeFromCart(id);
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters();
});

searchInput.addEventListener("input", applyFilters);
sortProducts.addEventListener("change", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

priceFilter.addEventListener("input", () => {
  updatePriceText();
  applyFilters();
});

resetFilters.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "all";
  sortProducts.value = "default";
  priceFilter.value = priceFilter.max;

  updatePriceText();
  applyFilters();
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    categoryFilter.value = category;
    applyFilters();

    document.getElementById("products").scrollIntoView({
      behavior: "smooth"
    });
  });
});

cartButton.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartPanel);
overlay.addEventListener("click", closeCartPanel);

/* =======================
   شروع برنامه
======================= */

loadProducts();