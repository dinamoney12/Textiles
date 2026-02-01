# Danudara Textiles E-Commerce Website

A full-featured, multilingual e-commerce platform for Danudara Textiles with admin panel, payment gateway integration, and Supabase backend.

## 🌟 Features

### Customer-Facing Features
- **Multi-language Support**: English, Sinhala, Tamil
- **Professional UI**: Logo-themed design with smooth animations
- **Product Catalog**: Filterable and sortable products with categories
- **Shopping Cart**: Guest checkout with phone number storage
- **Checkout Process**: 
  - District-based delivery charges
  - Multiple payment methods (Card, Bank Transfer, Koko Pay)
  - Optional city field
- **Notice System**: Admin-managed promotional banners
- **Contact Form**: Direct communication with customers
- **Responsive Design**: Works perfectly on all devices

### Admin Panel Features
- **Dashboard**: Overview statistics and recent activity
- **Product Management**: Full CRUD operations with multi-language support
- **Category Management**: Create and manage product categories
- **Payment Methods**: Customize available payment options
- **Delivery Charges**: Set district-specific delivery fees (Koobiya delivery service)
- **Notice Management**: Create promotional notices
- **Settings**: Site configuration

### Technical Features
- No order list visible to admin (as per requirements)
- Free to use, no payment gateway charges initially
- Fully animationed interface
- Loading screen with logo animation
- GitHub deployable
- Supabase backend for data and images

## 📋 Prerequisites

- Supabase account (free tier works perfectly)
- GitHub account (for deployment)
- Modern web browser
- Text editor (VS Code recommended)

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Create Database Tables

Run the following SQL in Supabase SQL Editor:

```sql
-- Categories Table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    description TEXT,
    description_si TEXT,
    description_ta TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category_id BIGINT REFERENCES categories(id),
    is_new BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Methods Table
CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true
);

-- Delivery Charges Table
CREATE TABLE delivery_charges (
    id BIGSERIAL PRIMARY KEY,
    district TEXT NOT NULL UNIQUE,
    charge DECIMAL(10,2) NOT NULL
);

-- Notices Table
CREATE TABLE notices (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    content_si TEXT,
    content_ta TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table (for future use)
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT,
    payment_method_id BIGINT REFERENCES payment_methods(id),
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_charge DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE contact_messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow public read, authenticated write)
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON payment_methods FOR SELECT USING (true);
CREATE POLICY "Public read access" ON delivery_charges FOR SELECT USING (true);
CREATE POLICY "Public read access" ON notices FOR SELECT USING (true);

-- For admin operations, you'll need to set up authentication or disable RLS temporarily
-- Alternatively, create service role policies for admin operations
CREATE POLICY "Allow all operations" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON payment_methods FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON delivery_charges FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON notices FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON contact_messages FOR ALL USING (true);
```

### 3. Configure the Website

1. Open `config.js`
2. Replace `YOUR_SUPABASE_URL` with your Supabase project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase anon key

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 4. Add Your Logo

Replace `logo.png` with your Danudara Textiles logo file.

### 5. Seed Initial Data (Optional)

Add some sample data through the admin panel or run this SQL:

```sql
-- Sample Categories
INSERT INTO categories (name, name_si, name_ta, image_url, active) VALUES
('Cotton Fabrics', 'කපු රෙදි', 'பருத்தி துணிகள்', 'https://example.com/cotton.jpg', true),
('Silk Fabrics', 'සේද රෙදි', 'பட்டு துணிகள்', 'https://example.com/silk.jpg', true),
('Polyester Fabrics', 'පොලියෙස්ටර් රෙදි', 'பாலியஸ்டர் துணிகள்', 'https://example.com/polyester.jpg', true);

-- Sample Payment Methods
INSERT INTO payment_methods (name, name_si, name_ta, display_order, active) VALUES
('Card Payment', 'කාඩ් ගෙවීම', 'அட்டை கட்டணம்', 1, true),
('Bank Transfer', 'බැංකු මාරු කිරීම', 'வங்கி பரிமாற்றம்', 2, true),
('Koko Pay', 'කොකෝ පේ', 'கோகோ பே', 3, true);

-- Sample Delivery Charges
INSERT INTO delivery_charges (district, charge) VALUES
('Colombo', 250),
('Gampaha', 300),
('Kalutara', 350);
```

