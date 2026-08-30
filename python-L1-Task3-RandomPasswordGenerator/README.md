# 🔐 Random Password Generator

A secure, colourful, and user-friendly random password generator built with Python and Tkinter.

## ✨ Features

- 🔐 Generate secure random passwords
- 📏 Choose password length from 8 to 32 characters
- 🔤 Select uppercase letters
- 🔡 Select lowercase letters
- 🔢 Select numbers
- 🔣 Select symbols
- 🚫 Exclude confusing characters
- 📊 Check password strength with a visual indicator
- 👁️ Show / hide generated password
- 📋 Copy password to clipboard
- 🕘 Display the last 5 generated passwords
- 🧹 Clear password history
- ✅ Input validation
- 🎨 Professional graphical user interface

## 🛠️ Technologies Used

- Python
- Tkinter
- secrets
- string
- ttk

## 🔒 Security

The application uses Python's `secrets` module for secure password generation.

It also ensures that at least one character from each selected character type is included in the generated password.

## ▶️ How to Run

1. Install Python.
2. Download or clone this repository.
3. Open the project folder.
4. Run:

```bash
python password_generator.py
