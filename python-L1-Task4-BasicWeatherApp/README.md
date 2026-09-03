# 🌤️ Python Weather Application

A complete, reliable, professional Python weather application that fetches real-time weather data from the OpenWeather API. The project provides both a rich Command-Line Interface (CLI) and a modern Desktop GUI built with Tkinter and Pillow.

---

## 📌 About

The Python Weather Application allows users to query real-time weather information for any location worldwide using city names (e.g., `Hyderabad`, `London, UK`) or numeric ZIP/postal codes (e.g., `500001, IN`, `90210, US`). 

It communicates with the OpenWeather API safely, parses data accurately, handles unit conversions, and presents comprehensive weather metrics in a clean, user-friendly layout.

---

## ✨ Features

- 🔎 **Flexible Location Search**  
  Search weather by city name, `City, CountryCode`, or numeric `ZIP, CountryCode`.

- 🌡️ **Detailed Weather Metrics**  
  Displays Location, Temperature (°C & °F), Feels-Like Temperature, Weather Condition, Description, Humidity (%), Pressure (hPa), Wind Speed (m/s, km/h, mph), Visibility (km/miles), Sunrise, and Sunset.

- 🌤️ **Dynamic Icons & Visual Aesthetics**  
  Downloads and displays high-resolution OpenWeather icons in the GUI and formatted emojis in the CLI.

- ⚡ **Non-Blocking Architecture**  
  GUI requests run asynchronously in background threads so the interface stays fluid and responsive.

- ⚠️ **Comprehensive Error Handling**  
  Friendly, informative error messages for missing/invalid API keys, unknown locations, empty inputs, network timeouts, rate limits, and server outages. No exposed tracebacks or raw API secrets.

- 🔐 **Secure Environment Configuration**  
  Uses `python-dotenv` to safely load `OPENWEATHER_API_KEY` from a local `.env` file.

- 🧪 **Complete Test Coverage**  
  Automated unit testing with `pytest` and `unittest` using mocks so tests run fast without exposing API keys or consuming quota.

---

## 🛠️ Technologies

- **Python 3.9+** — Core programming language
- **OpenWeather API** — Current weather data provider
- **Requests** — HTTP client for API communication
- **python-dotenv** — Secure environment variable management
- **Tkinter & ttk** — Desktop graphical user interface
- **Pillow (PIL)** — Weather icon rendering
- **Pytest** — Automated testing framework

---

## 📁 Project Structure

```text
experiment1/
│
├── app.py                    # Tkinter Desktop GUI interface
├── weather_service.py        # OpenWeather API service & CLI interface
├── test_app.py               # GUI unit tests (mocked requests)
├── test_weather_service.py   # Service & parser unit tests (mocked requests)
├── requirements.txt          # Third-party Python dependencies
├── .env.example              # Environment template (safe for git)
├── .env                      # Local environment file containing API key (git-ignored)
├── .gitignore                # Git exclusion rules
└── README.md                 # Project documentation
```

---

## 🚀 Installation

1. **Clone or Download the Project**:
   ```bash
   cd experiment1
   ```

2. **Create a Virtual Environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the Virtual Environment**:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

4. **Install Requirements**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

6. **Add OpenWeather API Key**:
   Open `.env` and paste your free API key from [OpenWeatherMap API](https://openweathermap.org/api):
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

---

## 💻 Running the Application

### 1. Desktop GUI Application
To launch the Tkinter graphical user interface:
```bash
python app.py
```

### 2. Command-Line Interface (CLI)
To run the interactive terminal interface:
```bash
python weather_service.py
```

---

## 🧪 Testing

To run the complete automated test suite without hitting external API limits:
```bash
pytest
```
Or using standard unittest:
```bash
python -m unittest discover
```

---

## 🔒 Security & Best Practices

- **Never commit `.env` to version control**: The `.env` file contains your private `OPENWEATHER_API_KEY` and is explicitly listed in `.gitignore`.
- **Use `.env.example` as a template**: Only commit `.env.example` containing dummy placeholder values to GitHub.
- **No hardcoded credentials**: The API key is always fetched at runtime via environment variables (`OPENWEATHER_API_KEY`).