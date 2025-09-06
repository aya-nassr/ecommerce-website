// ==========================
// Global Variables
// ==========================
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('shop-cart')) || [];
let timeoutId;

// ==========================
// DOM Elements
// ==========================
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('searchSuggestions');
const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const body = document.body;

// Product Popup Elements
const productPopup = document.getElementById('productPopup');
const popupImage = document.getElementById('popupImage');
const popupName = document.getElementById('popupName');
const popupPrice = document.getElementById('popupPrice');
const popupCategory = document.getElementById('popupCategory');
const popupDescription = document.getElementById('popupDescription');
const popupRating = document.getElementById('popupRating');
const popupSku = document.getElementById('popupSku');
const sizeOptionsContainer = document.getElementById('sizeOptions');
const colorOptionsContainer = document.getElementById('colorOptions');
const addToCartPopupBtn = document.getElementById('addToCartPopupBtn');
const closePopupBtn = document.getElementById('closePopupBtn');

// Category mapping for sections
const categoryToSectionId = {
    "Man": "manSection",
    "Women": "womenSection",
    "Kids": "kidsSection",
    "Accessories": "accessoriesSection",
    "Recommended": "recommendedSection"
};

// ==========================
// Fetch Products from JSON
// ==========================
fetch('products.json')
  .then(res => res.json())
  .then(data => {
      allProducts = [
          ...data.recommendedProducts,
          ...data.manProducts,
          ...data.womenProducts,
          ...data.kidsProducts,
          ...data.accessoriesProducts
      ];
      renderProducts(allProducts);
  })
  .catch(err => console.error("Error loading products:", err));

// ==========================
// Product Rendering
// ==========================
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;

    // Image and action buttons
    const imgDiv = document.createElement('div');
    imgDiv.className = 'product-image';
    const img = document.createElement('img');
    img.src = product.image_url;
    img.alt = product.name;
    imgDiv.appendChild(img);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'product-actions';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'action-btn';
    viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    viewBtn.addEventListener('click', () => viewProduct(product));

    const addBtn = document.createElement('button');
    addBtn.className = 'action-btn';
    addBtn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
    addBtn.addEventListener('click', () => addToCart(product.name, product.price, product.image_url));

    actionsDiv.append(viewBtn, addBtn);
    imgDiv.appendChild(actionsDiv);

    // Info (name, rating, price)
    const infoDiv = document.createElement('div');
    infoDiv.className = 'product-info';

    const title = document.createElement('h3');
    title.className = 'product-name';
    title.textContent = product.name;

    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'product-rating';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = i < product.rating ? '★' : '☆';
        ratingDiv.appendChild(star);
    }

    const priceDiv = document.createElement('div');
    priceDiv.className = 'product-price';
    priceDiv.textContent = `$${product.price.toFixed(2)}`;

    infoDiv.append(title, ratingDiv, priceDiv);
    card.append(imgDiv, infoDiv);

    return card;
}

// Render products into grids
function renderProducts(products) {
    document.querySelectorAll('.product-grid').forEach(grid => grid.innerHTML = '');

    products.forEach(product => {
        let targetGrid;
        switch(product.category) {
            case "Man": targetGrid = document.getElementById('manGrid'); break;
            case "Women": targetGrid = document.getElementById('womenGrid'); break;
            case "Kids": targetGrid = document.getElementById('kidsGrid'); break;
            case "Accessories": targetGrid = document.getElementById('accessoriesGrid'); break;
            default: targetGrid = document.getElementById('recommendedGrid');
        }
        if (targetGrid) targetGrid.appendChild(createProductCard(product));
    });
}

// ==========================
// Search Functionality
// ==========================
function debounce(cb, delay = 400) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(cb, delay);
}

let currentSearchResults = [];

