import tkinter as tk
import secrets
import string

# =================== password history ====================
password_history = []

# =================== Create main window ==================
root = tk.Tk()
root.title("🔐 Random Password Generator")
root.geometry("600x1050")
root.configure(bg="white")
root.resizable(False, False)

# ========================  Title  =========================
title_label = tk.Label(
    root,
    text="🔐 Password Generator",
    font=("Arial", 24, "bold"),
    bg = "white"
)
title_label.pack(pady=(25,5))

# ========================== Subtitle =====================
subtitle_label = tk.Label(
    root,
    text="Create a strong and secure password",
    font=("Arial", 11),
    bg = "white",
    activebackground="white"
)
subtitle_label.pack(pady=(0,20))

# ========================= Password length  ====================
length_label = tk.Label(
    root,
    text="Length of password",
    font=("Arial", 11, "bold"),
    bg = "white",
    activebackground="white"
)
length_label.pack()
length_var = tk.IntVar(value=12)
length_spinbox = tk.Spinbox(
    root,
    from_=8,
    to=32,
    textvariable=length_var,
    width=10,
    font=("Arial", 11),
    bg="white",
    activebackground="white"
)
length_spinbox.pack(pady=10)
# ======================== character types =====================
options_label = tk.Label(
    root,
    text="Select Character Types",
    font=("Arial", 12, "bold"),
    bg="white",
    activebackground="white"
)
options_label.pack(pady=(15,5))
# ========================  variables for checkboxes =================
uppercase_var = tk.BooleanVar(value=True)
lowercase_var = tk.BooleanVar(value=True)
numbers_var = tk.BooleanVar(value=True)
symbols_var = tk.BooleanVar(value=True)
exclude_ambiguous_var = tk.BooleanVar(value=False)

# ======================= uppercase checkbox ======================
uppercase_check = tk.Checkbutton(
    root,
    text="Uppercase letters (A-Z)",
    variable=uppercase_var,
    font=("Arial", 11),
    activebackground="white"
)
uppercase_check.pack(anchor="w",padx=150)

# ========================= lowercase checkbox ======================
lowercase_check = tk.Checkbutton(
    root,
    text="Lowercase letters (a-z)",
    variable=lowercase_var,
    font=("Arial", 11),
    activebackground="white"
)
lowercase_check.pack(anchor="w",padx=150)

# ============================= numbers checkbox =====================
numbers_check = tk.Checkbutton(
    root,
    text="Numbers(0-9)",
    variable=numbers_var,
    font=("Arial", 11),
    activebackground="white"
)
numbers_check.pack(anchor="w",padx=150)
# ============================== symbols checkbox ======================
symbols_check = tk.Checkbutton(
    root,
    text="Symbols (!@#$)",
    variable=symbols_var,
    font=("Arial", 11),
    activebackground="white"
)
symbols_check.pack(anchor="w",padx=150)
# ===================== Exclude ambiguous characters checkbox =====================
ambiguous_check = tk.Checkbutton(
    root,
    text="Exclude confusing characters",
    variable=exclude_ambiguous_var,
    font=("Arial", 10),
    activebackground="white"
)
ambiguous_check.pack(anchor="w", padx=150, pady=(5,0))
# ======================== password display ======================
password_label = tk.Label(
    root,
    text="Generated Password",
    font=("Arial", 12, "bold"),
    bg="white",
    activebackground="white"
)
password_label.pack(pady=(25,5))

password_entry = tk.Entry(
    root,
    width=38,
    font=("Arial", 14,"bold"),
    justify="center",
    relief="solid",
    bd=1
)
password_entry.pack(pady=5)
# =============================== result message  ======================
result_label = tk.Label(
    root,
    text="",
    font=("Arial", 10),
    bg="white",
    activebackground="white"
)
result_label.pack(pady=5)
# ================================== password strength  =======================
strength_label = tk.Label(
    root,
    text="Password Strength: -",
    font=("Arial", 12, "bold"),
    bg="white",
    activebackground="white"
)
strength_label.pack(pady=5)

# ================= check password strength  ======================
def check_password_strength(password):
    score = 0
    #  =============  Check password length  ======================
    if len(password) >= 8:
        score += 1
    if len(password) >= 12:
        score += 1
    # ====================  Check uppercase ==========================
    if any(char.isupper() for char in password):
        score += 1
    # ====================== Check lowercase ========================
    if any(char.islower() for char in password):
        score += 1
    # ===================== Check numbers ========================
    if any(char.isdigit() for char in password):
        score += 1
    # ====================== Check symbols  =======================
    if any(not char.isalnum() for char in password):
        score += 1
    # ====================== Return strength  =====================
    if score <= 2:
        return "Weak"
    elif score <= 4:
        return "Medium"
    else:
        return "Strong"
