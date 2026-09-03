"""
Weather Service Module
----------------------
Core API client, weather-data parsing, and CLI interface
for OpenWeatherMap.

This module provides reusable weather-service functionality
for both CLI and GUI applications.
"""

from datetime import datetime, timezone
import os
import sys
from typing import Any

import requests

# Load environment variables from .env when python-dotenv is installed.
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass


# ============================================================
# CUSTOM EXCEPTIONS
# ============================================================

class WeatherError(Exception):
    """Base exception for all weather-service errors."""


class ValidationError(WeatherError):
    """Raised when user input is invalid or empty."""


class InvalidAPIKeyError(WeatherError):
    """Raised when the OpenWeatherMap API key is missing or invalid."""


class LocationNotFoundError(WeatherError):
    """Raised when the requested city or ZIP code cannot be found."""


class NetworkError(WeatherError):
    """Raised when a network timeout or connection failure occurs."""


# ============================================================
# CONFIGURATION
# ============================================================

def load_api_key() -> str:
    """
    Retrieve the OpenWeatherMap API key from environment variables.

    Returns:
        str: Configured API key or an empty string if unavailable.
    """
    return os.getenv("OPENWEATHER_API_KEY", "").strip()


# ============================================================
# WEATHER SERVICE
# ============================================================

