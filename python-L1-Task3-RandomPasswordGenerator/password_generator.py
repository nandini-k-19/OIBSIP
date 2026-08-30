import tkinter as tk
from tkinter import ttk
import secrets
import string

# ============================================================
# SECUREPASS — Professional Random Password Generator
# ============================================================

password_history = []

# --------------------------- Theme ---------------------------
BG = "#766DAC"         
CARD = "#C3B3E2"
PRIMARY = "#180376"     
PRIMARY_HOVER = "#140650"
SECONDARY = "#291FB3"   
ACCENT = "#FF6B6B"     
TEXT = "#202033"
MUTED = "#050223"
BORDER = "#CCC4E3"
INPUT_BG = "#F1EEFF"
DANGER = "#E5484D"
WARNING = "#D97706"
SUCCESS = "#138A5B"

# ------------------------ Main window -----------------------
root = tk.Tk()
root.title("SecurePass | Random Password Generator")
root.geometry("760x760")
root.minsize(680, 700)
root.configure(bg=BG)

# ------------------------ ttk styles ------------------------
style = ttk.Style()
style.theme_use("clam")
style.configure(
    "Strength.Horizontal.TProgressbar",
    troughcolor="#E9E5F7",
    background=SECONDARY,
    bordercolor="#E9E5F7",
    lightcolor=SECONDARY,
    darkcolor=SECONDARY,
    thickness=9,
)

# ------------------------ Helpers ----------------------------
def show_message(text, color=MUTED):
    result_label.config(text=text, fg=color)

def check_password_strength(password):
    score = 0
    if len(password) >= 8:
        score += 1
    if len(password) >= 12:
        score += 1
    if any(c.isupper() for c in password):
        score += 1
    if any(c.islower() for c in password):
        score += 1
    if any(c.isdigit() for c in password):
        score += 1
    if any(not c.isalnum() for c in password):
        score += 1

    if score <= 2:
        return "WEAK", 30, DANGER
    elif score <= 4:
        return "MEDIUM", 65, WARNING
    return "STRONG", 100, SUCCESS

def update_strength(password):
    if not password:
        strength_label.config(text="Password strength  •  —", fg=MUTED)
        strength_bar["value"] = 0
        return

    strength, value, color = check_password_strength(password)
    strength_label.config(text=f"Password strength  •  {strength}", fg=color)
    strength_bar["value"] = value

def copy_password():
    password = password_entry.get()
    if not password:
        show_message("Generate a password first.", WARNING)
        return

    root.clipboard_clear()
    root.clipboard_append(password)
    root.update()
    show_message("✓ Password copied to clipboard!", SUCCESS)

def toggle_password():
    if password_entry.cget("show") == "":
        password_entry.config(show="•")
        visibility_button.config(text="Show")
    else:
        password_entry.config(show="")
        visibility_button.config(text="Hide")

def clear_history():
    password_history.clear()
    history_listbox.delete(0, tk.END)
    show_message("✓ Password history cleared.", SECONDARY)

def generate_password():
    try:
        length = int(length_var.get())
    except (ValueError, TypeError):
        show_message("Please enter a valid password length.", DANGER)
        return

    if not 8 <= length <= 32:
        show_message("Password length must be between 8 and 32.", DANGER)
        return

    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    numbers = string.digits
    symbols = "!@#$%^&*()_+?><:"

    ambiguous = "0Oo1lI"

    if exclude_ambiguous_var.get():
        uppercase = "".join(c for c in uppercase if c not in ambiguous)
        lowercase = "".join(c for c in lowercase if c not in ambiguous)
        numbers = "".join(c for c in numbers if c not in ambiguous)

    selected_sets = []
    if uppercase_var.get():
        selected_sets.append(uppercase)
    if lowercase_var.get():
        selected_sets.append(lowercase)
    if numbers_var.get():
        selected_sets.append(numbers)
    if symbols_var.get():
        selected_sets.append(symbols)

    if len(selected_sets) < 2:
        show_message("Select at least 2 character types.", DANGER)
        return

    if not all(selected_sets):
        show_message("A selected character type is unavailable.", DANGER)
        return

    # Guarantee one character from every selected category.
    characters = [secrets.choice(chars) for chars in selected_sets]

    all_characters = "".join(selected_sets)
    for _ in range(length - len(characters)):
        characters.append(secrets.choice(all_characters))

    # Securely shuffle the final password.
    secrets.SystemRandom().shuffle(characters)
    password = "".join(characters)

    # Store only the latest five passwords for this session.
    password_history.insert(0, password)
    if len(password_history) > 5:
        password_history.pop()

    history_listbox.delete(0, tk.END)
    for item in password_history:
        history_listbox.insert(tk.END, item)

    password_entry.config(show="")
    visibility_button.config(text="Hide")
    password_entry.delete(0, tk.END)
    password_entry.insert(0, password)

    strength, _, color = check_password_strength(password)
    update_strength(password)
    show_message(f"✓ {strength.title()} password generated successfully.", color)

