# 🍕 PizzaHub – Full-Stack Artisanal Pizza Delivery & Real-Time Kitchen Inventory Management System

A production-grade, enterprise-ready full-stack web application for an artisanal pizza delivery business. Built with **FastAPI (Python)**, **React.js 18 (Vite)**, **Tailwind CSS**, and **MySQL / SQLite (SQLAlchemy ORM)** with live **WebSockets**, **Razorpay Test Mode**, and **Chef Pizzo AI Voice Assistant**.

Developed for **Oasis Infobyte Internship — Level 3 Task 1 (Web Development)**.

---

## 🌟 Key Features

### 👤 1. Customer Experience & Ordering
- **25+ Handcrafted Pizza Varieties**:
  - *Classic Italian Collection*: Margherita Classica, Farmhouse Delight, Double Cheese Margherita, Peppy Paneer, Veggie Supreme, Fiery Jalapeno Crunch.
  - *Artisan Special Pizzas*: Truffle Mushroom & Burrata, Burrata Pesto Rosso, Smoked Quattro Formaggi, Caramelized Onion & Brie.
  - *Spicy & Fiery Pizzas*: Peri-Peri Inferno, Spicy Paneer Tikka, Jalapeno Diablo Feast.
  - *Cheesy Overload Pizzas*: Triple Cheese Volcano, Garlic Herb 4-Cheese Burst, Ricotta & Sun-Dried Tomato.
  - *Gourmet & Healthy Pizzas*: Mediterranean Garden, Spinach & Artichoke Heart, Vegan Truffle Harvest.
- **5-Step Interactive Custom Pizza Builder**:
  1. **Crust Base**: Classic Hand-Tossed, Thin Crust, Cheese Burst, 100% Whole Wheat, Artisan Sourdough.
  2. **Gourmet Sauces**: San Marzano Marinara, Spicy Peri-Peri, Creamy Garlic Alfredo, Basil Pesto, Smoky BBQ.
  3. **Cheeses**: Fresh Buffalo Mozzarella, Sharp Wisconsin Cheddar, Smoked Gouda, Greek Feta, Vegan Mozzarella.
  4. **Garden Fresh Toppings (Multi-Select)**: Bell peppers, olives, mushrooms, jalapenos, sweet corn, paneer, and sun-dried tomatoes.
  5. **Dynamic Real-Time Pricing & Calorie Breakdown**: Updates dynamically before adding to cart.
- **Shopping Cart & Checkout**:
  - Dynamic subtotal, 5% GST calculation, and threshold-based free delivery.
  - **Chef Pizzo AI GPS Location Assistant**: Automatically detects user coordinates via browser geolocation with reverse geocoding into delivery address.
- **Razorpay Test Mode Checkout**: Seamless payment simulation with secure signature verification.
- **Real-Time WebSocket Order Tracking**:
  - Live progress stepper (*Order Received &rarr; In Kitchen &rarr; Out for Delivery &rarr; Delivered*).
  - Instant live synchronization across devices without manual page reloads.
- **Customer Authentication & Security**:
  - Secure JWT Bearer Token authentication with bcrypt password encryption.
  - Email verification tokens & password recovery flow.
  - User profile management, settings, order receipts, and notification preferences.

---

### 🎨 2. Dual-Atmosphere Visual Theme System
- **Dark Mode (100% Midnight Charcoal Atmosphere)**:
  - Deep `#070707` / `#0B0B0B` surfaces with subtle burgundy (`#4A0E17`) radial ambient glows.
  - Zero background doodles or distracting patterns.
  - High-contrast warm text hierarchy: Warm Ivory (`#FFF1D6`), Soft Champagne (`#F3DFC0`), Gold prices (`#FFC857`), and Tomato accents (`#FF7043`).
- **Light Mode ("Pizza World" Atmosphere)**:
  - Warm cream/ivory ambient background (`#FAF5EE`) with delicate artisanal pizza culinary doodles.
  - **Zero plain white cards**: Coordinated warm colored cards (Warm Cream `#FFF3DC`, Peach Cream `#FFE4C4`, Soft Terracotta `#F8D4C0`, Light Golden Cream `#FFF0C2`).

