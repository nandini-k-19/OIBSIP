# 🔐 SecurePass — Professional Random Password Generator

[![Python Version](https://img.shields.io/badge/python-3.7%2B-blue.svg)](https://www.python.org/)
[![GUI](https://img.shields.io/badge/GUI-Tkinter-purple.svg)](https://docs.python.org/3/library/tkinter.html)
[![Security](https://img.shields.io/badge/Security-CSPRNG%20(secrets)-success.svg)](https://docs.python.org/3/library/secrets.html)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#license)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#prerequisites)

**SecurePass** is a feature-rich, cryptographically secure desktop application built with Python and Tkinter. Designed with both security and usability in mind, SecurePass allows users to generate strong, highly customizable passwords, evaluate password entropy in real-time, manage recent session history, and safely copy credentials to the clipboard.

---

## 🌟 Key Features

### 🛡️ Cryptographic Security
* **CSPRNG Powered**: Uses Python's standard `secrets` module (`SystemRandom`), generating non-deterministic, cryptographically strong random data suitable for security-sensitive applications.
* **Guaranteed Character Inclusion**: Ensures at least one character from every selected category is included before applying a secure cryptographic shuffle.
* **Homoglyph / Ambiguous Character Filter**: Option to filter out visually confusing characters (`0`, `O`, `o`, `1`, `l`, `I`) to prevent misread passwords.

### ⚙️ Full Customization
* **Flexible Password Length**: Adjust length from 8 to 32 characters (default 16).
* **Character Set Selectors**: Toggle Uppercase (`A-Z`), Lowercase (`a-z`), Numbers (`0-9`), and Special Symbols (`!@#$%^&*()_+?><:`).
* **Validation Controls**: Ensures minimum complexity standards (requires at least 2 character types).

### 📊 Real-Time Strength Meter
* Dynamic password strength scoring (Weak, Medium, Strong) powered by length and character diversity heuristics.
* Styled progress bar with color-coded feedback (`Danger Red`, `Warning Yellow`, `Success Green`).

### 🎨 Modern & Responsive GUI
* Beautiful pastel-purple theme with card-based layout structure.
* Mask/Unmask visibility toggle (`•` or plain text).
* One-click **Copy to Clipboard** with visual confirmation status.
* Session history tracking (stores the last 5 generated passwords with a quick-clear option).
* **100% Offline & Private**: Zero network requests or external data collection.

---

## 🛠️ Tech Stack & Dependencies

* **Language**: Python 3.7+
* **GUI Engine**: Tkinter & `ttk` (built into Python standard library)
* **Randomness Engine**: `secrets` (Cryptographically Secure Pseudo-Random Number Generator)
* **String Utilities**: `string`

> [!NOTE]
> No external third-party `pip` packages are required! SecurePass relies exclusively on Python standard library modules.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Python 3.7 or higher installed on your system.

* **Windows / macOS**: Python usually comes with Tkinter out of the box. You can check your version by running:
  ```bash
  python --version
  ```
* **Linux (Ubuntu/Debian)**: Tkinter may need to be installed separately via your package manager:
  ```bash
  sudo apt-get update
  sudo apt-get install python3-tkinter
  ```

### Installation & Execution

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/nandini-k-19/python-L1-Task3-RandomPasswordGenerator.git
   cd python-L1-Task3-RandomPasswordGenerator
   ```

2. **Run the Application**:
   ```bash
   python password_generator.py
   ```
   *(Or `python3 password_generator.py` depending on your OS alias)*

---

## 📖 How to Use

1. **Configure Parameters**:
   * Set your desired password length (8–32 characters).
   * Check or uncheck desired character types (Uppercase, Lowercase, Numbers, Symbols).
   * Enable *Exclude confusing characters* if you want to avoid characters like `0`, `O`, `1`, `l`.
2. **Generate Password**:
   * Click **⚡ GENERATE PASSWORD**.
   * View the generated result and real-time strength bar.
3. **Copy or Toggle View**:
   * Click **Hide / Show** to mask or reveal the password.
   * Click **📋 COPY** to copy the generated password directly to your clipboard.
4. **Session History**:
   * Review your 5 most recent generated passwords in the **RECENT PASSWORDS** box.
   * Click **Clear** anytime to flush session history.

---

## 📐 Password Strength Assessment Logic

SecurePass evaluates passwords against a 6-point criteria matrix:

| Criteria | Condition | Points |
| :--- | :--- | :---: |
| **Minimum Length** | Length ≥ 8 characters | +1 |
| **Optimal Length** | Length ≥ 12 characters | +1 |
| **Uppercase Presence** | Contains at least 1 uppercase letter (`A-Z`) | +1 |
| **Lowercase Presence** | Contains at least 1 lowercase letter (`a-z`) | +1 |
| **Numeric Presence** | Contains at least 1 number (`0-9`) | +1 |
| **Symbolic Presence** | Contains at least 1 symbol (`!@#$%...`) | +1 |

### Rating Matrix
* **WEAK** (Score 0–2): Displays red indicator.
* **MEDIUM** (Score 3–4): Displays orange/yellow indicator.
* **STRONG** (Score 5–6): Displays green indicator.

---

## 📁 Project Structure

```text
python-L1-Task3-RandomPasswordGenerator/
├── password_generator.py   # Main application source code (Tkinter GUI & Logic)
└── README.md               # Project documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/nandini-k-19/python-L1-Task3-RandomPasswordGenerator/issues).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
