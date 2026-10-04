# Weather App 🌤️

A modern, responsive live weather dashboard built with React, Vite, and Material UI, powered by the OpenWeatherMap API.

🔗 **Live Demo:** [weatherapp-self-theta.vercel.app](https://weatherapp-self-theta.vercel.app)

---

## ✨ Features

- 🔍 **City Search:** Instant real-time weather search with autocomplete and quick-pick popular cities.
- 📍 **Geolocation Support:** Automatic or one-click weather detection for current location.
- ⛅ **Dynamic Weather Themes:** Adaptive UI theme changing dynamically based on weather conditions (Clear, Clouds, Rain, Snow, Thunderstorm, Mist) and Day/Night mode.
- 📅 **5-Day Weather Forecast:** Daily forecast with high/low temperatures and weather conditions.
- 🕒 **Hourly Forecast:** 24-hour weather breakdown.
- 💨 **Detailed Metrics:** Wind speed, humidity, feels-like temperature, pressure, visibility, and UV index.
- 📱 **Fully Responsive:** Optimized for desktop, tablet, and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite
- **UI Components:** Material UI (MUI), Emotion, Material Icons
- **Fonts & Styling:** Plus Jakarta Sans, Custom CSS Variables & Animations
- **API:** OpenWeatherMap API

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rohiit5ingh/Weather-app.git
   cd Weather-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up your OpenWeatherMap API key:
   Create a `.env` file in the root directory:
   ```env
   VITE_WEATHER_API_KEY=your_openweather_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 📦 Deployment

This project is configured for one-click deployment on platforms like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/):

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