---

### 👨‍🍳 3. Chef Pizzo 3D AI Voice & Location Assistant
- **Interactive Character**: Animated 3D toy chef character with floating physics, status badge, and speech bubbles.
- **Speech Synthesis & Speech Recognition**:
  - Voice navigation commands (*"Show Veg Pizzas"*, *"Show Spicy Pizzas"*, *"Add Margherita"*, *"Show Cart"*, *"Checkout"*).
  - Live audio waveform feedback when listening.
- **Craving Quick-Tags**: Instant filter by craving tags (*"Cheese Burst"*, *"Spicy"*, *"Healthy"*, *"Under ₹400"*).

---

### 🛡️ 4. Admin & Kitchen Operations Portal
- **Strict Role-Based Access Control**: Dedicated `/admin/login` preventing standard users from accessing operational controls.
- **Executive KPI Dashboard**: Live aggregated statistics (Total Revenue, Orders, Active Kitchen Line, Delivery Dispatches, Low Stock count).
- **Live Kitchen Dispatch Board**: 1-click status transitions broadcasting instantly over WebSockets to customer tracking screens.
- **Live Inventory Control Table**:
  - Raw ingredient reserves management with stock increments, decrements, and custom low-stock threshold triggers.
  - **Transactional Decrements**: Stock is atomically deducted upon verified payment with rollbacks on failure.
  - **Automated APScheduler Inventory Monitor**: Background scheduler continuously monitors stock thresholds and sends SMTP email alerts when an ingredient is running low.

---

## 🏗️ Architecture Overview

```text
PizzaHub System
├── Frontend (React 18 + Vite + Tailwind CSS)
│   ├── Context API (AuthContext, CartContext, ThemeContext)
│   ├── Axios Interceptors (JWT Bearer Token injection & 401 handling)
│   ├── Voice Assistant Engine (Web Speech Recognition & Synthesis)
│   └── WebSocket Client (ws://localhost:8000/ws/orders/{id})
│
├── Backend (FastAPI + Python 3.10+)
│   ├── REST API Routers (/api/auth, /api/pizzas, /api/orders, /api/payments, /api/inventory, /api/admin)
│   ├── WebSockets (FastAPI ConnectionManager broadcasting to order rooms)
│   ├── Security (Passlib bcrypt password hashing + Python-JOSE JWT)
│   ├── Scheduler (APScheduler BackgroundScheduler monitoring stock thresholds)
│   └── Database Layer (SQLAlchemy ORM + PyMySQL / SQLite auto-fallback)
│
└── Database (Relational Schema)
    ├── users, admins, password_reset_tokens, email_verification_tokens
    ├── pizza_bases, sauces, cheeses, vegetables, pizzas
    └── orders, order_items, order_customizations, payments, inventory
```

---

## 📁 Repository Structure

```text
WebDev-L3-Task1-PizzaDelivery/
│
├── frontend/
│   ├── public/               # Static assets & Chef avatar
│   ├── src/
│   │   ├── components/       # Navbar, Footer, ChefPizzo, PizzaShapedCard, VoiceLocationAssistant
│   │   ├── context/          # AuthContext.jsx, CartContext.jsx, ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/        # AdminLogin, AdminDashboard, AdminOrders, AdminInventory
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── CustomPizzaBuilder.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── OrderTracking.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── VerifyEmail.jsx
│   │   ├── services/         # api.js Axios client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── auth/             # passwords.py, jwt.py, dependencies.py
│   │   ├── models/           # user.py, admin.py, pizza.py, order.py, payment.py, inventory.py
│   │   ├── schemas/          # Pydantic v2 schemas for all entities
│   │   ├── routers/          # auth.py, user.py, pizzas.py, orders.py, payments.py, inventory.py, admin.py
│   │   ├── services/         # email_service.py, inventory_service.py, order_service.py, payment_service.py
│   │   ├── websocket/        # connection_manager.py, ordertracking.py
│   │   ├── scheduler/        # inventory_scheduler.py
│   │   ├── database.py       # SQLAlchemy engine & session maker
│   │   ├── config.py         # Pydantic BaseSettings
│   │   └── main.py           # FastAPI app entrypoint & lifespan
│   ├── tests/                # test_api.py pytest suite
│   ├── requirements.txt
│   ├── seed.py               # Database populator & initial 25+ pizzas
│   └── .env.example
│
├── .gitignore
├── README.md
└── test_e2e_live.py
```