# ============================================================
# HEADER
# ============================================================
header = tk.Frame(root, bg=BG)
header.pack(fill="x", padx=34, pady=(18, 8))

title_row = tk.Frame(header, bg=BG)
title_row.pack()

tk.Label(
    title_row,
    text="🔐",
    font=("Arial", 25),
    bg=BG,
    fg=PRIMARY
).pack(side="left", padx=(0, 8))

tk.Label(
    title_row,
    text="SECUREPASS",
    font=("Arial", 24, "bold"),
    bg=BG,
    fg=TEXT
).pack(side="left")

tk.Label(
    header,
    text="Strong passwords. Simple control. Secure generation.",
    font=("Arial", 10),
    bg=BG,
    fg=MUTED
).pack(pady=(2, 0))

# ============================================================
# MAIN CONTENT — compact card so the complete app fits
# ============================================================
main_card = tk.Frame(
    root,
    bg=CARD,
    highlightbackground=BORDER,
    highlightthickness=1
)
main_card.pack(fill="both", expand=True, padx=34, pady=8)

# ---------------------- Settings title ----------------------
tk.Label(
    main_card,
    text="PASSWORD SETTINGS",
    font=("Arial", 10, "bold"),
    bg=CARD,
    fg=PRIMARY
).pack(anchor="w", padx=24, pady=(15, 7))

# ---------------------- Length row --------------------------
length_row = tk.Frame(main_card, bg=CARD)
length_row.pack(fill="x", padx=24)

tk.Label(
    length_row,
    text="Password length",
    font=("Arial", 11, "bold"),
    bg=CARD,
    fg=TEXT
).pack(side="left")

tk.Label(
    length_row,
    text="(8–32 characters)",
    font=("Arial", 9),
    bg=CARD,
    fg=MUTED
).pack(side="left", padx=8)

length_var = tk.IntVar(value=16)

length_spinbox = tk.Spinbox(
    length_row,
    from_=8,
    to=32,
    textvariable=length_var,
    width=4,
    justify="center",
    font=("Arial", 11, "bold"),
    bg=INPUT_BG,
    fg=TEXT,
    buttonbackground=INPUT_BG,
    relief="flat",
    bd=0
)
length_spinbox.pack(side="right", ipady=4)

# ---------------------- Character types ---------------------
tk.Label(
    main_card,
    text="Character types",
    font=("Arial", 11, "bold"),
    bg=CARD,
    fg=TEXT
).pack(anchor="w", padx=24, pady=(12, 6))

uppercase_var = tk.BooleanVar(value=True)
lowercase_var = tk.BooleanVar(value=True)
numbers_var = tk.BooleanVar(value=True)
symbols_var = tk.BooleanVar(value=True)
exclude_ambiguous_var = tk.BooleanVar(value=False)

options_frame = tk.Frame(main_card, bg=CARD)
options_frame.pack(fill="x", padx=20)

def make_check(parent, text, variable):
    return tk.Checkbutton(
        parent,
        text=text,
        variable=variable,
        font=("Arial", 9),
        bg="#F5F2FF",
        fg=TEXT,
        selectcolor="#DCD4FF",
        activebackground="#F5F2FF",
        activeforeground=TEXT,
        highlightthickness=0,
        bd=0,
        anchor="w",
        padx=9,
        pady=6
    )

items = [
    ("Uppercase  A–Z", uppercase_var),
    ("Lowercase  a–z", lowercase_var),
    ("Numbers  0–9", numbers_var),
    ("Symbols  !@#$", symbols_var),
]

for i, (text, variable) in enumerate(items):
    make_check(options_frame, text, variable).grid(
        row=i // 2, column=i % 2, sticky="ew", padx=4, pady=3
    )

options_frame.columnconfigure(0, weight=1)
options_frame.columnconfigure(1, weight=1)

make_check(
    main_card,
    "Exclude confusing characters  (0, O, o, 1, l, I)",
    exclude_ambiguous_var
).pack(fill="x", padx=24, pady=(3, 9))

# ============================================================
# PASSWORD DISPLAY
# ============================================================
display_card = tk.Frame(
    root,
    bg=CARD,
    highlightbackground=BORDER,
    highlightthickness=1
)
display_card.pack(fill="x", padx=34, pady=8)

