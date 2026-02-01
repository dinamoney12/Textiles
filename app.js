// Global State
let currentLanguage = APP_CONFIG.defaultLanguage;
let cart = [];
let products = [];
let categories = [];
let paymentMethods = [];
let deliveryCharges = {};
let notices = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    showLoadingScreen();
    
    // Load data from Supabase
    await Promise.all([
        loadProducts(),
        loadCategories(),
        loadPaymentMethods(),
        loadDeliveryCharges(),
        loadNotices()
    ]);
    
    // Load cart from localStorage
    loadCart();
    
    // Initialize UI
    initializeLanguageSelector();
    initializeNavigation();
    initializeModals();
    initializeDistricts();
    displayCategories();
    displayProducts();
    displayNotices();
    
    hideLoadingScreen();
}

// Loading Screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.remove('hidden');
}

function hideLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
    }, 1500);
}

// Language Management
function initializeLanguageSelector() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            changeLanguage(lang);
            
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Set initial language
    changeLanguage(currentLanguage);
}

function changeLanguage(lang) {
    currentLanguage = lang;
    
    // Update all elements with data-* attributes
    document.querySelectorAll(`[data-${lang}]`).forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = text;
        } else if (element.tagName === 'BUTTON' || element.tagName === 'OPTION') {
            element.textContent = text;
        } else {
            element.textContent = text;
        }
    });
    
    // Update loading text
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = loadingText.getAttribute(`data-${lang}`);
    }
}

// Data Loading
async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        products = data || [];
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
    }
}

async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('active', true)
            .order('name');
        
        if (error) throw error;
        categories = data || [];
    } catch (error) {
        console.error('Error loading categories:', error);
        categories = [];
    }
}

async function loadPaymentMethods() {
    try {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('active', true)
            .order('display_order');
        
        if (error) throw error;
        paymentMethods = data || [];
    } catch (error) {
        console.error('Error loading payment methods:', error);
        paymentMethods = [
            { id: 1, name: 'Card Payment', name_si: 'කාඩ් ගෙවීම', name_ta: 'அட்டை கட்டணம்', active: true },
            { id: 2, name: 'Bank Transfer', name_si: 'බැංකු මාරු කිරීම', name_ta: 'வங்கி பரிமாற்றம்', active: true },
            { id: 3, name: 'Koko Pay', name_si: 'කොකෝ පේ', name_ta: 'கோகோ பே', active: true }
        ];
    }
}

async function loadDeliveryCharges() {
    try {
        const { data, error } = await supabase
            .from('delivery_charges')
            .select('*');
        
        if (error) throw error;
        
        deliveryCharges = {};
        data.forEach(item => {
            deliveryCharges[item.district] = item.charge;
        });
    } catch (error) {
        console.error('Error loading delivery charges:', error);
        // Default delivery charge
        APP_CONFIG.districts.forEach(district => {
            deliveryCharges[district] = 350;
        });
    }
}

async function loadNotices() {
    try {
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (error) throw error;
        notices = data || [];
    } catch (error) {
        console.error('Error loading notices:', error);
        notices = [];
    }
}

// Display Functions
function displayCategories() {
    const categoryGrid = document.getElementById('category-grid');
    const categoryFilter = document.getElementById('category-filter');
    
    if (!categoryGrid || categories.length === 0) return;
    
    categoryGrid.innerHTML = categories.map(category => `
        <div class="category-card" onclick="filterByCategory('${category.id}')">
            <img src="${category.image_url || 'placeholder.jpg'}" alt="${category.name}" class="category-image">
            <div class="category-name">${category[`name_${currentLanguage}`] || category.name}</div>
        </div>
    `).join('');
    
    // Update filter dropdown
    if (categoryFilter) {
        categoryFilter.innerHTML = `
            <option value="all">${translations[currentLanguage].allCategories}</option>
            ${categories.map(cat => `
                <option value="${cat.id}">${cat[`name_${currentLanguage}`] || cat.name}</option>
            `).join('')}
        `;
    }
}

