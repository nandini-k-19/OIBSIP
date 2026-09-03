"""
Weather Application Desktop GUI (app.py)
----------------------------------------
Professional Tkinter desktop GUI for OpenWeatherMap.

Features:
- City and ZIP/postal-code search
- Non-blocking background weather requests
- Weather information display
- Weather icon rendering with Pillow
- Loading and error states
- Clean and responsive user experience

Presentation layer only.
"""

import io
import sys
import threading
import tkinter as tk
from tkinter import ttk

from PIL import Image, ImageTk

from weather_service import (
    WeatherService,
    WeatherError,
)


# ============================================================
# WEATHER APPLICATION
# ============================================================

class WeatherApp:
    """Tkinter desktop application for weather lookup."""

    # --------------------------------------------------------
    # COLOR PALETTE
    # --------------------------------------------------------

    COLOR_BG = "#F3F4F6"
    COLOR_CARD = "#FFFFFF"
    COLOR_HEADER = "#1E293B"
    COLOR_ACCENT = "#2563EB"
    COLOR_ACCENT_HOVER = "#1D4ED8"

    COLOR_TEXT_MAIN = "#0F172A"
    COLOR_TEXT_MUTED = "#64748B"

    COLOR_ERROR_BG = "#FEE2E2"
    COLOR_ERROR_TEXT = "#991B1B"

    COLOR_TEMP = "#D97706"

    FONT_FAMILY = (
        "Segoe UI"
        if sys.platform == "win32"
        else "Helvetica"
    )

    WINDOW_WIDTH = 480
    WINDOW_HEIGHT = 640

    PLACEHOLDER_TEXT = (
        "Enter city name or ZIP code "
        "(e.g. Hyderabad, 500001,IN)"
    )

    # --------------------------------------------------------
    # INITIALIZATION
    # --------------------------------------------------------

    def __init__(self, root: tk.Tk) -> None:
        """Initialize the application and build the interface."""

        self.root = root

        self.root.title(
            "Weather App - OpenWeatherMap"
        )

        self.root.geometry(
            f"{self.WINDOW_WIDTH}x{self.WINDOW_HEIGHT}"
        )

        self.root.resizable(False, False)
        self.root.configure(bg=self.COLOR_BG)

        # Center the application window.
        self._center_window(
            self.WINDOW_WIDTH,
            self.WINDOW_HEIGHT,
        )

        # Create reusable weather service.
        self.service = WeatherService()

        # Keep a reference to the PhotoImage.
        self._current_icon_photo = None

        # Used to prevent UI updates after window closes.
        self._is_closing = False

        # Placeholder state.
        self.placeholder_text = self.PLACEHOLDER_TEXT
        self.has_placeholder = False

        # Configure styles and widgets.
        self._setup_styles()
        self._create_widgets()

        # Handle application closing.
        self.root.protocol(
            "WM_DELETE_WINDOW",
            self._on_close,
        )

    # ========================================================
    # WINDOW MANAGEMENT
    # ========================================================

    def _center_window(
        self,
        width: int,
        height: int,
    ) -> None:
        """Center the application window on the screen."""

        self.root.update_idletasks()

        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()

        x = (screen_width - width) // 2
        y = (screen_height - height) // 2

        self.root.geometry(
            f"{width}x{height}+{x}+{y}"
        )

    def _on_close(self) -> None:
        """Safely close the application."""

        self._is_closing = True
        self.root.destroy()

    # ========================================================
    # STYLING
    # ========================================================

    def _setup_styles(self) -> None:
        """Configure ttk widget styles."""

        self.style = ttk.Style()

        self.style.theme_use("clam")

        # Search entry.
        self.style.configure(
            "Search.TEntry",
            fieldbackground="#FFFFFF",
            font=(self.FONT_FAMILY, 11),
            padding=8,
        )

        # Primary button.
        self.style.configure(
            "Primary.TButton",
            font=(
                self.FONT_FAMILY,
                10,
                "bold",
            ),
            background=self.COLOR_ACCENT,
            foreground="#FFFFFF",
            bordercolor=self.COLOR_ACCENT,
            focuscolor="",
            padding=(14, 8),
        )

        self.style.map(
            "Primary.TButton",
            background=[
                (
                    "active",
                    self.COLOR_ACCENT_HOVER,
                ),
                (
                    "disabled",
                    "#94A3B8",
                ),
            ],
            foreground=[
                (
                    "disabled",
                    "#CBD5E1",
                ),
            ],
        )

    # ========================================================
    # CREATE GUI
    # ========================================================

    def _create_widgets(self) -> None:
        """Create and arrange all GUI components."""

        # ----------------------------------------------------
        # HEADER
        # ----------------------------------------------------

        header_frame = tk.Frame(
            self.root,
            bg=self.COLOR_HEADER,
            height=75,
        )

        header_frame.pack(fill=tk.X)
        header_frame.pack_propagate(False)

        title_label = tk.Label(
            header_frame,
            text="🌦️ Weather Forecast",
            font=(
                self.FONT_FAMILY,
                16,
                "bold",
            ),
            bg=self.COLOR_HEADER,
            fg="#FFFFFF",
        )

        title_label.pack(
            side=tk.LEFT,
            padx=20,
            pady=20,
        )

        subtitle_label = tk.Label(
            header_frame,
            text="Real-time OpenWeatherMap",
            font=(
                self.FONT_FAMILY,
                9,
            ),
            bg=self.COLOR_HEADER,
            fg="#94A3B8",
        )

        subtitle_label.pack(
            side=tk.RIGHT,
            padx=20,
            pady=24,
        )

        # ----------------------------------------------------
        # MAIN CONTAINER
        # ----------------------------------------------------

        self.main_container = tk.Frame(
            self.root,
            bg=self.COLOR_BG,
            padx=20,
            pady=15,
        )

        self.main_container.pack(
            fill=tk.BOTH,
            expand=True,
        )

        # ----------------------------------------------------
        # SEARCH AREA
        # ----------------------------------------------------

        search_frame = tk.Frame(
            self.main_container,
            bg=self.COLOR_BG,
        )

        search_frame.pack(
            fill=tk.X,
            pady=(0, 10),
        )

        self.search_entry = ttk.Entry(
            search_frame,
            style="Search.TEntry",
        )

        self.search_entry.pack(
            side=tk.LEFT,
            fill=tk.X,
            expand=True,
            padx=(0, 8),
        )

        # Configure placeholder before focusing.
        self._setup_placeholder(self.PLACEHOLDER_TEXT)

        self.search_entry.focus_set()

        # Press Enter to search.
        self.search_entry.bind(
            "<Return>",
            self._handle_enter_key,
        )

        # Search button.
        self.search_button = ttk.Button(
            search_frame,
            text="Get Weather",
            style="Primary.TButton",
            command=self.on_search,
        )

        self.search_button.pack(
            side=tk.RIGHT,
        )

        # ----------------------------------------------------
        # LOADING STATE
        # ----------------------------------------------------

        self.loading_frame = tk.Frame(
            self.main_container,
            bg=self.COLOR_BG,
        )

        self.loading_label = tk.Label(
            self.loading_frame,
            text="⏳ Fetching weather data...",
            font=(
                self.FONT_FAMILY,
                10,
                "italic",
            ),
            bg=self.COLOR_BG,
            fg=self.COLOR_TEXT_MUTED,
        )

        self.loading_label.pack(
            pady=10,
        )

        # ----------------------------------------------------
        # ERROR STATE
        # ----------------------------------------------------

        self.error_frame = tk.Frame(
            self.main_container,
            bg=self.COLOR_ERROR_BG,
            padx=15,
            pady=12,
            highlightbackground="#FCA5A5",
            highlightthickness=1,
        )

        self.error_label = tk.Label(
            self.error_frame,
            text="",
            font=(
                self.FONT_FAMILY,
                10,
            ),
            bg=self.COLOR_ERROR_BG,
            fg=self.COLOR_ERROR_TEXT,
            wraplength=400,
            justify=tk.LEFT,
        )

        self.error_label.pack(
            fill=tk.X,
        )

        # ----------------------------------------------------
        # RESULTS CARD
        # ----------------------------------------------------

        self.results_card = tk.Frame(
            self.main_container,
            bg=self.COLOR_CARD,
            padx=20,
            pady=15,
            highlightbackground="#E2E8F0",
            highlightthickness=1,
        )

        # City.
        self.city_label = tk.Label(
            self.results_card,
            text="--",
            font=(
                self.FONT_FAMILY,
                18,
                "bold",
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MAIN,
        )

        self.city_label.pack(
            anchor="center",
            pady=(5, 0),
        )

        # Weather icon.
        self.icon_label = tk.Label(
            self.results_card,
            bg=self.COLOR_CARD,
        )

        self.icon_label.pack(
            anchor="center",
        )

        # Temperature Celsius.
        self.temp_label = tk.Label(
            self.results_card,
            text="-- °C",
            font=(
                self.FONT_FAMILY,
                28,
                "bold",
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEMP,
        )

        self.temp_label.pack(
            anchor="center",
        )

        # Temperature Fahrenheit.
        self.temp_f_label = tk.Label(
            self.results_card,
            text="-- °F",
            font=(
                self.FONT_FAMILY,
                12,
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MUTED,
        )

        self.temp_f_label.pack(
            anchor="center",
            pady=(0, 10),
        )

        # Weather condition.
        self.condition_label = tk.Label(
            self.results_card,
            text="--",
            font=(
                self.FONT_FAMILY,
                12,
                "bold",
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MAIN,
        )

        self.condition_label.pack(
            anchor="center",
            pady=(0, 15),
        )

        # Separator.
        separator = ttk.Separator(
            self.results_card,
            orient="horizontal",
        )

        separator.pack(
            fill=tk.X,
            pady=(0, 15),
        )

        # ----------------------------------------------------
        # DETAILS GRID
        # ----------------------------------------------------

        details_grid = tk.Frame(
            self.results_card,
            bg=self.COLOR_CARD,
        )

        details_grid.pack(
            fill=tk.X,
        )

        # Feels Like.
        feels_frame = self._create_detail_column(
            details_grid,
            "🌡️ Feels Like",
        )

        self.feels_label = tk.Label(
            feels_frame,
            text="--",
            font=(
                self.FONT_FAMILY,
                10,
                "bold",
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MAIN,
        )

        self.feels_label.pack()

        # Humidity.
        humidity_frame = self._create_detail_column(
            details_grid,
            "💧 Humidity",
        )

        self.humidity_label = tk.Label(
            humidity_frame,
            text="--",
            font=(
                self.FONT_FAMILY,
                10,
                "bold",
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MAIN,
        )

        self.humidity_label.pack()

        # Wind.
        wind_frame = self._create_detail_column(
            details_grid,
            "💨 Wind Speed",
        )

        self.wind_label = tk.Label(
            wind_frame,
            text="--",
            font=(
                self.FONT_FAMILY,
                10,
                "bold",
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MAIN,
        )

        self.wind_label.pack()

        # Row 2 details (Pressure, Visibility, Sun).
        details_grid2 = tk.Frame(
            self.results_card,
            bg=self.COLOR_CARD,
        )

        details_grid2.pack(
            fill=tk.X,
            pady=(10, 0),
        )

        # Pressure.
        pressure_frame = self._create_detail_column(
            details_grid2,
            "🔵 Pressure",
        )

        self.pressure_label = tk.Label(
            pressure_frame,
            text="--",
            font=(
                self.FONT_FAMILY,
                10,
                "bold",
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MAIN,
        )

        self.pressure_label.pack()

        # Visibility.
        vis_frame = self._create_detail_column(
            details_grid2,
            "👁️ Visibility",
        )

        self.visibility_label = tk.Label(
            vis_frame,
            text="--",
            font=(
                self.FONT_FAMILY,
                10,
                "bold",
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MAIN,
        )

        self.visibility_label.pack()

        # Sun.
        sun_frame = self._create_detail_column(
            details_grid2,
            "🌅 / 🌇 Sun",
        )

        self.sun_label = tk.Label(
            sun_frame,
            text="--",
            font=(
                self.FONT_FAMILY,
                9,
                "bold",
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MAIN,
        )

        self.sun_label.pack()

        # Start with all states hidden.
        self._hide_all_states()

    # ========================================================
    # DETAIL COLUMN HELPER
    # ========================================================

    def _create_detail_column(
        self,
        parent: tk.Frame,
        title: str,
    ) -> tk.Frame:
        """Create one weather-detail column."""

        frame = tk.Frame(
            parent,
            bg=self.COLOR_CARD,
        )

        frame.pack(
            side=tk.LEFT,
            expand=True,
            fill=tk.BOTH,
        )

        tk.Label(
            frame,
            text=title,
            font=(
                self.FONT_FAMILY,
                9,
            ),
            bg=self.COLOR_CARD,
            fg=self.COLOR_TEXT_MUTED,
        ).pack()

        return frame

    # ========================================================
    # PLACEHOLDER
    # ========================================================

    def _setup_placeholder(
        self,
        placeholder_text: str,
    ) -> None:
        """Configure interactive search-box placeholder text."""

        self.placeholder_text = placeholder_text
        self.has_placeholder = True

        self.search_entry.insert(
            0,
            placeholder_text,
        )

        self.search_entry.configure(
            foreground=self.COLOR_TEXT_MUTED,
        )

        self.search_entry.bind(
            "<FocusIn>",
            self._remove_placeholder,
        )

        self.search_entry.bind(
            "<FocusOut>",
            self._restore_placeholder,
        )

    def _remove_placeholder(
        self,
        event=None,
    ) -> None:
        """Remove placeholder when the Entry receives focus."""

        if self.has_placeholder:
            self.search_entry.delete(
                0,
                tk.END,
            )

            self.search_entry.configure(
                foreground=self.COLOR_TEXT_MAIN,
            )

            self.has_placeholder = False

    def _restore_placeholder(
        self,
        event=None,
    ) -> None:
        """Restore placeholder when the Entry is empty."""

        if not self.search_entry.get().strip():
            self.search_entry.insert(
                0,
                self.placeholder_text,
            )

            self.search_entry.configure(
                foreground=self.COLOR_TEXT_MUTED,
            )

            self.has_placeholder = True

    def _handle_enter_key(
        self,
        event=None,
    ) -> str:
        """Start weather search when Enter is pressed."""

        self.on_search()
        return "break"

    # ========================================================
    # UI STATES
    # ========================================================

    def _hide_all_states(self) -> None:
        """Hide loading, error, and results sections."""

        self.loading_frame.pack_forget()
        self.error_frame.pack_forget()
        self.results_card.pack_forget()

    def show_loading(
        self,
        query: str,
    ) -> None:
        """Display loading state and disable search."""

        self._hide_all_states()

        self.loading_label.config(
            text=(
                f"⏳ Searching weather for "
                f"'{query}'..."
            )
        )

        self.loading_frame.pack(
            fill=tk.X,
            pady=15,
        )

        self.search_button.config(
            state="disabled",
        )

    def show_error(
        self,
        message: str,
    ) -> None:
        """Display an error message."""

        if self._is_closing:
            return

        self._hide_all_states()

        self.error_label.config(
            text=f"❌ {message}",
        )

        self.error_frame.pack(
            fill=tk.X,
            pady=10,
        )

        self.search_button.config(
            state="normal",
        )

    # ========================================================
    # DISPLAY RESULTS
    # ========================================================

    def show_results(
        self,
        data: dict,
        icon_bytes: bytes | None,
    ) -> None:
        """Display weather information in the results card."""

        if self._is_closing:
            return

        self._hide_all_states()

        # ----------------------------------------------------
        # TEXT INFORMATION
        # ----------------------------------------------------

        self.city_label.config(
            text=data["city"],
        )

        self.temp_label.config(
            text=f"{data['temp_c']} °C",
        )

        self.temp_f_label.config(
            text=f"({data['temp_f']} °F)",
        )

        self.condition_label.config(
            text=data["description"],
        )

        self.feels_label.config(
            text=f"{data['feels_like_c']} °C",
        )

        self.humidity_label.config(
            text=f"{data['humidity']}%",
        )

        self.wind_label.config(
            text=(
                f"{data['wind_speed_ms']} m/s\n"
                f"({data['wind_speed_kmh']} km/h)"
            ),
        )

        pressure_val = data.get("pressure")
        self.pressure_label.config(
            text=f"{pressure_val} hPa" if pressure_val else "--",
        )

        vis_val = data.get("visibility_km")
        self.visibility_label.config(
            text=f"{vis_val} km" if vis_val is not None else "--",
        )

        sunrise = data.get("sunrise", "N/A")
        sunset = data.get("sunset", "N/A")
        self.sun_label.config(
            text=f"🌅 {sunrise}\n🌇 {sunset}",
        )

        # ----------------------------------------------------
        # WEATHER ICON
        # ----------------------------------------------------

        self._display_icon(icon_bytes)

        # ----------------------------------------------------
        # SHOW RESULTS
        # ----------------------------------------------------

        self.results_card.pack(
            fill=tk.BOTH,
            expand=True,
            pady=10,
        )

        self.search_button.config(
            state="normal",
        )

    def _display_icon(
        self,
        icon_bytes: bytes | None,
    ) -> None:
        """Render the downloaded weather icon safely."""

        # Remove previous icon reference.
        self._current_icon_photo = None

        if not icon_bytes:
            self.icon_label.config(
                image="",
            )

            self.icon_label.pack_forget()
            return

        try:
            image_stream = io.BytesIO(
                icon_bytes,
            )

            image = Image.open(
                image_stream,
            )

            image = image.resize(
                (80, 80),
                Image.Resampling.LANCZOS,
            )

            photo = ImageTk.PhotoImage(
                image,
            )

            # Keep a reference to prevent garbage collection.
            self._current_icon_photo = photo

            self.icon_label.config(
                image=photo,
            )

            self.icon_label.pack(
                anchor="center",
            )

        except (
            OSError,
            ValueError,
        ):
            # Icon failure should never break the application.
            self.icon_label.config(
                image="",
            )

            self.icon_label.pack_forget()

    # ========================================================
    # SEARCH
    # ========================================================

    def on_search(self) -> None:
        """Start an asynchronous weather search."""

        # Do not search using placeholder text.
        if self.has_placeholder:
            query = ""
        else:
            query = self.search_entry.get().strip()

        # Validate input.
        if not query:
            self.show_error(
                "Please enter a city name or ZIP code."
            )
            return

        self.show_loading(query)

        # ----------------------------------------------------
        # BACKGROUND WORKER
        # ----------------------------------------------------

        def fetch_task() -> None:
            """Fetch weather data without blocking Tkinter."""

            try:
                weather_data = (
                    self.service.get_weather(query)
                )

                icon_bytes = (
                    self.service.fetch_icon(
                        weather_data.get(
                            "icon_code"
                        )
                    )
                )

                if self._is_closing:
                    return

                # Schedule UI update on Tkinter's main thread.
                self.root.after(
                    0,
                    lambda data=weather_data,
                    icon=icon_bytes:
                    self.show_results(
                        data,
                        icon,
                    ),
                )

            except WeatherError as exc:
                error_message = str(exc)

                if self._is_closing:
                    return

                self.root.after(
                    0,
                    lambda message=error_message:
                    self.show_error(message),
                )

            except Exception as exc:
                # Preserve exception message before leaving
                # the exception handler.
                error_message = str(exc)

                if self._is_closing:
                    return

                self.root.after(
                    0,
                    lambda message=error_message:
                    self.show_error(
                        "An unexpected error occurred: "
                        f"{message}"
                    ),
                )

        # Run API request in a background daemon thread.
        threading.Thread(
            target=fetch_task,
            daemon=True,
        ).start()


# ============================================================
# APPLICATION ENTRY POINT
# ============================================================

def main() -> None:
    """Create and start the Weather App."""

    root = tk.Tk()

    WeatherApp(root)

    root.mainloop()


if __name__ == "__main__":
    main()