---

## ⚡ Quick Start & Run Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **MySQL Server** *(Optional: automatically uses SQLite database fallback if MySQL is not active)*

---

### 2. Backend Setup & Run

Open a terminal in `backend/`:

```bash
cd backend

# 1. Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux / macOS:
# source venv/bin/activate

# 2. Install dependencies (if needed)
pip install -r requirements.txt

# 3. Seed database with 25+ pizzas, ingredients & default admin
python seed.py

# 4. Run automated test suite
python -m pytest tests -v

# 5. Start the FastAPI backend server
uvicorn app.main:app --reload --port 8000
```

- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **Health Endpoint**: `http://localhost:8000/health`

---

### 3. Frontend Setup & Run

Open a second terminal in `frontend/`:

```bash
cd frontend

# 1. Install packages (if needed)
npm install

# 2. Launch Vite dev server
npm run dev
```

- **Frontend Application**: `http://localhost:5173`

---

## 🔑 Default Credentials for Evaluation

| Role | Portal URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `http://localhost:5173/admin/login` | `admin@pizzahub.com` | `admin123` |
| **Customer** | `http://localhost:5173/login` | `user@pizzahub.com` | `user123` |

---

## 🧪 End-to-End Testing Workflow

1. **Customer Order Flow**:
   - Open `http://localhost:5173`
   - Explore the **25+ Pizza Menu** or click **"Build Custom Pizza"**.
   - Speak to **Chef Pizzo** via the voice button or customize your dough, sauce, cheese, and toppings.
   - Go to Cart &rarr; use GPS location button &rarr; Click **"Pay with Razorpay Test Mode"** &rarr; Click **"Simulate Success"**.
   - You will be automatically redirected to the **Live Order Tracker** (`/track/{orderId}`).

2. **Admin Kitchen Dispatch Flow (Real-Time WebSocket Sync)**:
   - Open a second browser tab (or Incognito window) at `http://localhost:5173/admin/login`.
   - Login with `admin@pizzahub.com` / `admin123`.
   - Navigate to **"Manage Orders Board"** (`/admin/orders`).
   - Change the customer's order status to **"IN KITCHEN"** or **"SENT TO DELIVERY"**.
   - **Observe:** The customer's tracking stepper in the first tab updates **instantly in real time without page reload!**

3. **Inventory Management & Low Stock Notification**:
   - In the Admin portal, go to **"Live Inventory Table"** (`/admin/inventory`).
   - Adjust raw ingredient counts or thresholds.
   - Notice how items below their alert threshold trigger badges and trigger automated APScheduler background alerts.

---

## 🛡️ Business Rules Implemented
1. **Strict Role-Based Isolation**: Standard user accounts can never access admin panels or operations APIs.
2. **Transactional Inventory Decrement**: Stock is strictly deducted only upon verified payment inside an atomic database transaction.
3. **Zero Negative Stock**: Ingredients out of stock are automatically disabled in the custom builder.
4. **Real-Time WebSocket Broadcasting**: Order status updates broadcast live to specific order channels.
5. **Robust Password Encryption**: Passwords securely hashed with bcrypt; plain text passwords are never stored.

---

## 👨‍💻 Author & Submission
- **Internship**: Oasis Infobyte Full-Stack Web Development Internship (OIBSIP)
- **Task**: Level 3 - Task 1: Pizza Delivery & Inventory Management System
- **Technologies**: Python, FastAPI, MySQL / SQLite, SQLAlchemy ORM, React 18, Vite, Tailwind CSS, WebSockets, Razorpay Test SDK, APScheduler, Web Speech API.
