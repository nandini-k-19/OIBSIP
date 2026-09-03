"""
Unit tests for the Weather App GUI.

Tests:
- GUI initialization
- Placeholder behavior
- Loading state
- Error state
- Results state
- Search validation
- Enter-key behavior
"""

import tkinter as tk
import unittest
from unittest.mock import patch

from app import WeatherApp


class TestWeatherAppGUI(unittest.TestCase):
    """Test cases for the WeatherApp Tkinter GUI."""

    def setUp(self):
        """Create the Tkinter root and WeatherApp before each test."""
        try:
            self.root = tk.Tk()
            self.root.withdraw()
            self.app = WeatherApp(self.root)
        except tk.TclError:
            self.skipTest(
                "Tkinter display is not available in this environment."
            )

    def tearDown(self):
        """Destroy the Tkinter root after each test."""
        if getattr(self, "root", None) is not None:
            try:
                self.root.destroy()
            except tk.TclError:
                pass

    def test_gui_initialization(self):
        """Test that the main GUI initializes correctly."""
        self.assertEqual(
            self.app.root.title(),
            "Weather App - OpenWeatherMap",
        )
        self.assertTrue(self.app.has_placeholder)
        self.assertEqual(
            self.app.search_entry.get(),
            self.app.PLACEHOLDER_TEXT,
        )

    def test_placeholder_removal(self):
        """Test that the placeholder is removed when the user focuses."""
        self.app._remove_placeholder()

        self.assertFalse(self.app.has_placeholder)
        self.assertEqual(self.app.search_entry.get(), "")

    def test_placeholder_restoration(self):
        """Test that the placeholder returns when the field is empty."""
        self.app._remove_placeholder()
        self.app._restore_placeholder()

        self.assertTrue(self.app.has_placeholder)
        self.assertEqual(
            self.app.search_entry.get(),
            self.app.PLACEHOLDER_TEXT,
        )

    def test_show_error_state(self):
        """Test transition to the error display state."""
        self.app.show_error("Test error message")

        self.assertEqual(
            self.app.error_label.cget("text"),
            "❌ Test error message",
        )
        self.assertTrue(
            self.app.search_button.instate(["!disabled"])
        )

    def test_show_loading_state(self):
        """Test transition to the loading display state."""
        self.app.show_loading("Hyderabad")

        self.assertIn(
            "Searching weather for 'Hyderabad'",
            self.app.loading_label.cget("text"),
        )
        self.assertTrue(
            self.app.search_button.instate(["disabled"])
        )

    def test_show_results_state(self):
        """Test that weather results are displayed correctly."""
        data = {
            "city": "Hyderabad, IN",
            "temp_c": 28.5,
            "temp_f": 83.3,
            "feels_like_c": 30.1,
            "feels_like_f": 86.2,
            "humidity": 65,
            "pressure": 1012,
            "visibility_km": 10.0,
            "sunrise": "06:02 AM",
            "sunset": "06:28 PM",
            "wind_speed_ms": 3.5,
            "wind_speed_kmh": 12.6,
            "condition": "Clouds",
            "description": "Scattered Clouds",
            "icon_code": "03d",
        }

        self.app.show_results(data, icon_bytes=None)

        self.assertEqual(
            self.app.city_label.cget("text"),
            "Hyderabad, IN",
        )
        self.assertEqual(
            self.app.temp_label.cget("text"),
            "28.5 °C",
        )
        self.assertEqual(
            self.app.temp_f_label.cget("text"),
            "(83.3 °F)",
        )
        self.assertEqual(
            self.app.condition_label.cget("text"),
            "Scattered Clouds",
        )
        self.assertEqual(
            self.app.pressure_label.cget("text"),
            "1012 hPa",
        )
        self.assertEqual(
            self.app.visibility_label.cget("text"),
            "10.0 km",
        )
        self.assertEqual(
            self.app.sun_label.cget("text"),
            "🌅 06:02 AM\n🌇 06:28 PM",
        )
        self.assertTrue(
            self.app.search_button.instate(["!disabled"])
        )

    @patch.object(WeatherApp, "show_loading")
    def test_empty_search(self, mock_show_loading):
        """Test that an empty search does not start a weather request."""
        self.app._remove_placeholder()
        self.app.search_entry.insert(0, "   ")

        self.app.on_search()

        mock_show_loading.assert_not_called()

    def test_enter_key_handler(self):
        """Test that pressing Enter triggers the search."""
        with patch.object(self.app, "on_search") as mock_search:
            result = self.app._handle_enter_key()

            mock_search.assert_called_once()
            self.assertEqual(result, "break")


if __name__ == "__main__":
    unittest.main()