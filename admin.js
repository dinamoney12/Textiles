// Admin State
let adminProducts = [];
let adminCategories = [];
let adminPaymentMethods = [];
let adminDeliveryCharges = {};
let adminNotices = [];
let currentEditId = null;

// Initialize Admin
document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
});

async function initializeAdmin() {
    showLoading();
    
    await Promise.all([
        loadAdminProducts(),
        loadAdminCategories(),
        loadAdminPaymentMethods(),
        loadAdminDeliveryCharges(),
        loadAdminNotices()
    ]);
    
    updateDashboard();
    displayAllData();
    initializeForms();
    
    hideLoading();
}

// Loading
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
}

// Load Data
async function loadAdminProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(name)')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        adminProducts = data || [];
    } catch (error) {
        console.error('Error loading products:', error);
        adminProducts = [];
    }
}

async function loadAdminCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        
        if (error) throw error;
        adminCategories = data || [];
    } catch (error) {
        console.error('Error loading categories:', error);
        adminCategories = [];
    }
}

async function loadAdminPaymentMethods() {
    try {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .order('display_order');
        
        if (error) throw error;
        adminPaymentMethods = data || [];
    } catch (error) {
        console.error('Error loading payment methods:', error);
        adminPaymentMethods = [];
    }
}

async function loadAdminDeliveryCharges() {
    try {
        const { data, error } = await supabase
            .from('delivery_charges')
            .select('*');
        
        if (error) throw error;
        
        adminDeliveryCharges = {};
        if (data && data.length > 0) {
            data.forEach(item => {
                adminDeliveryCharges[item.district] = item.charge;
            });
        } else {
            // Initialize with default charges
            APP_CONFIG.districts.forEach(district => {
                adminDeliveryCharges[district] = 350;
            });
        }
    } catch (error) {
        console.error('Error loading delivery charges:', error);
        APP_CONFIG.districts.forEach(district => {
            adminDeliveryCharges[district] = 350;
        });
    }
}

async function loadAdminNotices() {
    try {
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        adminNotices = data || [];
    } catch (error) {
        console.error('Error loading notices:', error);
        adminNotices = [];
    }
}