tk.Label(
    display_card,
    text="YOUR SECURE PASSWORD",
    font=("Arial", 10, "bold"),
    bg=CARD,
    fg=SECONDARY
).pack(anchor="w", padx=24, pady=(13, 6))

password_row = tk.Frame(display_card, bg=CARD)
password_row.pack(fill="x", padx=24)

password_entry = tk.Entry(
    password_row,
    font=("Consolas", 15, "bold"),
    justify="center",
    bg="#F5F3FA",
    fg=TEXT,
    insertbackground=TEXT,
    selectbackground="#CFC5FF",
    selectforeground=TEXT,
    relief="flat",
    bd=0
)
password_entry.pack(side="left", fill="x", expand=True, ipady=9)

visibility_button = tk.Button(
    password_row,
    text="Hide",
    command=toggle_password,
    font=("Arial", 9, "bold"),
    bg="#E9E4FF",
    fg=PRIMARY,
    activebackground="#D9D0FF",
    activeforeground=PRIMARY_HOVER,
    relief="flat",
    bd=0,
    cursor="hand2",
    padx=12,
    pady=7
)
visibility_button.pack(side="right", padx=(7, 0))

strength_label = tk.Label(
    display_card,
    text="Password strength  •  —",
    font=("Arial", 9, "bold"),
    bg=CARD,
    fg=MUTED
)
strength_label.pack(anchor="w", padx=24, pady=(10, 4))

strength_bar = ttk.Progressbar(
    display_card,
    style="Strength.Horizontal.TProgressbar",
    maximum=100,
    value=0
)
strength_bar.pack(fill="x", padx=24)

result_label = tk.Label(
    display_card,
    text="Choose your settings and generate a password.",
    font=("Arial", 9),
    bg=CARD,
    fg=MUTED
)
result_label.pack(anchor="w", padx=24, pady=(5, 12))

# ============================================================
# ACTION BUTTONS
# ============================================================
button_frame = tk.Frame(root, bg=BG)
button_frame.pack(fill="x", padx=34, pady=5)

generate_button = tk.Button(
    button_frame,
    text="⚡  GENERATE PASSWORD",
    command=generate_password,
    font=("Arial", 10, "bold"),
    bg=PRIMARY,
    fg="white",
    activebackground=PRIMARY_HOVER,
    activeforeground="white",
    relief="flat",
    bd=0,
    cursor="hand2",
    pady=10
)
generate_button.pack(side="left", fill="x", expand=True, padx=(0, 5))

copy_button = tk.Button(
    button_frame,
    text="📋  COPY",
    command=copy_password,
    font=("Arial", 10, "bold"),
    bg=ACCENT,
    fg="white",
    activebackground="#E14F4F",
    activeforeground="white",
    relief="flat",
    bd=0,
    cursor="hand2",
    padx=18,
    pady=10
)
copy_button.pack(side="right", padx=(5, 0))

# ============================================================
# HISTORY — always visible
# ============================================================
history_card = tk.Frame(
    root,
    bg=CARD,
    highlightbackground=BORDER,
    highlightthickness=1
)
history_card.pack(fill="x", padx=34, pady=(5, 7))

history_header = tk.Frame(history_card, bg=CARD)
history_header.pack(fill="x", padx=24, pady=(9, 5))

tk.Label(
    history_header,
    text="RECENT PASSWORDS",
    font=("Arial", 9, "bold"),
    bg=CARD,
    fg=SECONDARY
).pack(side="left")

tk.Button(
    history_header,
    text="Clear",
    command=clear_history,
    font=("Arial", 8, "bold"),
    bg="#F1EEFF",
    fg=PRIMARY,
    activebackground="#E3DDFF",
    activeforeground=PRIMARY_HOVER,
    relief="flat",
    bd=0,
    cursor="hand2",
    padx=10,
    pady=3
).pack(side="right")

history_listbox = tk.Listbox(
    history_card,
    height=3,
    font=("Consolas", 9),
    bg="#F8F7FC",
    fg=TEXT,
    selectbackground="#DCD4FF",
    selectforeground=TEXT,
    relief="flat",
    bd=0,
    highlightthickness=0
)
history_listbox.pack(fill="x", padx=24, pady=(0, 9))

# --------------------------- Footer --------------------------
tk.Label(
    root,
    text="🔒 Secure generation powered by Python secrets",
    font=("Arial", 8),
    bg=BG,
    fg=MUTED
).pack(pady=(0, 7))

root.mainloop()