// Perform search across multiple fields
function performSearch(query) {
    if (!query) return allProducts;

    const terms = query.toLowerCase().trim().split(' ').filter(Boolean);

    return allProducts.filter(product => {
        const searchable = [product.name, product.description, product.category, product.sku].join(' ').toLowerCase();
        return terms.every(term => searchable.includes(term));
    }).sort((a, b) => {
        const aMatch = a.name.toLowerCase().includes(query.toLowerCase());
        const bMatch = b.name.toLowerCase().includes(query.toLowerCase());
        if(aMatch && !bMatch) return -1;
        if(!aMatch && bMatch) return 1;
        return b.rating - a.rating; // Higher rated first
    });
}

// Highlight search terms
function highlightSearchTerm(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Generate search suggestions
function createSearchSuggestions(results, query) {
    if (!results.length) return `<li class="no-results"><i class="fas fa-search"></i><span>No products found for "${query}"</span><small>Try different keywords</small></li>`;

    const suggestions = results.slice(0, 8).map(product => {
        const exactMatch = product.name.toLowerCase().includes(query.toLowerCase()) ? 'exact' : 'related';
        return `<li data-id="${product.id}" class="suggestion-item ${exactMatch}">
            <img src="${product.image_url}" class="suggestion-image" alt="${product.name}" loading="lazy">
            <div class="suggestion-content">
                <div class="suggestion-name">${highlightSearchTerm(product.name, query)}</div>
                <div class="suggestion-details">
                    <span class="suggestion-category">${product.category}</span>
                    <span class="suggestion-price">$${product.price.toFixed(2)}</span>
                    <div class="suggestion-rating">${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</div>
                </div>
            </div>
        </li>`;
    }).join('');

    const stats = `<li class="search-stats"><i class="fas fa-info-circle"></i><span>Found ${results.length} product${results.length !== 1 ? 's' : ''}</span>${results.length > 8 ? '<small>Showing top 8 results</small>' : ''}</li>`;

    return stats + suggestions;
}

// Search input listener
searchInput.addEventListener("input", () => {
    debounce(() => {
        const query = searchInput.value.trim();
        if (query.length) {
            currentSearchResults = performSearch(query);
            suggestionsBox.innerHTML = createSearchSuggestions(currentSearchResults, query);
            suggestionsBox.style.display = "block";

            // Click suggestion to scroll to product
            suggestionsBox.querySelectorAll(".suggestion-item").forEach(li => {
                li.addEventListener('click', () => {
                    const prodId = li.dataset.id;
                    const product = allProducts.find(p => p.id === prodId);
                    if(product) {
                        searchInput.value = product.name;
                        suggestionsBox.style.display = 'none';
                        const section = document.getElementById(categoryToSectionId[product.category]);
                        if(section) {
                            section.scrollIntoView({ behavior: "smooth", block: "start" });
                            highlightProductCard(prodId);
                        }
                    }
                });
            });

            updateSearchResultsCount(currentSearchResults.length, query);
        } else {
            suggestionsBox.style.display = 'none';
            currentSearchResults = [];
            renderProducts(allProducts);
            hideSearchResultsCount();
        }
    });
});

// ==========================
// Cart Functions
// ==========================
function addToCart(name, price, imageUrl) {
    const item = cart.find(i => i.name === name);
    if(item) item.quantity += 1;
    else cart.push({ name, price, imageUrl, quantity: 1 });

    saveCart();
    updateCartUI();
    showCartNotification();
}

function removeFromCart(name) {
    cart = cart.filter(i => i.name !== name);
    saveCart();
    updateCartUI();
}

function updateQuantity(name, change) {
    const item = cart.find(i => i.name === name);
    if(!item) return;
    item.quantity += change;
    if(item.quantity <= 0) removeFromCart(name);
    else { saveCart(); updateCartUI(); }
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('shop-cart', JSON.stringify(cart));
}

// Create a single cart item element
function createCartItem(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';

    // Image
    const imgDiv = document.createElement('div');
    imgDiv.className = 'cart-item-image';
    imgDiv.style.backgroundImage = `url('${item.imageUrl}')`;

    // Info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'cart-item-info';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'cart-item-name';
    nameDiv.textContent = item.name;

    const priceDiv = document.createElement('div');
    priceDiv.className = 'cart-item-price';
    priceDiv.textContent = `$${item.price.toFixed(2)}`;

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'cart-item-controls';

    const btnMinus = document.createElement('button');
    btnMinus.className = 'quantity-btn';
    btnMinus.textContent = '-';
    btnMinus.addEventListener('click', () => updateQuantity(item.name, -1));

    const qtySpan = document.createElement('span');
    qtySpan.className = 'quantity';
    qtySpan.textContent = item.quantity;

    const btnPlus = document.createElement('button');
    btnPlus.className = 'quantity-btn';
    btnPlus.textContent = '+';
    btnPlus.addEventListener('click', () => updateQuantity(item.name, 1));

    controlsDiv.append(btnMinus, qtySpan, btnPlus);
    infoDiv.append(nameDiv, priceDiv, controlsDiv);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-item';
    removeBtn.title = 'Remove item';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => removeFromCart(item.name));

    cartItem.append(imgDiv, infoDiv, removeBtn);
    return cartItem;
}