# ========================== copy password  ===========================
def copy_password():
    password = password_entry.get()
    if password:
        root.clipboard_clear()
        root.clipboard_append(password)
        root.update()
        result_label.config(
            text="✅ Password copied to clipboard!"
        )
    else:
        result_label.config(
            text="❌ Generate a password first!"
        )
#  =================== password generator  ===================
def generate_password():
    try:
        length = int(length_var.get())
    except ValueError:
        result_label.config(
            text="❌ Please enter a valid password length!"
        )
        return
    if length < 8 or length > 32:
        result_label.config(
            text="❌ Password length must be between 8 and 32!"
        )
        return
    #  ================= character sets  =======================
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    numbers = string.digits
    symbols = "!@#$%^&*()_+?><:"

    # ===================== Ambiguous characters ===================
    ambiguous_characters = "0Oo1lI"

    # ============== remove ambiguous characters if selected ==============
    if exclude_ambiguous_var.get():
        uppercase = "".join(
            char for char in uppercase
            if char not in ambiguous_characters
        )

        lowercase = "".join(
            char for char in lowercase
            if char not in ambiguous_characters
        )

        numbers = "".join(
            char for char in numbers
            if char not in ambiguous_characters
        )


    selected_sets = []

    if uppercase_var.get():
        selected_sets.append(uppercase)
    if lowercase_var.get():
        selected_sets.append(lowercase)
    if numbers_var.get():
        selected_sets.append(numbers)
    if symbols_var.get():
        selected_sets.append(symbols)

    # ======================== check at least two character types  ====================
    if len(selected_sets) < 2:
        result_label.config(
            text="❌ Select at least 2 character types!"
        )
        password_entry.delete(0, tk.END)
        return
    # ============= make sure selected sets are not empty  ===========================
    if not all(selected_sets):
        result_label.config(
            text="❌ Selected character type is unavailable!"
        )
        return
    # =============== make sure each selected type appears at least once =============
    password_characters = []
    for character_set in selected_sets:
        password_characters.append(
            secrets.choice(character_set)
        )
    # ============= combine all selected character sets =====================
    all_characters = "".join(selected_sets)
    # ========= fill the remaining password length ===========================
    remaining = length - len(password_characters)

    for _ in range(remaining):
        password_characters.append(
            secrets.choice(all_characters)
        )
    # =========== securely shuffle the password  ===========================
    secrets.SystemRandom().shuffle(password_characters)
    # ============ convert list to string =========================
    password = "".join(password_characters)
    # ============ add password to history  ============================
    password_history.insert(0, password)
    #  ============ keep only the last 5 passwords  ======================
    if len(password_history) > 5:
        password_history.pop()
    history_listbox.delete(0, tk.END)
    for password_item in password_history:
        history_listbox.insert(tk.END, password_item)

    # ==================== display password  ===============================
    password_entry.delete(0, tk.END)
    password_entry.insert(0, password)
    # ========================  check password strength ============================
    strength = check_password_strength(password)
    strength_label.config(
        text=f"Password strength: {strength}"
    )
    result_label.config(
        text=f"✅ {strength} Password generated!",
    )

# ============================== Generate button  ===================
generate_button = tk.Button(
    root,
    text="🔐 Generate Password",
    command=generate_password,
    font=("Arial", 12, "bold"),
    padx=20,
    pady=10,
    cursor="hand2"
)
generate_button.pack(pady=20)
#  =================================  copy button  ======================
copy_button = tk.Button(
    root,
    text="📋 Copy Password",
    command=copy_password,
    font=("Arial", 12, "bold"),
    padx=20,
    pady=8,
    cursor="hand2"
)
copy_button.pack(pady=5)

# ======================== password history  =====================
history_label = tk.Label(
    root,
    text="Recent Passwords",
    font=("Arial", 12, "bold"),
)
history_label.pack(pady=(15,5))

history_listbox = tk.Listbox(
    root,
    width=50,
    height=5,
    font=("Arial", 12, "bold"),
)
history_listbox.pack(pady=5)

# ================================ run application ======================
root.mainloop()