function displayProducts(filteredProducts = null) {
    const productsGrid = document.getElementById('products-grid');
    const displayProducts = filteredProducts || products;
    
    if (!productsGrid) return;
    
    if (displayProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-cart">
                <p>${translations[currentLanguage].loading}</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = displayProducts.map(product => `
        <div class="product-card" onclick="showProductDetails(${product.id})">
            <div class="product-image-container">
                <img src="${product.image_url || 'placeholder.jpg'}" alt="${product.name}" class="product-image">
                ${product.is_new ? '<span class="product-badge">New</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product[`name_${currentLanguage}`] || product.name}</h3>
                <p class="product-description">${product[`description_${currentLanguage}`] || product.description || ''}</p>
                <div class="product-footer">
                    <span class="product-price">${APP_CONFIG.currency} ${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">${translations[currentLanguage].addToCart}</button>
                </div>
            </div>
        </div>
    `).join('');
}

function displayNotices() {
    const noticeBanner = document.getElementById('notice-banner');
    
    if (notices.length === 0 || !noticeBanner) {
        if (noticeBanner) noticeBanner.classList.add('hidden');
        return;
    }
    
    const notice = notices[0];
    const noticeText = noticeBanner.querySelector('.notice-text');
    noticeText.textContent = notice[`content_${currentLanguage}`] || notice.content;
    
    noticeBanner.classList.remove('hidden');
    
    // Close button
    const closeBtn = noticeBanner.querySelector('.notice-close');
    closeBtn.onclick = () => noticeBanner.classList.add('hidden');
}

// Cart Management
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification(translations[currentLanguage].addToCart + ' ✓');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartUI();
    }
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    // Update cart modal if open
    const cartModal = document.getElementById('cart-modal');
    if (cartModal.classList.contains('active')) {
        displayCartItems();
    }
}