## 📁 File Structure

```
danudara-textiles/
├── index.html              # Main customer-facing website
├── admin.html             # Admin panel
├── styles.css             # Main website styles
├── admin-styles.css       # Admin panel styles
├── app.js                 # Main website JavaScript
├── admin.js               # Admin panel JavaScript
├── config.js              # Configuration and Supabase setup
├── logo.png               # Your logo file
└── README.md              # This file
```

## 🌐 Deployment to GitHub Pages

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to Settings > Pages
4. Select main branch as source
5. Your site will be live at `https://username.github.io/repository-name`

### Alternative Deployment Options

- **Netlify**: Drag and drop deployment
- **Vercel**: Connect GitHub repository for automatic deployment
- **Firebase Hosting**: Use Firebase CLI

## 🛠️ Usage

### Customer Website
1. Visit `index.html`
2. Browse products by category
3. Add items to cart (no login required)
4. Proceed to checkout
5. Enter delivery details and phone number
6. Select payment method
7. Place order

### Admin Panel
1. Visit `admin.html`
2. Manage products, categories, payment methods
3. Set delivery charges by district
4. Create promotional notices
5. View dashboard statistics

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css` and `admin-styles.css`:

```css
:root {
    --primary-color: #00d4ff;     /* Brand color */
    --secondary-color: #0a1628;   /* Dark color */
    --accent-color: #ffffff;      /* White */
}
```

### Fonts
Current fonts: Playfair Display (headings) and Work Sans (body).
To change, update the Google Fonts import in HTML files.

### Logo
Replace `logo.png` with your logo. Recommended size: 200x100px, transparent background.

## 📱 Features Breakdown

### 1. Language Selection
- Top-right corner toggle
- Stores preference in browser
- Translates all UI elements dynamically

### 2. Shopping Cart
- Persistent (localStorage)
- Works without login
- Phone number required at checkout
- Calculates delivery based on district

### 3. Delivery System
- Koobiya delivery service integration
- District-based charges
- Optional city field
- Admin can modify charges anytime

### 4. Payment Methods
- Fully customizable by admin
- Can add/remove/reorder methods
- Multi-language support

### 5. Notice Banner
- Promotional announcements
- Dismissible by users
- Admin controlled
- Slides in with animation

## 🔒 Security Notes

**IMPORTANT**: The current setup is for initial development. For production:

1. **Authentication**: Add proper admin authentication
2. **RLS Policies**: Implement strict Row Level Security
3. **API Keys**: Use environment variables, not hardcoded keys
4. **Payment Gateway**: Integrate actual payment processing
5. **HTTPS**: Ensure site uses HTTPS

## 🐛 Troubleshooting

### Products not loading
- Check Supabase credentials in `config.js`
- Verify database tables exist
- Check browser console for errors

### Images not displaying
- Use full URLs for images
- Consider using Supabase Storage
- Check image URL accessibility

### Admin panel not saving
- Check RLS policies in Supabase
- Verify anon key has sufficient permissions
- Check browser console for errors

## 📄 License

This project is created for Danudara Textiles. All rights reserved.

## 🤝 Support

For support and questions:
- Email: info@danudara.lk
- Phone: +94 XX XXX XXXX

## 🚀 Future Enhancements

Potential upgrades as you grow:

1. **User Authentication**: Customer accounts
2. **Order Tracking**: Real-time order status
3. **Payment Gateway**: Integrate with PayHere, Stripe
4. **Inventory Management**: Stock tracking
5. **Analytics**: Sales reports and insights
6. **Email Notifications**: Order confirmations
7. **Product Reviews**: Customer feedback
8. **Wishlist**: Save favorite items
9. **Search**: Product search functionality
10. **Mobile App**: Native mobile applications

## 📊 Database Schema Overview

### Tables
- **categories**: Product categories
- **products**: Product information
- **payment_methods**: Available payment options
- **delivery_charges**: District-wise delivery fees
- **notices**: Promotional banners
- **orders**: Customer orders (not visible to admin initially)
- **contact_messages**: Customer inquiries

### Key Relationships
- Products → Categories (many-to-one)
- Orders → Payment Methods (many-to-one)
- Orders contain items as JSONB

---

**Built with ❤️ for Danudara Textiles**

Start small, grow big! This system is designed to scale with your business.