class WeatherService:
    """Service class for retrieving current weather information."""

    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
    ICON_BASE_URL = "https://openweathermap.org/img/wn"

    def __init__(
        self,
        api_key: str | None = None,
        timeout: float = 10.0,
    ) -> None:
        """
        Initialize the weather service.

        Args:
            api_key: Optional OpenWeatherMap API key.
            timeout: Maximum request time in seconds.
        """
        self.api_key = load_api_key() if api_key is None else api_key.strip()
        self.timeout = timeout

    # --------------------------------------------------------
    # API KEY VALIDATION
    # --------------------------------------------------------

    def _validate_api_key(self) -> None:
        """Ensure that a valid API key has been configured."""

        invalid_keys = {
            "",
            "your_api_key_here",
            "your_actual_key_here",
            "YOUR_API_KEY",
            "YOUR_OPENWEATHER_API_KEY",
        }

        if self.api_key in invalid_keys:
            raise InvalidAPIKeyError(
                "OpenWeatherMap API key is missing or not configured.\n"
                "Please add OPENWEATHER_API_KEY to your .env file."
            )

    # --------------------------------------------------------
    # WEATHER REQUEST
    # --------------------------------------------------------

    def get_weather(self, query: str) -> dict[str, Any]:
        """
        Fetch current weather for a city or ZIP/postal code.

        Examples:
            Hyderabad
            London,UK
            500001,IN

        Args:
            query: City name or ZIP/postal code.

        Returns:
            dict[str, Any]: Standardized weather information.

        Raises:
            ValidationError: If the query is empty.
            InvalidAPIKeyError: If the API key is invalid.
            LocationNotFoundError: If the location is not found.
            NetworkError: If the request fails.
            WeatherError: For other API or parsing errors.
        """

        # Validate user input.
        if not query or not query.strip():
            raise ValidationError(
                "Search query cannot be empty. "
                "Please enter a city name or ZIP code."
            )

        clean_query = query.strip()

        # Validate API key before making a request.
        self._validate_api_key()

        # ----------------------------------------------------
        # BUILD REQUEST PARAMETERS
        # ----------------------------------------------------

        params = {
            "appid": self.api_key,
            "units": "metric",
        }

        # Support both city names and ZIP/postal codes.
        if self._looks_like_zip_code(clean_query):
            params["zip"] = clean_query
        else:
            params["q"] = clean_query

        # ----------------------------------------------------
        # API REQUEST
        # ----------------------------------------------------

        try:
            response = requests.get(
                self.BASE_URL,
                params=params,
                timeout=self.timeout,
            )

        except requests.exceptions.Timeout as exc:
            raise NetworkError(
                "Request timed out while connecting to OpenWeatherMap. "
                "Please try again."
            ) from exc

        except requests.exceptions.ConnectionError as exc:
            raise NetworkError(
                "Network connection error. "
                "Please check your internet connection."
            ) from exc

        except requests.exceptions.RequestException as exc:
            raise NetworkError(
                f"HTTP request failed: {exc}"
            ) from exc

        # ----------------------------------------------------
        # HANDLE API RESPONSE
        # ----------------------------------------------------

        if response.status_code == 401:
            raise InvalidAPIKeyError(
                "Invalid API key. Please check your "
                "OPENWEATHER_API_KEY configuration."
            )

        if response.status_code == 404:
            raise LocationNotFoundError(
                f"Location '{clean_query}' was not found. "
                "Please verify the city name or ZIP code."
            )

        if response.status_code == 429:
            raise WeatherError(
                "API rate limit exceeded. "
                "Please wait a few minutes and try again."
            )

        if response.status_code >= 500:
            raise WeatherError(
                "OpenWeatherMap service is currently unavailable. "
                "Please try again later."
            )

        if response.status_code != 200:
            raise WeatherError(
                f"API Error (HTTP {response.status_code}): "
                f"{response.reason}"
            )

        # ----------------------------------------------------
        # PARSE JSON RESPONSE
        # ----------------------------------------------------

        try:
            data = response.json()
        except ValueError as exc:
            raise WeatherError(
                "Failed to parse the API response."
            ) from exc

        return self._parse_weather_data(data)

    # --------------------------------------------------------
    # ZIP CODE DETECTION
    # --------------------------------------------------------

    @staticmethod
    def _looks_like_zip_code(query: str) -> bool:
        """
        Determine whether a query appears to be a ZIP/postal code.

        Supports formats such as:
            500001
            500001,IN
            90210,US
        """

        first_part = query.split(",", maxsplit=1)[0].strip()

        return (
            first_part.isdigit()
            and 3 <= len(first_part) <= 10
        )

    # --------------------------------------------------------
    # WEATHER DATA PARSING
    # --------------------------------------------------------

    def _parse_weather_data(
        self,
        data: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Convert raw OpenWeatherMap JSON into standardized data.
        """

        try:
            city_name = data.get("name", "Unknown Location")

            country = data.get("sys", {}).get("country", "")

            location_label = (
                f"{city_name}, {country}"
                if country
                else city_name
            )

            # Main weather information.
            main = data["main"]

            temp_c = float(main["temp"])
            feels_c = float(
                main.get("feels_like", temp_c)
            )

            humidity = int(
                main.get("humidity", 0)
            )

            # Wind information.
            wind = data.get("wind", {})

            wind_ms = float(
                wind.get("speed", 0.0)
            )

            # Weather condition.
            weather_list = data.get(
                "weather",
                [],
            )

            weather_primary = (
                weather_list[0]
                if weather_list
                else {}
            )

            condition = weather_primary.get(
                "main",
                "Unknown",
            )

            description = weather_primary.get(
                "description",
                "N/A",
            ).title()

            icon_code = weather_primary.get(
                "icon",
                "01d",
            )

            pressure = int(main.get("pressure", 0))

            visibility_raw = data.get("visibility")
            if visibility_raw is not None:
                visibility_km = round(float(visibility_raw) / 1000, 1)
                visibility_miles = round(float(visibility_raw) / 1609.34, 1)
            else:
                visibility_km = None
                visibility_miles = None

            sys_data = data.get("sys", {})
            tz_offset = int(data.get("timezone", 0))

            def _format_time(ts: Any) -> str:
                if not ts or not isinstance(ts, (int, float)):
                    return "N/A"
                try:
                    dt = datetime.fromtimestamp(int(ts) + tz_offset, tz=timezone.utc)
                    return dt.strftime("%I:%M %p").lstrip("0")
                except (ValueError, OSError, OverflowError):
                    return "N/A"

            sunrise_str = _format_time(sys_data.get("sunrise"))
            sunset_str = _format_time(sys_data.get("sunset"))

            # ------------------------------------------------
            # UNIT CONVERSIONS
            # ------------------------------------------------

            temp_f = (temp_c * 9 / 5) + 32
            feels_f = (feels_c * 9 / 5) + 32

            wind_kmh = wind_ms * 3.6
            wind_mph = wind_ms * 2.23694

            # ------------------------------------------------
            # STANDARDIZED WEATHER RESULT
            # ------------------------------------------------

            return {
                "city": location_label,
                "country": country,
                "temp_c": round(temp_c, 1),
                "temp_f": round(temp_f, 1),
                "feels_like_c": round(feels_c, 1),
                "feels_like_f": round(feels_f, 1),
                "humidity": humidity,
                "pressure": pressure,
                "visibility_km": visibility_km,
                "visibility_miles": visibility_miles,
                "wind_speed_ms": round(wind_ms, 1),
                "wind_speed_kmh": round(wind_kmh, 1),
                "wind_speed_mph": round(wind_mph, 1),
                "condition": condition,
                "description": description,
                "sunrise": sunrise_str,
                "sunset": sunset_str,
                "icon_code": icon_code,
                "icon_url": (
                    f"{self.ICON_BASE_URL}/"
                    f"{icon_code}@2x.png"
                ),
            }

        except (
            KeyError,
            IndexError,
            TypeError,
            ValueError,
        ) as exc:
            raise WeatherError(
                "Unexpected response structure from "
                f"OpenWeatherMap API: {exc}"
            ) from exc

    # --------------------------------------------------------
    # WEATHER ICON
    # --------------------------------------------------------

    def fetch_icon(
        self,
        icon_code: str,
    ) -> bytes | None:
        """
        Download a weather icon.

        Returns:
            bytes | None: Icon data if successful,
            otherwise None.
        """

        if not icon_code:
            return None

        url = (
            f"{self.ICON_BASE_URL}/"
            f"{icon_code}@2x.png"
        )

        try:
            response = requests.get(
                url,
                timeout=self.timeout,
            )

            if response.status_code == 200:
                return response.content

        except requests.exceptions.RequestException:
            # Weather icons are optional, so a failed
            # icon request should not break the app.
            pass

        return None


# ============================================================
# COMMAND-LINE INTERFACE
# ============================================================

def run_cli() -> None:
    """Run the weather application through the command line."""

    print("=" * 60)
    print("           WEATHER APP - COMMAND LINE INTERFACE")
    print("=" * 60)

    print(
        "Lookup current weather by City "
        "(e.g. Hyderabad, London,UK)"
    )

    print(
        "or ZIP/postal code "
        "(e.g. 500001,IN, 90210,US)."
    )

    print("Type 'q' or 'exit' to quit.\n")

    service = WeatherService()

    while True:
        try:
            user_input = input(
                "Enter City or ZIP code > "
            ).strip()

            # Exit command.
            if user_input.lower() in (
                "q",
                "quit",
                "exit",
            ):
                print("Goodbye!")
                break

            # Empty input.
            if not user_input:
                print(
                    "⚠️ Please enter a valid "
                    "location name or ZIP code.\n"
                )
                continue

            print(
                f"Fetching weather data for "
                f"'{user_input}'..."
            )

            weather = service.get_weather(
                user_input
            )

            # ------------------------------------------------
            # DISPLAY WEATHER
            # ------------------------------------------------

            print("\n" + "-" * 40)

            print(
                f"📍 Location:    "
                f"{weather['city']}"
            )

            print(
                f"🌡️ Temperature: "
                f"{weather['temp_c']}°C"
            )

            print(
                f"🌡️ Feels Like:  "
                f"{weather['feels_like_c']}°C"
            )

            print(
                f"☁️ Condition:   "
                f"{weather['condition']}"
            )

            print(
                f"📝 Description: "
                f"{weather['description']}"
            )

            print(
                f"💧 Humidity:    "
                f"{weather['humidity']}%"
            )

            print(
                f"🌬️ Wind Speed:  "
                f"{weather['wind_speed_ms']} m/s "
                f"({weather['wind_speed_kmh']} km/h)"
            )

            if weather.get("pressure"):
                print(
                    f"🔵 Pressure:    "
                    f"{weather['pressure']} hPa"
                )

            if weather.get("visibility_km") is not None:
                print(
                    f"👁️ Visibility:  "
                    f"{weather['visibility_km']} km"
                )

            if weather.get("sunrise") and weather["sunrise"] != "N/A":
                print(
                    f"🌅 Sunrise:     "
                    f"{weather['sunrise']}"
                )

            if weather.get("sunset") and weather["sunset"] != "N/A":
                print(
                    f"🌇 Sunset:      "
                    f"{weather['sunset']}"
                )

            print("-" * 40 + "\n")

        except WeatherError as err:
            print(f"\n❌ Error: {err}\n")

        except KeyboardInterrupt:
            print("\nGoodbye!")
            sys.exit(0)


# ============================================================
# PROGRAM ENTRY POINT
# ============================================================

if __name__ == "__main__":
    run_cli()