// Update cart UI
function updateCartUI() {
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    cartBadge.textContent = totalItems;

    cartItems.innerHTML = cart.length ? '' : '<div class="empty-cart">Your cart is empty</div>';
    cart.forEach(item => cartItems.appendChild(createCartItem(item)));

    const total = cart.reduce((sum,i) => sum + i.price*i.quantity, 0);
    cartTotal.textContent = total.toFixed(2);
}

// Cart notification
function showCartNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = "position:fixed;top:100px;right:20px;background:#27ae60;color:white;padding:15px 20px;border-radius:5px;z-index:3000;animation: slideIn 0.3s ease;";
    notification.textContent = 'Item added to cart!';
    document.body.appendChild(notification);
    setTimeout(()=>notification.remove(),2000);
}

// Open / Close cart
function openCart() { cartSidebar.classList.add('open'); cartOverlay.classList.add('active'); document.body.style.overflow='hidden'; }
function closeCartSidebar() { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('active'); document.body.style.overflow='auto'; }

// ==========================
// Product Popup
// ==========================
function viewProduct(product) {
    popupImage.src = product.image_url;
    popupName.textContent = product.name;
    popupPrice.textContent = `$${product.price.toFixed(2)}`;
    popupCategory.textContent = product.category;
    popupDescription.textContent = product.description;
    popupSku.textContent = `SKU: ${product.sku}`;

    popupRating.innerHTML = '';
    for(let i = 0; i < product.rating; i++) {
        const star = document.createElement('i');
        star.classList.add('fas','fa-star');
        popupRating.appendChild(star);
    }

    // Show/hide size & color options
    const showOptions = /man|women|kids/i.test(product.id);
    sizeOptionsContainer.parentElement.style.display = showOptions ? 'flex' : 'none';
    colorOptionsContainer.parentElement.style.display = showOptions ? 'flex' : 'none';

    addToCartPopupBtn.onclick = () => { addToCart(product.name, product.price, product.image_url); closeProductPopup(); };

    productPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductPopup() {
    productPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Highlight product card
function highlightProductCard(productId) {
    document.querySelectorAll('.product-card.highlight').forEach(el => el.classList.remove('highlight'));
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    if(card) {
        card.classList.add('highlight');
        setTimeout(() => card.classList.remove('highlight'), 3000);
    }
}

// ==========================
// Event Listeners Setup
// ==========================
function setupEventListeners() {
    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);
    clearCartBtn.addEventListener('click', clearCart);

    closePopupBtn.addEventListener('click', closeProductPopup);
    productPopup.addEventListener('click', e => { if(e.target === productPopup) closeProductPopup(); });

    document.addEventListener('keydown', e => { if(e.key === 'Escape'){ closeCartSidebar(); closeProductPopup(); } });

    themeToggleBtn.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        themeIcon.src = body.classList.contains("dark-mode") ? "images/sun.png" : "images/moon.png";
        localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
    });
}

// ==========================
// Initialize
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(allProducts);
    updateCartUI();
    setupEventListeners();

    // Apply saved theme
    if(localStorage.getItem("theme")==="dark"){
        body.classList.add("dark-mode");
        themeIcon.src = "images/sun.png";
    }
});