// Dashboard
function updateDashboard() {
    document.getElementById('total-products').textContent = adminProducts.length;
    document.getElementById('total-categories').textContent = adminCategories.length;
    document.getElementById('total-payment-methods').textContent = adminPaymentMethods.length;
    document.getElementById('active-notices').textContent = adminNotices.filter(n => n.active).length;
    
    // Recent activity
    const activityList = document.getElementById('recent-activity');
    const activities = [
        ...adminProducts.slice(0, 3).map(p => ({
            type: 'Product',
            name: p.name,
            date: new Date(p.created_at)
        })),
        ...adminNotices.slice(0, 2).map(n => ({
            type: 'Notice',
            name: n.content.substring(0, 50) + '...',
            date: new Date(n.created_at)
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <strong>${activity.type}:</strong> ${activity.name}
            <br>
            <small>${activity.date.toLocaleDateString()}</small>
        </div>
    `).join('');
}

// Display Data
function displayAllData() {
    displayProductsTable();
    displayCategoriesGrid();
    displayPaymentMethodsList();
    displayDeliveryChargesGrid();
    displayNoticesList();
}

function displayProductsTable() {
    const tbody = document.getElementById('products-table-body');
    
    tbody.innerHTML = adminProducts.map(product => `
        <tr>
            <td><img src="${product.image_url || 'placeholder.jpg'}" alt="${product.name}" class="product-image-thumb"></td>
            <td>${product.name}</td>
            <td>${product.categories?.name || 'N/A'}</td>
            <td>LKR ${product.price.toFixed(2)}</td>
            <td><span class="status-badge ${product.active ? 'status-active' : 'status-inactive'}">${product.active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function displayCategoriesGrid() {
    const grid = document.getElementById('categories-grid');
    
    grid.innerHTML = adminCategories.map(category => `
        <div class="category-admin-card">
            <img src="${category.image_url || 'placeholder.jpg'}" alt="${category.name}" class="category-admin-image">
            <div class="category-admin-info">
                <div class="category-admin-name">${category.name}</div>
                <div class="status-badge ${category.active ? 'status-active' : 'status-inactive'}">${category.active ? 'Active' : 'Inactive'}</div>
                <div class="category-admin-actions">
                    <button class="action-btn btn-edit" onclick="editCategory(${category.id})">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteCategory(${category.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function displayPaymentMethodsList() {
    const list = document.getElementById('payment-methods-list');
    
    list.innerHTML = adminPaymentMethods.map(method => `
        <div class="payment-method-item">
            <div class="payment-method-info">
                <h3>${method.name}</h3>
                <p>Order: ${method.display_order} | Status: ${method.active ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
                <button class="action-btn btn-edit" onclick="editPaymentMethod(${method.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deletePaymentMethod(${method.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function displayDeliveryChargesGrid() {
    const grid = document.getElementById('delivery-charges-grid');
    
    grid.innerHTML = APP_CONFIG.districts.map(district => `
        <div class="delivery-charge-item">
            <label>${district}</label>
            <input type="number" 
                   value="${adminDeliveryCharges[district] || 350}" 
                   data-district="${district}"
                   class="delivery-charge-input"
                   step="0.01">
        </div>
    `).join('');
}

function displayNoticesList() {
    const list = document.getElementById('notices-list');
    
    list.innerHTML = adminNotices.map(notice => `
        <div class="notice-item">
            <div class="notice-content">
                <h3>Notice</h3>
                <p>${notice.content}</p>
                <div class="notice-date">
                    Created: ${new Date(notice.created_at).toLocaleDateString()}
                    | Status: ${notice.active ? 'Active' : 'Inactive'}
                </div>
            </div>
            <div>
                <button class="action-btn btn-edit" onclick="editNotice(${notice.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteNotice(${notice.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Navigation
function showSection(sectionName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
}

// Modal Management
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Product CRUD
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    
    // Populate category dropdown
    const categorySelect = document.getElementById('product-category');
    categorySelect.innerHTML = `
        <option value="">Select Category</option>
        ${adminCategories.map(cat => `
            <option value="${cat.id}">${cat.name}</option>
        `).join('')}
    `;
    
    if (productId) {
        const product = adminProducts.find(p => p.id === productId);
        if (product) {
            title.textContent = 'Edit Product';
            form.elements['id'].value = product.id;
            form.elements['name'].value = product.name;
            form.elements['name_si'].value = product.name_si || '';
            form.elements['name_ta'].value = product.name_ta || '';
            form.elements['category_id'].value = product.category_id;
            form.elements['description'].value = product.description || '';
            form.elements['description_si'].value = product.description_si || '';
            form.elements['description_ta'].value = product.description_ta || '';
            form.elements['price'].value = product.price;
            form.elements['image_url'].value = product.image_url;
            form.elements['is_new'].checked = product.is_new || false;
            form.elements['active'].checked = product.active;
        }
    } else {
        title.textContent = 'Add New Product';
        form.reset();
        form.elements['active'].checked = true;
    }
    
    openModal('product-modal');
}

function editProduct(productId) {
    openProductModal(productId);
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        showLoading();
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        
        await loadAdminProducts();
        displayProductsTable();
        updateDashboard();
        showNotification('Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    } finally {
        hideLoading();
    }
}

// Category CRUD
function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    const title = document.getElementById('category-modal-title');
    
    if (categoryId) {
        const category = adminCategories.find(c => c.id === categoryId);
        if (category) {
            title.textContent = 'Edit Category';
            form.elements['id'].value = category.id;
            form.elements['name'].value = category.name;
            form.elements['name_si'].value = category.name_si || '';
            form.elements['name_ta'].value = category.name_ta || '';
            form.elements['image_url'].value = category.image_url;
            form.elements['active'].checked = category.active;
        }
    } else {
        title.textContent = 'Add New Category';
        form.reset();
        form.elements['active'].checked = true;
    }
    
    openModal('category-modal');
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
        showLoading();
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);
        
        if (error) throw error;
        
        await loadAdminCategories();
        displayCategoriesGrid();
        updateDashboard();
        showNotification('Category deleted successfully');
    } catch (error) {
        console.error('Error deleting category:', error);
        showNotification('Error deleting category', 'error');
    } finally {
        hideLoading();
    }
}

// Payment Method CRUD
function openPaymentMethodModal(methodId = null) {
    const modal = document.getElementById('payment-method-modal');
    const form = document.getElementById('payment-method-form');
    
    if (methodId) {
        const method = adminPaymentMethods.find(m => m.id === methodId);
        if (method) {
            form.elements['id'].value = method.id;
            form.elements['name'].value = method.name;
            form.elements['name_si'].value = method.name_si || '';
            form.elements['name_ta'].value = method.name_ta || '';
            form.elements['display_order'].value = method.display_order;
            form.elements['active'].checked = method.active;
        }
    } else {
        form.reset();
        form.elements['active'].checked = true;
        form.elements['display_order'].value = adminPaymentMethods.length;
    }
    
    openModal('payment-method-modal');
}

function editPaymentMethod(methodId) {
    openPaymentMethodModal(methodId);
}

async function deletePaymentMethod(methodId) {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    
    try {
        showLoading();
        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', methodId);
        
        if (error) throw error;
        
        await loadAdminPaymentMethods();
        displayPaymentMethodsList();
        updateDashboard();
        showNotification('Payment method deleted successfully');
    } catch (error) {
        console.error('Error deleting payment method:', error);
        showNotification('Error deleting payment method', 'error');
    } finally {
        hideLoading();
    }
}

// Notice CRUD
function openNoticeModal(noticeId = null) {
    const modal = document.getElementById('notice-modal');
    const form = document.getElementById('notice-form');
    
    if (noticeId) {
        const notice = adminNotices.find(n => n.id === noticeId);
        if (notice) {
            form.elements['id'].value = notice.id;
            form.elements['content'].value = notice.content;
            form.elements['content_si'].value = notice.content_si || '';
            form.elements['content_ta'].value = notice.content_ta || '';
            form.elements['active'].checked = notice.active;
        }
    } else {
        form.reset();
        form.elements['active'].checked = true;
    }
    
    openModal('notice-modal');
}

function editNotice(noticeId) {
    openNoticeModal(noticeId);
}

async function deleteNotice(noticeId) {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    
    try {
        showLoading();
        const { error } = await supabase
            .from('notices')
            .delete()
            .eq('id', noticeId);
        
        if (error) throw error;
        
        await loadAdminNotices();
        displayNoticesList();
        updateDashboard();
        showNotification('Notice deleted successfully');
    } catch (error) {
        console.error('Error deleting notice:', error);
        showNotification('Error deleting notice', 'error');
    } finally {
        hideLoading();
    }
}

// Delivery Charges
async function saveAllDeliveryCharges() {
    const inputs = document.querySelectorAll('.delivery-charge-input');
    const charges = [];
    
    inputs.forEach(input => {
        charges.push({
            district: input.dataset.district,
            charge: parseFloat(input.value) || 350
        });
    });
    
    try {
        showLoading();
        
        // Delete existing charges
        await supabase.from('delivery_charges').delete().neq('id', 0);
        
        // Insert new charges
        const { error } = await supabase
            .from('delivery_charges')
            .insert(charges);
        
        if (error) throw error;
        
        await loadAdminDeliveryCharges();
        showNotification('Delivery charges saved successfully');
    } catch (error) {
        console.error('Error saving delivery charges:', error);
        showNotification('Error saving delivery charges', 'error');
    } finally {
        hideLoading();
    }
}

// Form Handling
function initializeForms() {
    // Product Form
    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const productId = formData.get('id');
        
        const productData = {
            name: formData.get('name'),
            name_si: formData.get('name_si'),
            name_ta: formData.get('name_ta'),
            category_id: formData.get('category_id'),
            description: formData.get('description'),
            description_si: formData.get('description_si'),
            description_ta: formData.get('description_ta'),
            price: parseFloat(formData.get('price')),
            image_url: formData.get('image_url'),
            is_new: formData.get('is_new') === 'on',
            active: formData.get('active') === 'on'
        };
        
        try {
            showLoading();
            
            if (productId) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', productId);
                
                if (error) throw error;
            } else {
                productData.created_at = new Date().toISOString();
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);
                
                if (error) throw error;
            }
            
            await loadAdminProducts();
            displayProductsTable();
            updateDashboard();
            closeModal('product-modal');
            showNotification('Product saved successfully');
        } catch (error) {
            console.error('Error saving product:', error);
            showNotification('Error saving product', 'error');
        } finally {
            hideLoading();
        }
    });
    
    // Category Form
    document.getElementById('category-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const categoryId = formData.get('id');
        
        const categoryData = {
            name: formData.get('name'),
            name_si: formData.get('name_si'),
            name_ta: formData.get('name_ta'),
            image_url: formData.get('image_url'),
            active: formData.get('active') === 'on'
        };
        
        try {
            showLoading();
            
            if (categoryId) {
                const { error } = await supabase
                    .from('categories')
                    .update(categoryData)
                    .eq('id', categoryId);
                
                if (error) throw error;
            } else {
                categoryData.created_at = new Date().toISOString();
                const { error } = await supabase
                    .from('categories')
                    .insert([categoryData]);
                
                if (error) throw error;
            }
            
            await loadAdminCategories();
            displayCategoriesGrid();
            updateDashboard();
            closeModal('category-modal');
            showNotification('Category saved successfully');
        } catch (error) {
            console.error('Error saving category:', error);
            showNotification('Error saving category', 'error');
        } finally {
            hideLoading();
        }
    });
    
    // Payment Method Form
    document.getElementById('payment-method-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const methodId = formData.get('id');
        
        const methodData = {
            name: formData.get('name'),
            name_si: formData.get('name_si'),
            name_ta: formData.get('name_ta'),
            display_order: parseInt(formData.get('display_order')),
            active: formData.get('active') === 'on'
        };
        
        try {
            showLoading();
            
            if (methodId) {
                const { error } = await supabase
                    .from('payment_methods')
                    .update(methodData)
                    .eq('id', methodId);
                
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('payment_methods')
                    .insert([methodData]);
                
                if (error) throw error;
            }
            
            await loadAdminPaymentMethods();
            displayPaymentMethodsList();
            updateDashboard();
            closeModal('payment-method-modal');
            showNotification('Payment method saved successfully');
        } catch (error) {
            console.error('Error saving payment method:', error);
            showNotification('Error saving payment method', 'error');
        } finally {
            hideLoading();
        }
    });
    
    // Notice Form
    document.getElementById('notice-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const noticeId = formData.get('id');
        
        const noticeData = {
            content: formData.get('content'),
            content_si: formData.get('content_si'),
            content_ta: formData.get('content_ta'),
            active: formData.get('active') === 'on'
        };
        
        try {
            showLoading();
            
            if (noticeId) {
                const { error } = await supabase
                    .from('notices')
                    .update(noticeData)
                    .eq('id', noticeId);
                
                if (error) throw error;
            } else {
                noticeData.created_at = new Date().toISOString();
                const { error } = await supabase
                    .from('notices')
                    .insert([noticeData]);
                
                if (error) throw error;
            }
            
            await loadAdminNotices();
            displayNoticesList();
            updateDashboard();
            closeModal('notice-modal');
            showNotification('Notice saved successfully');
        } catch (error) {
            console.error('Error saving notice:', error);
            showNotification('Error saving notice', 'error');
        } finally {
            hideLoading();
        }
    });
    
    // Settings Form
    document.getElementById('site-settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Settings saved successfully');
    });
}

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}
