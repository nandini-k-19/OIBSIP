import tkinter as tk
from tkinter import messagebox, ttk
import sqlite3
from datetime import datetime

from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg


# ============================================================
# APPLICATION COLORS
# ============================================================

BG_COLOR = "#F5F0FF"
HEADER_COLOR = "#6C3FC7"
HEADER_DARK = "#4B2690"

CARD_COLOR = "#FFFFFF"
TEXT_COLOR = "#2D2342"
SECONDARY_TEXT = "#7A7189"

INPUT_BG = "#FAF8FF"

BUTTON_COLOR = "#7B4DCC"
BUTTON_HOVER = "#6435B0"

SUCCESS_COLOR = "#27AE60"
WARNING_COLOR = "#F39C12"
DANGER_COLOR = "#E74C3C"
INFO_COLOR = "#3498DB"


# ============================================================
# DATABASE
# ============================================================

DATABASE_NAME = "bmi_tracker.db"


def create_database():
    """Create the SQLite database and BMI records table."""

    try:
        connection = sqlite3.connect(DATABASE_NAME)
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bmi_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_name TEXT NOT NULL,
                weight REAL NOT NULL,
                height REAL NOT NULL,
                bmi REAL NOT NULL,
                category TEXT NOT NULL,
                date_time TEXT NOT NULL
            )
        """)

        connection.commit()

    except sqlite3.Error as error:
        messagebox.showerror(
            "Database Error",
            f"Unable to create database.\n\n{error}"
        )

    finally:
        if "connection" in locals():
            connection.close()


# ============================================================
# BMI CATEGORY
# ============================================================

def get_bmi_category(bmi):
    """Return BMI category, color and emoji."""

    if bmi < 18.5:
        return "Underweight", INFO_COLOR, "💙"

    elif bmi < 25:
        return "Normal", SUCCESS_COLOR, "💚"

    elif bmi < 30:
        return "Overweight", WARNING_COLOR, "🧡"

    else:
        return "Obese", DANGER_COLOR, "❤️"


# ============================================================
# SAVE BMI RECORD
# ============================================================

def save_record(name, weight, height, bmi, category):
    """Save a BMI record into SQLite."""

    connection = None

    try:
        connection = sqlite3.connect(DATABASE_NAME)
        cursor = connection.cursor()

        date_time = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        cursor.execute("""
            INSERT INTO bmi_records
            (
                user_name,
                weight,
                height,
                bmi,
                category,
                date_time
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            name,
            weight,
            height,
            bmi,
            category,
            date_time
        ))

        connection.commit()

        return True

    except sqlite3.Error as error:

        messagebox.showerror(
            "Database Error",
            f"Unable to save BMI record.\n\n{error}"
        )

        return False

    finally:
        if connection:
            connection.close()


