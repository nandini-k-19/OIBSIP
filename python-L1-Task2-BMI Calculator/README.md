# 💜 BMI Health Tracker

A professional desktop-based **BMI Health Tracker** built with Python and Tkinter.

The application allows users to calculate BMI, store health records locally, view history, update or delete records, search records, and visualize BMI progress over time.

---

## 📌 Project Overview

The **BMI Health Tracker** is designed as a simple and user-friendly health tracking application.

It combines a graphical user interface with a local SQLite database to provide persistent BMI record management.

The project demonstrates practical implementation of:

- Python programming
- GUI development
- Database integration
- CRUD operations
- Input validation
- Data visualization
- Error handling

---

## ✨ Features

### 🧮 BMI Calculation

- Accepts user's name, weight, and height.
- Calculates BMI using the standard formula.
- Displays BMI up to two decimal places.
- Automatically determines the BMI category.

### 📊 BMI Categories

| BMI Range | Category |
|---|---|
| Below 18.5 | Underweight |
| 18.5 – 24.99 | Normal |
| 25 – 29.99 | Overweight |
| 30 and above | Obese |

### 💾 Database Management

The application uses **SQLite** to store BMI records locally.

Each record contains:

- User name
- Weight
- Height
- BMI
- Category
- Date and time

### 📋 BMI History

Users can:

- View previous BMI records
- Search records by user name
- View records in a structured table
- See automatically generated serial numbers

### ✏️ Update Records

Users can select an existing BMI record and update:

- Weight
- Height

The BMI and category are automatically recalculated after updating.

### 🗑️ Delete Records

Users can select a record and permanently delete it after confirmation.

### 📈 Progress Tracking

The application provides a BMI progress graph using **Matplotlib**, allowing users to visualize BMI measurements over time.

### 🛡️ Input Validation

The application validates:

- Empty names
- Invalid numeric values
- Zero or negative weight
- Zero or negative height

Clear warning and error messages are displayed when invalid data is entered.

### 🎨 Professional UI

The application includes:

- Colorful modern interface
- Card-based layout
- Consistent typography
- User-friendly buttons
- Clear result display
- Visual feedback

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| Tkinter | Graphical User Interface |
| SQLite | Local database |
| Matplotlib | BMI progress visualization |
| Git | Version control |
| GitHub | Source code hosting |

---

## 🧠 BMI Formula

The application calculates BMI using:

```text
BMI = Weight (kg) / Height² (m²)