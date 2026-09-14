# 🚀 Oasis Infobyte Internship (OIBSIP) — Project Showcase

Welcome to the **Oasis Infobyte Internship (OIBSIP)** portfolio repository by **Komala Nandini** ([@nandini-k-19](https://github.com/nandini-k-19)). This monorepo houses full-stack web applications and Python software engineering projects developed across multiple internship tracks and levels.

---

## 📑 Portfolio Index & Projects Overview

| Track | Level & Task | Project Name | Tech Stack | Status | Directory Link |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Web Development** | **Level 3 - Task 1** | **PizzaHub – Artisanal Pizza Delivery & Real-Time Inventory System** | `FastAPI`, `React 18`, `Vite`, `Tailwind CSS`, `WebSockets`, `MySQL / SQLite`, `Razorpay Test Mode`, `APScheduler` | ✅ **Completed** | [📂 WebDev-L3-Task1-PizzaDelivery](./WebDev-L3-Task1-PizzaDelivery) |
| **Python Development** | **Level 1 - Task 2** | **BMI Health & Fitness Calculator** | `Python 3`, `Tkinter`, `CustomTkinter`, `SQLite3`, `Matplotlib` | ✅ **Completed** | [📂 python-L1-Task2-BMI Calculator](./python-L1-Task2-BMI%20Calculator) |
| **Python Development** | **Level 1 - Task 3** | **Random Password Generator GUI** | `Python 3`, `Tkinter`, `Secrets`, `Pyperclip` | ✅ **Completed** | [📂 python-L1-Task3-RandomPasswordGenerator](./python-L1-Task3-RandomPasswordGenerator) |
| **Python Development** | **Level 1 - Task 4** | **Basic Real-Time Weather Application** | `Python 3`, `Tkinter`, `Requests`, `OpenWeatherMap API` | ✅ **Completed** | [📂 python-L1-Task4-BasicWeatherApp](./python-L1-Task4-BasicWeatherApp) |

---

## 🍕 Highlight Project: Web Development — Level 3 Task 1

### **PizzaHub – Full-Stack Pizza Delivery & Inventory Management System**
> *A production-grade, enterprise-ready full-stack web application with real-time WebSocket dispatch, dual-mode atmospheric themes, interactive 3D Chef Voice Assistant, and transactional kitchen stock management.*

- **Key Highlights**:
  - **25+ Handcrafted Pizza Varieties**: 5 distinct gourmet categories with high-res imagery, dietary tags, and search.
  - **5-Step Custom Pizza Builder**: Choose dough, gourmet sauces, cheeses, and garden veggies with real-time pricing and nutrition feedback.
  - **Chef Pizzo 3D AI Voice Assistant**: Animated 3D chef avatar with Web Speech synthesis, voice command recognition, and craving tags.
  - **Automated GPS Location Detection**: Live coordinate reverse geocoding into customer delivery address.
  - **Dual-Atmosphere Theme System**:
    - **Dark Mode (100% Midnight Charcoal)**: Pure dark `#070707` surfaces, subtle burgundy radial glow, high-contrast warm text (`#FFF1D6` headings, `#FFC857` gold prices).
    - **Light Mode ("Pizza World")**: Warm cream background (`#FAF5EE`) with delicate culinary doodles and non-white cards (`#FFF3DC`, `#FFE4C4`).
  - **Real-Time WebSocket Order Tracking**: Instant 4-stage kitchen order stepper with no page reloads.
  - **Admin Operations Portal**: Executive KPI Dashboard, live order dispatch board, raw inventory controls with atomic transaction decrements, and automated APScheduler low-stock email alerts.
- **Detailed Documentation**: [Read Full PizzaHub README & Setup Guide](./WebDev-L3-Task1-PizzaDelivery/README.md)

---

## 🐍 Python Development Projects

### 1. [BMI Health & Fitness Tracker](./python-L1-Task2-BMI%20Calculator)
- **Level 1 — Task 2**
- **Features**: Real-time BMI calculation, WHO category classification, user profile tracking, SQLite health history storage, and embedded Matplotlib historical progress graphs.

### 2. [Random Password Generator GUI](./python-L1-Task3-RandomPasswordGenerator)
- **Level 1 — Task 3**
- **Features**: Cryptographically secure randomized passwords, customizable character sets (uppercase, lowercase, numbers, symbols), visual strength meter, and 1-click clipboard copy.

### 3. [Basic Real-Time Weather App](./python-L1-Task4-BasicWeatherApp)
- **Level 1 — Task 4**
- **Features**: Live city search with OpenWeatherMap API integration, real-time temperature, humidity, wind speed, pressure, and weather condition badges.

---

## 🛠️ Repository Quick Setup

### Clone the Repository
```bash
git clone https://github.com/nandini-k-19/OIBSIP.git
cd OIBSIP
```

### Running PizzaHub (WebDev L3 Task 1)
```bash
# 1. Backend (FastAPI)
cd WebDev-L3-Task1-PizzaDelivery/backend
python -m venv venv
venv\Scripts\activate       # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000

# 2. Frontend (React + Vite)
cd ../frontend
npm install
npm run dev
```

---

## 👩‍💻 Author & Intern Information
- **Intern Name**: Komala Nandini
- **GitHub Profile**: [@nandini-k-19](https://github.com/nandini-k-19)
- **Repository**: [https://github.com/nandini-k-19/OIBSIP](https://github.com/nandini-k-19/OIBSIP)
- **Internship Track**: Oasis Infobyte Full-Stack Web Development & Python Development Internship (OIBSIP)

---
*Developed with ❤️ as part of the Oasis Infobyte Virtual Internship Program.*