# ============================================================
# BMI HISTORY WINDOW
# ============================================================
def view_history():
    """Display and manage saved BMI records."""

    history_window = tk.Toplevel(root)

    history_window.title("BMI History")
    history_window.geometry("920x650")
    history_window.configure(bg=BG_COLOR)
    history_window.resizable(False, False)

    # ========================================================
    # HEADER
    # ========================================================

    header = tk.Frame(
        history_window,
        bg=HEADER_COLOR,
        height=105
    )

    header.pack(fill="x")
    header.pack_propagate(False)

    tk.Label(
        header,
        text="📋 BMI HISTORY",
        font=("Segoe UI", 22, "bold"),
        bg=HEADER_COLOR,
        fg="white"
    ).pack(pady=(20, 3))

    tk.Label(
        header,
        text="Review and manage your BMI measurements",
        font=("Segoe UI", 10),
        bg=HEADER_COLOR,
        fg="#E9DFFF"
    ).pack()

    # ========================================================
    # SEARCH SECTION
    # ========================================================

    filter_frame = tk.Frame(
        history_window,
        bg=BG_COLOR
    )

    filter_frame.pack(
        fill="x",
        padx=30,
        pady=18
    )

    tk.Label(
        filter_frame,
        text="Filter by user:",
        font=("Segoe UI", 11, "bold"),
        bg=BG_COLOR,
        fg=TEXT_COLOR
    ).pack(side="left")

    user_filter = tk.Entry(
        filter_frame,
        font=("Segoe UI", 11),
        width=25,
        relief="flat",
        bg=CARD_COLOR,
        fg=TEXT_COLOR
    )

    user_filter.pack(
        side="left",
        padx=10,
        ipady=7
    )

    # ========================================================
    # TABLE
    # ========================================================

    table_frame = tk.Frame(
        history_window,
        bg=CARD_COLOR
    )

    table_frame.pack(
        fill="both",
        expand=True,
        padx=30,
        pady=(0, 12)
    )

    table_frame.configure(height=400)
    table_frame.pack_propagate(False)

    # ID is NOT displayed.
    # It is kept internally using the Treeview item's values.

    columns = (
        "sno",
        "date",
        "name",
        "weight",
        "height",
        "bmi",
        "category"
    )

    tree = ttk.Treeview(
        table_frame,
        columns=columns,
        show="headings",
        height=10
    )

    # ========================================================
    # TREEVIEW STYLE
    # ========================================================

    style = ttk.Style()

    try:
        style.theme_use("clam")
    except tk.TclError:
        pass

    style.configure(
        "Treeview",
        background="white",
        foreground=TEXT_COLOR,
        fieldbackground="white",
        rowheight=31,
        font=("Segoe UI", 9)
    )

    style.configure(
        "Treeview.Heading",
        background=HEADER_COLOR,
        foreground="white",
        font=("Segoe UI", 10, "bold")
    )

    style.map(
        "Treeview",
        background=[
            ("selected", "#DCCCF7")
        ],
        foreground=[
            ("selected", HEADER_DARK)
        ]
    )

    # ========================================================
    # HEADINGS
    # ========================================================

    tree.heading(
        "sno",
        text="S.No."
    )

    tree.heading(
        "date",
        text="Date & Time"
    )

    tree.heading(
        "name",
        text="Name"
    )

    tree.heading(
        "weight",
        text="Weight"
    )

    tree.heading(
        "height",
        text="Height"
    )

    tree.heading(
        "bmi",
        text="BMI"
    )

    tree.heading(
        "category",
        text="Category"
    )

    # ========================================================
    # COLUMN WIDTHS
    # ========================================================

    tree.column(
        "sno",
        width=55,
        anchor="center"
    )

    tree.column(
        "date",
        width=170,
        anchor="center"
    )

    tree.column(
        "name",
        width=140,
        anchor="center"
    )

    tree.column(
        "weight",
        width=95,
        anchor="center"
    )

    tree.column(
        "height",
        width=95,
        anchor="center"
    )

    tree.column(
        "bmi",
        width=80,
        anchor="center"
    )

    tree.column(
        "category",
        width=135,
        anchor="center"
    )

    # ========================================================
    # SCROLLBAR
    # ========================================================

    scrollbar = ttk.Scrollbar(
        table_frame,
        orient="vertical",
        command=tree.yview
    )

    tree.configure(
        yscrollcommand=scrollbar.set
    )

    tree.pack(
        side="left",
        fill="both",
        expand=True
    )

    scrollbar.pack(
        side="right",
        fill="y"
    )

    # ========================================================
    # LOAD HISTORY
    # ========================================================

    def load_history(show_message=False):

        # Clear existing rows
        for item in tree.get_children():
            tree.delete(item)

        search_name = user_filter.get().strip()

        connection = None

        try:

            connection = sqlite3.connect(
                DATABASE_NAME
            )

            cursor = connection.cursor()

            if search_name:

                cursor.execute("""
                    SELECT
                        id,
                        date_time,
                        user_name,
                        weight,
                        height,
                        bmi,
                        category
                    FROM bmi_records
                    WHERE user_name LIKE ?
                    ORDER BY id DESC
                """, (
                    f"%{search_name}%",
                ))

            else:

                cursor.execute("""
                    SELECT
                        id,
                        date_time,
                        user_name,
                        weight,
                        height,
                        bmi,
                        category
                    FROM bmi_records
                    ORDER BY id DESC
                """)

            records = cursor.fetchall()

            # =================================================
            # DISPLAY S.NO. FROM 1
            # =================================================

            for index, record in enumerate(
                records,
                start=1
            ):

                database_id = record[0]

                # S.No. is displayed.
                # Database ID is stored invisibly
                # in the Treeview item's internal data.

                item_id = tree.insert(
                    "",
                    tk.END,
                    values=(
                        index,
                        record[1],
                        record[2],
                        f"{record[3]:.2f} kg",
                        f"{record[4]:.2f} m",
                        f"{record[5]:.2f}",
                        record[6]
                    )
                )

                # Store actual database ID
                tree.set(
                    item_id,
                    "sno",
                    index
                )

                # Store database ID using Treeview item metadata
                tree.item(
                    item_id,
                    tags=(str(database_id),)
                )

            if show_message and not records:

                messagebox.showinfo(
                    "No Records",
                    "No BMI records were found.",
                    parent=history_window
                )

        except sqlite3.Error as error:

            messagebox.showerror(
                "Database Error",
                f"Unable to load BMI history.\n\n{error}",
                parent=history_window
            )

        finally:

            if connection:
                connection.close()

    # ========================================================
    # UPDATE SELECTED
    # ========================================================

    def update_selected():

        selected_item = tree.selection()

        if not selected_item:

            messagebox.showwarning(
                "No Selection",
                "Please select a BMI record to update.",
                parent=history_window
            )

            return

        item = selected_item[0]

        values = tree.item(
            item,
            "values"
        )

        tags = tree.item(
            item,
            "tags"
        )

        if not values or not tags:
            return

        # Real database ID
        record_id = tags[0]

        current_weight = values[3].replace(
            " kg",
            ""
        )

        current_height = values[4].replace(
            " m",
            ""
        )

        # ====================================================
        # UPDATE WINDOW
        # ====================================================

        update_window = tk.Toplevel(
            history_window
        )

        update_window.title(
            "Update BMI Record"
        )

        update_window.geometry(
            "430x450"
        )

        update_window.configure(
            bg=BG_COLOR
        )

        update_window.resizable(
            False,
            False
        )

        update_window.transient(
            history_window
        )

        update_window.grab_set()

        # ====================================================
        # UPDATE HEADER
        # ====================================================

        update_header = tk.Frame(
            update_window,
            bg=HEADER_COLOR,
            height=100
        )

        update_header.pack(
            fill="x"
        )

        update_header.pack_propagate(False)

        tk.Label(
            update_header,
            text="✏️ UPDATE BMI RECORD",
            font=("Segoe UI", 18, "bold"),
            bg=HEADER_COLOR,
            fg="white"
        ).pack(
            pady=(22, 5)
        )

        tk.Label(
            update_header,
            text="Update your selected measurement",
            font=("Segoe UI", 10),
            bg=HEADER_COLOR,
            fg="#E9DFFF"
        ).pack()

        # ====================================================
        # FORM
        # ====================================================

        form = tk.Frame(
            update_window,
            bg=CARD_COLOR
        )

        form.pack(
            fill="both",
            expand=True,
            padx=30,
            pady=25
        )

        # Weight
        tk.Label(
            form,
            text="Weight (kg)",
            font=("Segoe UI", 11, "bold"),
            bg=CARD_COLOR,
            fg=TEXT_COLOR
        ).pack(
            anchor="w"
        )

        weight_update = tk.Entry(
            form,
            font=("Segoe UI", 12),
            bg=INPUT_BG,
            fg=TEXT_COLOR,
            relief="flat"
        )

        weight_update.pack(
            fill="x",
            pady=(5, 20),
            ipady=8
        )

        weight_update.insert(
            0,
            current_weight
        )

        # Height
        tk.Label(
            form,
            text="Height (m)",
            font=("Segoe UI", 11, "bold"),
            bg=CARD_COLOR,
            fg=TEXT_COLOR
        ).pack(
            anchor="w"
        )

        height_update = tk.Entry(
            form,
            font=("Segoe UI", 12),
            bg=INPUT_BG,
            fg=TEXT_COLOR,
            relief="flat"
        )

        height_update.pack(
            fill="x",
            pady=(5, 25),
            ipady=8
        )

        height_update.insert(
            0,
            current_height
        )

        # ====================================================
        # SAVE UPDATE
        # ====================================================

        def save_update():

            try:

                weight = float(
                    weight_update.get().strip()
                )

                height = float(
                    height_update.get().strip()
                )

                if weight <= 0:

                    messagebox.showwarning(
                        "Invalid Weight",
                        "Weight must be greater than 0.",
                        parent=update_window
                    )

                    return

                if height <= 0:

                    messagebox.showwarning(
                        "Invalid Height",
                        "Height must be greater than 0.",
                        parent=update_window
                    )

                    return

                bmi = weight / (
                    height ** 2
                )

                category, _, _ = get_bmi_category(
                    bmi
                )

                connection = None

                try:

                    connection = sqlite3.connect(
                        DATABASE_NAME
                    )

                    cursor = connection.cursor()

                    cursor.execute("""
                        UPDATE bmi_records
                        SET
                            weight = ?,
                            height = ?,
                            bmi = ?,
                            category = ?
                        WHERE id = ?
                    """, (
                        weight,
                        height,
                        bmi,
                        category,
                        record_id
                    ))

                    connection.commit()

                finally:

                    if connection:
                        connection.close()

                # Clear update window
                update_window.destroy()

                # Refresh table
                load_history(
                    show_message=False
                )

                # SUCCESS MESSAGE
                messagebox.showinfo(
                    "✓ Update Successful",
                    "The BMI record has been updated successfully.",
                    parent=history_window
                )

            except ValueError:

                messagebox.showerror(
                    "Invalid Input",
                    "Please enter valid numeric values.",
                    parent=update_window
                )

            except sqlite3.Error as error:

                messagebox.showerror(
                    "Database Error",
                    f"Unable to update the BMI record.\n\n{error}",
                    parent=update_window
                )

        # ====================================================
        # BUTTONS
        # ====================================================

        update_buttons = tk.Frame(
            form,
            bg=CARD_COLOR
        )

        update_buttons.pack(
            pady=5
        )

        tk.Button(
            update_buttons,
            text="✓ Update Record",
            font=("Segoe UI", 10, "bold"),
            bg=BUTTON_COLOR,
            fg="white",
            activebackground=BUTTON_HOVER,
            activeforeground="white",
            relief="flat",
            cursor="hand2",
            width=17,
            height=2,
            command=save_update
        ).pack(
            side="left",
            padx=5
        )

        tk.Button(
            update_buttons,
            text="Cancel",
            font=("Segoe UI", 10, "bold"),
            bg="#E8DEF8",
            fg=HEADER_DARK,
            relief="flat",
            cursor="hand2",
            width=10,
            height=2,
            command=update_window.destroy
        ).pack(
            side="left",
            padx=5
        )

    # ========================================================
    # DELETE SELECTED
    # ========================================================

    def delete_selected():

        selected_item = tree.selection()

        if not selected_item:

            messagebox.showwarning(
                "No Selection",
                "Please select a BMI record to delete.",
                parent=history_window
            )

            return

        item = selected_item[0]

        tags = tree.item(
            item,
            "tags"
        )

        if not tags:
            return

        # Get actual SQLite ID
        record_id = tags[0]

        confirm = messagebox.askyesno(
            "Confirm Deletion",
            "Are you sure you want to delete this BMI record?\n\n"
            "This action cannot be undone.",
            parent=history_window
        )

        if not confirm:
            return

        connection = None

        try:

            connection = sqlite3.connect(
                DATABASE_NAME
            )

            cursor = connection.cursor()

            cursor.execute(
                """
                DELETE FROM bmi_records
                WHERE id = ?
                """,
                (record_id,)
            )

            connection.commit()

            if cursor.rowcount == 0:

                messagebox.showwarning(
                    "Record Not Found",
                    "The selected record could not be found.",
                    parent=history_window
                )

            else:

                # Refresh S.No. numbering
                load_history(
                    show_message=False
                )

                # SUCCESS MESSAGE
                messagebox.showinfo(
                    "✓ Delete Successful",
                    "The BMI record has been deleted successfully.",
                    parent=history_window
                )

        except sqlite3.Error as error:

            messagebox.showerror(
                "Database Error",
                f"Unable to delete the BMI record.\n\n{error}",
                parent=history_window
            )

        finally:

            if connection:
                connection.close()

    # ========================================================
    # ACTION BUTTONS
    # ========================================================

    button_frame = tk.Frame(
        history_window,
        bg=BG_COLOR
    )

    button_frame.pack(
        pady=(0, 18)
    )

    # Search
    tk.Button(
        button_frame,
        text="🔍 Search",
        font=("Segoe UI", 10, "bold"),
        bg=BUTTON_COLOR,
        fg="white",
        activebackground=BUTTON_HOVER,
        activeforeground="white",
        relief="flat",
        cursor="hand2",
        width=13,
        height=2,
        command=lambda: load_history(True)
    ).pack(
        side="left",
        padx=4
    )

    # Show All
    def show_all_records():

        user_filter.delete(
            0,
            tk.END
        )

        load_history(
            show_message=False
        )

    tk.Button(
        button_frame,
        text="📋 Show All",
        font=("Segoe UI", 10, "bold"),
        bg="#E8DEF8",
        fg=HEADER_DARK,
        activebackground="#D9C9F2",
        relief="flat",
        cursor="hand2",
        width=13,
        height=2,
        command=show_all_records
    ).pack(
        side="left",
        padx=4
    )

    # Update
    tk.Button(
        button_frame,
        text="Update",
        font=("Segoe UI", 10, "bold"),
        bg="#E8DEF8",
        fg=HEADER_DARK,
        activebackground="#D9C9F2",
        relief="flat",
        cursor="hand2",
        width=17,
        height=2,
        command=update_selected
    ).pack(
        side="left",
        padx=4
    )

    # Delete
    tk.Button(
        button_frame,
        text="🗑 Delete",
        font=("Segoe UI", 10, "bold"),
        bg="#F8D7DA",
        fg="#A52834",
        activebackground="#F1BFC4",
        relief="flat",
        cursor="hand2",
        width=17,
        height=2,
        command=delete_selected
    ).pack(
        side="left",
        padx=4
    )

    # ========================================================
    # INITIAL LOAD
    # ========================================================

    load_history(
        show_message=False
    )