function displayCartItems() {
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartDelivery = document.getElementById('cart-delivery');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>${translations[currentLanguage].emptyCart}</p>
            </div>
        `;
        cartSubtotal.textContent = `${APP_CONFIG.currency} 0.00`;
        cartDelivery.textContent = `${APP_CONFIG.currency} 0.00`;
        cartTotal.textContent = `${APP_CONFIG.currency} 0.00`;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image_url || 'placeholder.jpg'}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${APP_CONFIG.currency} ${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 350; // Default delivery, will be updated based on district
    const total = subtotal + delivery;
    
    cartSubtotal.textContent = `${APP_CONFIG.currency} ${subtotal.toFixed(2)}`;
    cartDelivery.textContent = `${APP_CONFIG.currency} ${delivery.toFixed(2)}`;
    cartTotal.textContent = `${APP_CONFIG.currency} ${total.toFixed(2)}`;
}

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Cart button
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.addEventListener('click', () => {
        openModal('cart-modal');
        displayCartItems();
    });
    
    // CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Filters
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            filterByCategory(e.target.value);
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }
}

function filterByCategory(categoryId) {
    let filtered = products;
    
    if (categoryId !== 'all') {
        filtered = products.filter(p => p.category_id == categoryId);
    }
    
    displayProducts(filtered);
    
    // Scroll to products
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

function sortProducts(sortBy) {
    let sorted = [...products];
    
    switch(sortBy) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
        default:
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    displayProducts(sorted);
}

// Modals
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification(translations[currentLanguage].emptyCart);
                return;
            }
            closeModal('cart-modal');
            openModal('checkout-modal');
            displayPaymentMethods();
        });
    }
    
    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
        
        // Update delivery charge when district changes
        const districtSelect = document.getElementById('district-select');
        if (districtSelect) {
            districtSelect.addEventListener('change', updateDeliveryCharge);
        }
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const productDetails = document.getElementById('product-details');
    productDetails.innerHTML = `
        <div class="product-detail-grid">
            <img src="${product.image_url || 'placeholder.jpg'}" alt="${product.name}" class="product-detail-image">
            <div class="product-detail-content">
                <h2>${product[`name_${currentLanguage}`] || product.name}</h2>
                <div class="product-detail-price">${APP_CONFIG.currency} ${product.price.toFixed(2)}</div>
                <p class="product-detail-description">${product[`description_${currentLanguage}`] || product.description || ''}</p>
                <div class="quantity-selector">
                    <label>${translations[currentLanguage].quantity}:</label>
                    <button class="quantity-btn" onclick="changeDetailQuantity(-1)">-</button>
                    <span id="detail-quantity">1</span>
                    <button class="quantity-btn" onclick="changeDetailQuantity(1)">+</button>
                </div>
                <button class="cta-button" onclick="addMultipleToCart(${product.id})">${translations[currentLanguage].addToCart}</button>
            </div>
        </div>
    `;
    
    openModal('product-modal');
}

function changeDetailQuantity(change) {
    const quantityElement = document.getElementById('detail-quantity');
    let quantity = parseInt(quantityElement.textContent);
    quantity = Math.max(1, quantity + change);
    quantityElement.textContent = quantity;
}

function addMultipleToCart(productId) {
    const quantity = parseInt(document.getElementById('detail-quantity').textContent);
    
    for (let i = 0; i < quantity; i++) {
        addToCart(productId);
    }
    
    closeModal('product-modal');
}

// Districts
function initializeDistricts() {
    const districtSelect = document.getElementById('district-select');
    if (!districtSelect) return;
    
    districtSelect.innerHTML = `
        <option value="">${translations[currentLanguage].selectDistrict}</option>
        ${APP_CONFIG.districts.map(district => `
            <option value="${district}">${district}</option>
        `).join('')}
    `;
}

function updateDeliveryCharge() {
    const districtSelect = document.getElementById('district-select');
    const district = districtSelect.value;
    
    if (!district) return;
    
    const delivery = deliveryCharges[district] || 350;
    const cartDelivery = document.getElementById('cart-delivery');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartDelivery && cartTotal) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + delivery;
        
        cartDelivery.textContent = `${APP_CONFIG.currency} ${delivery.toFixed(2)}`;
        cartTotal.textContent = `${APP_CONFIG.currency} ${total.toFixed(2)}`;
    }
}

// Payment Methods
function displayPaymentMethods() {
    const paymentMethodsContainer = document.getElementById('payment-methods');
    if (!paymentMethodsContainer) return;
    
    paymentMethodsContainer.innerHTML = paymentMethods.map((method, index) => `
        <label class="payment-method ${index === 0 ? 'selected' : ''}" onclick="selectPaymentMethod(this)">
            <input type="radio" name="payment_method" value="${method.id}" ${index === 0 ? 'checked' : ''}>
            <span>${method[`name_${currentLanguage}`] || method.name}</span>
        </label>
    `).join('');
}

function selectPaymentMethod(element) {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
    element.classList.add('selected');
}

// Checkout
async function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const orderData = {
        customer_name: formData.get('name'),
        customer_phone: formData.get('phone'),
        delivery_address: formData.get('address'),
        district: formData.get('district'),
        city: formData.get('city') || '',
        payment_method_id: formData.get('payment_method'),
        items: cart,
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        delivery_charge: deliveryCharges[formData.get('district')] || 350,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    orderData.total = orderData.subtotal + orderData.delivery_charge;
    
    try {
        // Save order to Supabase
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();
        
        if (error) throw error;
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        
        closeModal('checkout-modal');
        showNotification(translations[currentLanguage].orderSuccess);
        
        // Reset form
        e.target.reset();
        
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification(translations[currentLanguage].orderError);
    }
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 10001;
        animation: slideInLeft 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Contact Form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            created_at: new Date().toISOString()
        };
        
        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([contactData]);
            
            if (error) throw error;
            
            showNotification(translations[currentLanguage].sendMessage + ' ✓');
            e.target.reset();
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Error sending message');
        }
    });
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});
