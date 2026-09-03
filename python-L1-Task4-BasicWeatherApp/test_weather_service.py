"""
Unit tests for WeatherService.

These tests verify:
- Input validation
- API-key validation
- City weather requests
- ZIP/postal-code requests
- Weather-data parsing
- API error handling
- Network error handling
"""

import unittest
from unittest.mock import MagicMock, patch

import requests

from weather_service import (
    WeatherService,
    WeatherError,
    ValidationError,
    InvalidAPIKeyError,
    LocationNotFoundError,
    NetworkError,
)


class TestWeatherService(unittest.TestCase):
    """Test cases for WeatherService."""

    def setUp(self):
        """Create a WeatherService instance for each test."""
        self.service = WeatherService(api_key="valid_dummy_api_key")

    def test_empty_query_raises_validation_error(self):
        """Test that empty or whitespace-only input raises ValidationError."""
        with self.assertRaises(ValidationError):
            self.service.get_weather("")

        with self.assertRaises(ValidationError):
            self.service.get_weather("   ")

    def test_missing_api_key_raises_invalid_key_error(self):
        """Test that missing or placeholder API keys are rejected."""
        service_no_key = WeatherService(api_key="")

        with self.assertRaises(InvalidAPIKeyError):
            service_no_key.get_weather("London")

        service_placeholder = WeatherService(
            api_key="your_actual_key_here"
        )

        with self.assertRaises(InvalidAPIKeyError):
            service_placeholder.get_weather("London")

    @patch("weather_service.requests.get")
    def test_successful_weather_parsing(self, mock_get):
        """Test parsing of a successful OpenWeatherMap response."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "name": "Hyderabad",
            "sys": {
                "country": "IN",
                "sunrise": 1700020800,
                "sunset": 1700064000,
            },
            "main": {
                "temp": 25.0,
                "feels_like": 26.5,
                "humidity": 70,
                "pressure": 1012,
            },
            "visibility": 10000,
            "timezone": 19800,
            "wind": {
                "speed": 5.0,
            },
            "weather": [
                {
                    "main": "Clouds",
                    "description": "scattered clouds",
                    "icon": "03d",
                }
            ],
        }

        mock_get.return_value = mock_response

        weather = self.service.get_weather("Hyderabad")

        self.assertEqual(weather["city"], "Hyderabad, IN")
        self.assertEqual(weather["temp_c"], 25.0)
        self.assertEqual(weather["temp_f"], 77.0)
        self.assertEqual(weather["feels_like_c"], 26.5)
        self.assertEqual(weather["feels_like_f"], 79.7)
        self.assertEqual(weather["humidity"], 70)
        self.assertEqual(weather["pressure"], 1012)
        self.assertEqual(weather["visibility_km"], 10.0)
        self.assertEqual(weather["wind_speed_ms"], 5.0)
        self.assertEqual(weather["wind_speed_kmh"], 18.0)
        self.assertEqual(weather["condition"], "Clouds")
        self.assertEqual(weather["description"], "Scattered Clouds")
        self.assertEqual(weather["icon_code"], "03d")
        self.assertEqual(
            weather["icon_url"],
            "https://openweathermap.org/img/wn/03d@2x.png",
        )
        self.assertIn("sunrise", weather)
        self.assertIn("sunset", weather)

    @patch("weather_service.requests.get")
    def test_city_request_uses_query_parameter(self, mock_get):
        """Test that city searches use the q parameter."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "name": "London",
            "sys": {"country": "GB"},
            "main": {
                "temp": 15.0,
                "feels_like": 14.0,
                "humidity": 80,
            },
            "wind": {"speed": 3.0},
            "weather": [
                {
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04d",
                }
            ],
        }

        mock_get.return_value = mock_response

        self.service.get_weather("London")

        _, kwargs = mock_get.call_args

        self.assertEqual(kwargs["params"]["q"], "London")
        self.assertNotIn("zip", kwargs["params"])

    @patch("weather_service.requests.get")
    def test_zip_code_request_uses_zip_parameter(self, mock_get):
        """Test that numeric postal-code searches use the zip parameter."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "name": "Hyderabad",
            "sys": {"country": "IN"},
            "main": {
                "temp": 28.0,
                "feels_like": 30.0,
                "humidity": 65,
            },
            "wind": {"speed": 4.0},
            "weather": [
                {
                    "main": "Clouds",
                    "description": "few clouds",
                    "icon": "02d",
                }
            ],
        }

        mock_get.return_value = mock_response

        self.service.get_weather("500001,IN")

        _, kwargs = mock_get.call_args

        self.assertEqual(kwargs["params"]["zip"], "500001,IN")
        self.assertNotIn("q", kwargs["params"])

    @patch("weather_service.requests.get")
    def test_location_not_found_404(self, mock_get):
        """Test handling of a 404 location-not-found response."""
        mock_response = MagicMock()
        mock_response.status_code = 404

        mock_get.return_value = mock_response

        with self.assertRaises(LocationNotFoundError):
            self.service.get_weather("NonExistentCityXYZ123")

    @patch("weather_service.requests.get")
    def test_invalid_api_key_401(self, mock_get):
        """Test handling of an unauthorized API response."""
        mock_response = MagicMock()
        mock_response.status_code = 401

        mock_get.return_value = mock_response

        with self.assertRaises(InvalidAPIKeyError):
            self.service.get_weather("London")

    @patch("weather_service.requests.get")
    def test_rate_limit_429(self, mock_get):
        """Test handling of API rate limiting."""
        mock_response = MagicMock()
        mock_response.status_code = 429

        mock_get.return_value = mock_response

        with self.assertRaises(WeatherError):
            self.service.get_weather("London")

    @patch("weather_service.requests.get")
    def test_server_error_500(self, mock_get):
        """Test handling of an OpenWeatherMap server error."""
        mock_response = MagicMock()
        mock_response.status_code = 500

        mock_get.return_value = mock_response

        with self.assertRaises(WeatherError):
            self.service.get_weather("London")

    @patch("weather_service.requests.get")
    def test_network_timeout(self, mock_get):
        """Test handling of request timeout."""
        mock_get.side_effect = requests.exceptions.Timeout(
            "Request timed out"
        )

        with self.assertRaises(NetworkError):
            self.service.get_weather("Paris")

    @patch("weather_service.requests.get")
    def test_network_connection_error(self, mock_get):
        """Test handling of connection errors."""
        mock_get.side_effect = requests.exceptions.ConnectionError(
            "DNS failure"
        )

        with self.assertRaises(NetworkError):
            self.service.get_weather("Tokyo")

    @patch("weather_service.requests.get")
    def test_malformed_weather_response(self, mock_get):
        """Test handling of an incomplete API response."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "name": "London",
            "sys": {"country": "GB"},
            # Missing main, wind, and weather data
        }

        mock_get.return_value = mock_response

        with self.assertRaises(WeatherError):
            self.service.get_weather("London")

    @patch("weather_service.requests.get")
    def test_request_configuration(self, mock_get):
        """Test that API requests use expected configuration."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "name": "London",
            "sys": {"country": "GB"},
            "main": {
                "temp": 20.0,
                "feels_like": 19.0,
                "humidity": 60,
            },
            "wind": {"speed": 2.0},
            "weather": [
                {
                    "main": "Clear",
                    "description": "clear sky",
                    "icon": "01d",
                }
            ],
        }

        mock_get.return_value = mock_response

        self.service.get_weather("London")

        _, kwargs = mock_get.call_args

        self.assertEqual(
            kwargs["timeout"],
            self.service.timeout,
        )

        self.assertEqual(
            kwargs["params"]["appid"],
            "valid_dummy_api_key",
        )

        self.assertEqual(
            kwargs["params"]["units"],
            "metric",
        )


if __name__ == "__main__":
    unittest.main()