# ============================================================
# BMI PROGRESS GRAPH
# ============================================================

def view_progress():
    """Display BMI progress graph for the entered user."""

    name = user_entry.get().strip()

    if not name:

        messagebox.showwarning(
            "User Required",
            "Please enter a user name first."
        )

        user_entry.focus()
        return

    connection = None

    try:

        connection = sqlite3.connect(
            DATABASE_NAME
        )

        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                date_time,
                bmi
            FROM bmi_records
            WHERE user_name = ?
            ORDER BY date_time ASC
        """, (
            name,
        ))

        records = cursor.fetchall()

        if not records:

            messagebox.showinfo(
                "No Data",
                f"No BMI records found for {name}."
            )

            return

        dates = [
            datetime.strptime(
                record[0],
                "%Y-%m-%d %H:%M:%S"
            )
            for record in records
        ]

        bmi_values = [
            record[1]
            for record in records
        ]

    except (sqlite3.Error, ValueError) as error:

        messagebox.showerror(
            "Error",
            f"Unable to load BMI progress.\n\n{error}"
        )

        return

    finally:

        if connection:
            connection.close()

    # --------------------------------------------------------
    # GRAPH WINDOW
    # --------------------------------------------------------

    graph_window = tk.Toplevel(root)

    graph_window.title(
        f"BMI Progress - {name}"
    )

    graph_window.geometry(
        "900x650"
    )

    graph_window.configure(
        bg=BG_COLOR
    )

    graph_window.resizable(
        False,
        False
    )

    # --------------------------------------------------------
    # GRAPH HEADER
    # --------------------------------------------------------

    graph_header = tk.Frame(
        graph_window,
        bg=HEADER_COLOR,
        height=105
    )

    graph_header.pack(
        fill="x"
    )

    graph_header.pack_propagate(
        False
    )

    tk.Label(
        graph_header,
        text=f"📈 {name}'s BMI PROGRESS",
        font=("Segoe UI", 22, "bold"),
        bg=HEADER_COLOR,
        fg="white"
    ).pack(
        pady=(20, 4)
    )

    tk.Label(
        graph_header,
        text="Track your BMI measurements over time",
        font=("Segoe UI", 10),
        bg=HEADER_COLOR,
        fg="#E9DFFF"
    ).pack()

    # --------------------------------------------------------
    # GRAPH
    # --------------------------------------------------------

    figure = Figure(
        figsize=(8.4, 5.0),
        dpi=100
    )

    axis = figure.add_subplot(111)

    axis.plot(
        dates,
        bmi_values,
        marker="o",
        linewidth=2,
        label="BMI"
    )

    # BMI reference lines
    axis.axhline(
        y=18.5,
        linestyle="--",
        linewidth=1,
        label="18.5"
    )

    axis.axhline(
        y=25,
        linestyle="--",
        linewidth=1,
        label="25"
    )

    axis.axhline(
        y=30,
        linestyle="--",
        linewidth=1,
        label="30"
    )

    # Category zones
    axis.axhspan(
        0,
        18.5,
        alpha=0.08
    )

    axis.axhspan(
        18.5,
        25,
        alpha=0.08
    )

    axis.axhspan(
        25,
        30,
        alpha=0.08
    )

    axis.axhspan(
        30,
        max(40, max(bmi_values) + 5),
        alpha=0.08
    )

    axis.set_title(
        "BMI Trend",
        fontsize=16,
        fontweight="bold",
        pad=12
    )

    axis.set_xlabel(
        "Date",
        fontsize=10
    )

    axis.set_ylabel(
        "BMI",
        fontsize=10
    )

    axis.grid(
        True,
        alpha=0.25
    )

    axis.legend(
        loc="best"
    )

    figure.autofmt_xdate()

    figure.tight_layout()

    canvas = FigureCanvasTkAgg(
        figure,
        master=graph_window
    )

    canvas.draw()

    canvas.get_tk_widget().pack(
        padx=20,
        pady=20,
        fill="both",
        expand=True
    )


# ============================================================
# BMI CALCULATION
# ============================================================

def calculate_bmi():
    """Calculate BMI, display the result and save the record."""

    try:

        name = user_entry.get().strip()

        weight_text = weight_entry.get().strip()
        height_text = height_entry.get().strip()

        if not name:

            messagebox.showwarning(
                "Missing Information",
                "Please enter your name."
            )

            user_entry.focus()
            return

        if not weight_text:

            messagebox.showwarning(
                "Missing Weight",
                "Please enter your weight."
            )

            weight_entry.focus()
            return

        if not height_text:

            messagebox.showwarning(
                "Missing Height",
                "Please enter your height."
            )

            height_entry.focus()
            return

        weight = float(
            weight_text
        )

        height = float(
            height_text
        )

        if weight <= 0:

            messagebox.showwarning(
                "Invalid Weight",
                "Weight must be greater than 0."
            )

            weight_entry.focus()
            return

        if height <= 0:

            messagebox.showwarning(
                "Invalid Height",
                "Height must be greater than 0."
            )

            height_entry.focus()
            return

        bmi = weight / (height ** 2)

        category, result_color, emoji = get_bmi_category(
            bmi
        )

        # Display BMI
        bmi_value_label.config(
            text=f"{bmi:.2f}",
            fg=result_color
        )

        # Display category
        category_label.config(
            text=f"{emoji} {category}",
            fg=result_color
        )

        # Save record
        saved = save_record(
            name,
            weight,
            height,
            bmi,
            category
        )

        if saved:

            status_label.config(
                text="✓ BMI record saved successfully",
                fg=SUCCESS_COLOR
            )

    except ValueError:

        messagebox.showerror(
            "Invalid Input",
            "Please enter valid numbers for weight and height."
        )


# ============================================================
# CLEAR FORM
# ============================================================

def clear_form():
    """Clear all input and result fields."""

    user_entry.delete(
        0,
        tk.END
    )

    weight_entry.delete(
        0,
        tk.END
    )

    height_entry.delete(
        0,
        tk.END
    )

    bmi_value_label.config(
        text="--",
        fg=HEADER_COLOR
    )

    category_label.config(
        text="Enter your details",
        fg=SECONDARY_TEXT
    )

    status_label.config(
        text=""
    )

    user_entry.focus()


# ============================================================
# MAIN APPLICATION
# ============================================================

create_database()

root = tk.Tk()

root.title(
    "BMI Health Tracker"
)

root.geometry(
    "620x820"
)

root.resizable(
    False,
    False
)

root.configure(
    bg=BG_COLOR
)


# ============================================================
# MAIN HEADER
# ============================================================

header = tk.Frame(
    root,
    bg=HEADER_COLOR,
    height=150
)

header.pack(
    fill="x"
)

header.pack_propagate(
    False
)

tk.Label(
    header,
    text="💜 BMI HEALTH TRACKER",
    font=("Segoe UI", 25, "bold"),
    bg=HEADER_COLOR,
    fg="white"
).pack(
    pady=(25, 5)
)

tk.Label(
    header,
    text="Understand your BMI • Track your progress • Stay healthy",
    font=("Segoe UI", 11),
    bg=HEADER_COLOR,
    fg="#E9DFFF"
).pack()


# ============================================================
# MAIN CONTAINER
# ============================================================

main_frame = tk.Frame(
    root,
    bg=BG_COLOR
)

main_frame.pack(
    fill="both",
    expand=True,
    padx=35,
    pady=25
)


# ============================================================
# INPUT CARD
# ============================================================

input_card = tk.Frame(
    main_frame,
    bg=CARD_COLOR,
    highlightbackground="#E5DAF8",
    highlightthickness=1
)

input_card.pack(
    fill="x",
    pady=(0, 20)
)

tk.Label(
    input_card,
    text="📋 Personal Information",
    font=("Segoe UI", 15, "bold"),
    bg=CARD_COLOR,
    fg=TEXT_COLOR
).pack(
    anchor="w",
    padx=25,
    pady=(20, 15)
)


# ============================================================
# NAME INPUT
# ============================================================

tk.Label(
    input_card,
    text="Full Name",
    font=("Segoe UI", 10, "bold"),
    bg=CARD_COLOR,
    fg=TEXT_COLOR
).pack(
    anchor="w",
    padx=25
)

user_entry = tk.Entry(
    input_card,
    font=("Segoe UI", 12),
    bg="#F3EEFF",
    fg=TEXT_COLOR,
    insertbackground=HEADER_COLOR,
    relief="solid",
    bd=1,
    width=42
)

user_entry.pack(
    padx=25,
    pady=(5, 10),
    ipady=6
)


# ============================================================
# WEIGHT INPUT
# ============================================================

tk.Label(
    input_card,
    text="Weight (kg)",
    font=("Segoe UI", 10, "bold"),
    bg=CARD_COLOR,
    fg=TEXT_COLOR
).pack(
    anchor="w",
    padx=25
)

weight_entry = tk.Entry(
    input_card,
    font=("Segoe UI", 12),
    bg="#F3EEFF",
    fg=TEXT_COLOR,
    insertbackground=HEADER_COLOR,
    relief="solid",
    bd=1,
    width=42
)


weight_entry.pack(
    padx=25,
    pady=(5, 10),
    ipady=6
)


# ============================================================
# HEIGHT INPUT
# ============================================================

tk.Label(
    input_card,
    text="Height (m)",
    font=("Segoe UI", 10, "bold"),
    bg=CARD_COLOR,
    fg=TEXT_COLOR
).pack(
    anchor="w",
    padx=25
)

height_entry = tk.Entry(
    input_card,
    font=("Segoe UI", 12),
    bg="#F3EEFF",
    fg=TEXT_COLOR,
    insertbackground=HEADER_COLOR,
    relief="solid",
    bd=1,
    width=42
)


height_entry.pack(
    padx=25,
    pady=(5, 10),
    ipady=6
)


# ============================================================
# MAIN BUTTONS
# ============================================================

button_frame = tk.Frame(
    main_frame,
    bg=BG_COLOR
)

button_frame.pack(
    pady=(0, 20)
)

# Calculate
tk.Button(
    button_frame,
    text="🧮 Calculate BMI",
    font=("Segoe UI", 11, "bold"),
    bg=BUTTON_COLOR,
    fg="white",
    activebackground=BUTTON_HOVER,
    activeforeground="white",
    relief="flat",
    width=18,
    height=2,
    cursor="hand2",
    command=calculate_bmi
).pack(
    side="left",
    padx=5
)

# Clear
tk.Button(
    button_frame,
    text="↻ Clear",
    font=("Segoe UI", 11, "bold"),
    bg="#E8DEF8",
    fg=HEADER_DARK,
    relief="flat",
    cursor="hand2",
    width=10,
    height=2,
    command=clear_form
).pack(
    side="left",
    padx=5
)

# History
tk.Button(
    button_frame,
    text="📋 History",
    font=("Segoe UI", 11, "bold"),
    bg="#F2D7EA",
    fg="#8E3A70",
    relief="flat",
    cursor="hand2",
    width=12,
    height=2,
    command=view_history
).pack(
    side="left",
    padx=5
)

# Progress
tk.Button(
    button_frame,
    text="📈 Progress",
    font=("Segoe UI", 11, "bold"),
    bg="#DDEBFF",
    fg="#315A91",
    relief="flat",
    width=12,
    height=2,
    cursor="hand2",
    command=view_progress
).pack(
    side="left",
    padx=5
)


# ============================================================
# RESULT CARD
# ============================================================

result_card = tk.Frame(
    main_frame,
    bg=CARD_COLOR,
    highlightbackground="#E5DAF8",
    highlightthickness=1
)

result_card.pack(
    fill="x"
)

tk.Label(
    result_card,
    text="YOUR BMI RESULT",
    font=("Segoe UI", 10, "bold"),
    bg=CARD_COLOR,
    fg=SECONDARY_TEXT
).pack(
    pady=(18, 5)
)

bmi_value_label = tk.Label(
    result_card,
    text="--",
    font=("Segoe UI", 38, "bold"),
    bg=CARD_COLOR,
    fg=HEADER_COLOR
)

bmi_value_label.pack()

category_label = tk.Label(
    result_card,
    text="Enter your details",
    font=("Segoe UI", 15, "bold"),
    bg=CARD_COLOR,
    fg=SECONDARY_TEXT
)

category_label.pack(
    pady=(0, 15)
)

status_label = tk.Label(
    result_card,
    text="",
    font=("Segoe UI", 9, "bold"),
    bg=CARD_COLOR
)

status_label.pack(
    pady=(0, 18)
)


# ============================================================
# FOOTER
# ============================================================

tk.Label(
    root,
    text="BMI Health Tracker • Python • Tkinter • SQLite",
    font=("Segoe UI", 9),
    bg=BG_COLOR,
    fg="#91879F"
).pack(
    pady=(0, 15)
)


# ============================================================
# START APPLICATION
# ============================================================

user_entry.focus()

root.mainloop()