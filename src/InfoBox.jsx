import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import CompressIcon from '@mui/icons-material/Compress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NavigationIcon from '@mui/icons-material/Navigation';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import './InfoBox.css';

// Helper: Format unix timestamp with timezone offset to 12h time
const formatUnixTime = (timestamp, timezoneOffset = 0) => {
    if (!timestamp) return '--:--';
    const date = new Date((timestamp + timezoneOffset) * 1000);
    const hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
};

// Helper: Format local date based on timezone offset
const formatCurrentDate = (timezoneOffset = 0) => {
    const date = new Date(Date.now() + timezoneOffset * 1000);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getUTCDay()]}, ${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
};

// Helper: Get compass direction from degrees
const getWindDirection = (deg) => {
    if (deg === undefined || deg === null) return '';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
};

// Helper: Capitalize words
const capitalize = (str) => {
    if (!str) return '';
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function InfoBox({ info, isLoading, error, onRetry }) {
    // 1. Loading Skeleton State
    if (isLoading) {
        return (
            <div className="dashboard-container">
                {/* Hero Skeleton */}
                <div className="hero-card hero-skeleton">
                    <div className="hero-left">
                        <Skeleton variant="text" width={180} height={38} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                        <Skeleton variant="text" width={140} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                        <Skeleton variant="rounded" width={110} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mt: 2 }} />
                    </div>
                    <div className="hero-center">
                        <Skeleton variant="circular" width={90} height={90} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                        <Skeleton variant="text" width={160} height={80} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
                    </div>
                </div>

                {/* Metrics Grid Skeleton */}
                <div className="metrics-grid">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <div key={idx} className="metric-card">
                            <Skeleton variant="text" width={90} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Skeleton variant="text" width={110} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.12)', my: 1 }} />
                            <Skeleton variant="rounded" width="100%" height={8} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                        </div>
                    ))}
                </div>

                {/* Forecast Skeleton */}
                <div className="forecast-section">
                    <Skeleton variant="text" width={160} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    <div className="forecast-cards-row">
                        {[1, 2, 3, 4, 5].map((idx) => (
                            <div key={idx} className="forecast-card-skeleton">
                                <Skeleton variant="text" width={60} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                                <Skeleton variant="circular" width={44} height={44} sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />
                                <Skeleton variant="text" width={80} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 2. Error State
    if (error && !info) {
        return (
            <div className="dashboard-container state-card-wrapper">
                <Card className="feedback-card">
                    <div className="feedback-icon-wrapper error-glow">
                        <CloudQueueIcon className="state-icon error-icon-color" />
                    </div>
                    <Typography variant="h5" className="state-title">
                        Location Unavailable
                    </Typography>
                    <Typography variant="body2" className="state-description">
                        {error || 'Unable to retrieve weather data for this location. Please check your spelling and try again.'}
                    </Typography>
                    {onRetry && (
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={onRetry}
                            className="state-action-btn"
                        >
                            Try Again
                        </Button>
                    )}
                </Card>
            </div>
        );
    }

    // 3. Empty State
    if (!info) {
        return (
            <div className="dashboard-container state-card-wrapper">
                <Card className="feedback-card">
                    <div className="feedback-icon-wrapper default-glow">
                        <CloudQueueIcon className="state-icon" />
                    </div>
                    <Typography variant="h5" className="state-title">
                        Discover Live Weather
                    </Typography>
                    <Typography variant="body2" className="state-description">
                        Search for any city above or pick one of the popular cities to view real-time weather conditions, 24-hour hourly outlook, and 5-day forecasts.
                    </Typography>
                </Card>
            </div>
        );
    }

    // Normalized data with fallback compatibility
    const humidity = info.humidity ?? info.humadity ?? 0;
    const feelsLike = info.feelslike ?? info.temp ?? 0;
    const temp = info.temp ?? 0;
    const tempMin = info.tempMin ?? temp;
    const tempMax = info.tempMax ?? temp;
    const weatherDesc = capitalize(info.weather || info.condition || 'Clear');
    const iconCode = info.icon || '01d';
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    const timezone = info.timezone || 0;
    const pressure = info.pressure || 1013;
    const visibility = info.visibility || 10;
    const windSpeed = info.windSpeed || 0;
    const windDeg = info.windDeg || 0;
    const sunriseTime = formatUnixTime(info.sunrise, timezone);
    const sunsetTime = formatUnixTime(info.sunset, timezone);
    const currentDate = formatCurrentDate(timezone);
    const forecastList = info.forecast || [];
    const hourlyList = info.hourly || [];

    // Computed contextual statuses
    const humidityStatus = humidity > 65 ? 'High Humidity' : humidity < 30 ? 'Dry Air' : 'Comfortable';
    const visibilityStatus = visibility >= 10 ? 'Crystal Clear' : visibility >= 5 ? 'Good Clarity' : 'Low Visibility';
    const windStatus = windSpeed > 8 ? 'Breezy & Windy' : windSpeed > 3 ? 'Moderate Breeze' : 'Calm Wind';
    const pressureStatus = pressure > 1020 ? 'High Pressure' : pressure < 1005 ? 'Low Pressure' : 'Normal Barometric';
    const feelsDiff = Math.round((feelsLike - temp) * 10) / 10;
    const feelsStatus =
        feelsDiff > 1
            ? `Warmer (+${feelsDiff}°)`
            : feelsDiff < -1
            ? `Cooler (${feelsDiff}°)`
            : 'Similar to actual';

    return (
        <main className="dashboard-container">
            {/* HERO SECTION: Current Weather */}
            <section className="hero-card" aria-label="Current Weather">
                <div className="hero-left">
                    <div className="location-badge-row">
                        <h2 className="location-city">{info.city}</h2>
                        {info.country && <span className="country-chip">{info.country}</span>}
                    </div>
                    <p className="local-time">{currentDate}</p>

                    <div className="condition-badge">
                        <span className="condition-indicator-dot"></span>
                        <span className="condition-text">{weatherDesc}</span>
                    </div>

                    <div className="temp-range-pill">
                        <span className="range-item">
                            <span className="range-label">H:</span> {Math.round(tempMax)}°C
                        </span>
                        <span className="range-divider">•</span>
                        <span className="range-item">
                            <span className="range-label">L:</span> {Math.round(tempMin)}°C
                        </span>
                    </div>
                </div>

                <div className="hero-right">
                    <div className="weather-icon-container">
                        <img
                            src={iconUrl}
                            alt={weatherDesc}
                            className="hero-weather-icon"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                    <div className="temp-display">
                        <span className="main-temp">{Math.round(temp)}</span>
                        <span className="temp-unit">°C</span>
                    </div>
                    <div className="feels-like-pill">
                        <span>Feels like <strong>{Math.round(feelsLike)}°C</strong></span>
                    </div>
                </div>
            </section>

            {/* 6 WEATHER DETAIL CARDS */}
            <section className="metrics-section" aria-label="Weather Details">
                <div className="metrics-grid">
                    {/* Humidity */}
                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">HUMIDITY</span>
                            <div className="metric-icon-bg">
                                <WaterDropIcon className="metric-icon" sx={{ color: '#38bdf8' }} />
                            </div>
                        </div>
                        <div className="metric-value-row">
                            <span className="metric-value">{humidity}</span>
                            <span className="metric-unit">%</span>
                        </div>
                        <div className="progress-bar-track">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(5, humidity))}%`, backgroundColor: '#38bdf8' }}
                            ></div>
                        </div>
                        <span className="metric-status">{humidityStatus}</span>
                    </div>

                    {/* Wind */}
                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">WIND</span>
                            <div className="metric-icon-bg">
                                <AirIcon className="metric-icon" sx={{ color: '#818cf8' }} />
                            </div>
                        </div>
                        <div className="metric-value-row">
                            <span className="metric-value">{windSpeed}</span>
                            <span className="metric-unit">m/s</span>
                        </div>
                        <div className="wind-direction-info">
                            <NavigationIcon
                                className="wind-arrow-icon"
                                style={{ transform: `rotate(${windDeg}deg)` }}
                            />
                            <span>{getWindDirection(windDeg)} ({windDeg}°)</span>
                        </div>
                        <span className="metric-status">{windStatus}</span>
                    </div>

                    {/* Pressure */}
                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">PRESSURE</span>
                            <div className="metric-icon-bg">
                                <CompressIcon className="metric-icon" sx={{ color: '#a78bfa' }} />
                            </div>
                        </div>
                        <div className="metric-value-row">
                            <span className="metric-value">{pressure}</span>
                            <span className="metric-unit">hPa</span>
                        </div>
                        <div className="progress-bar-track">
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${Math.min(100, Math.max(10, ((pressure - 970) / (1050 - 970)) * 100))}%`,
                                    backgroundColor: '#a78bfa',
                                }}
                            ></div>
                        </div>
                        <span className="metric-status">{pressureStatus}</span>
                    </div>

                    {/* Visibility */}
                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">VISIBILITY</span>
                            <div className="metric-icon-bg">
                                <VisibilityIcon className="metric-icon" sx={{ color: '#34d399' }} />
                            </div>
                        </div>
                        <div className="metric-value-row">
                            <span className="metric-value">{visibility}</span>
                            <span className="metric-unit">km</span>
                        </div>
                        <div className="progress-bar-track">
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${Math.min(100, Math.max(10, (visibility / 10) * 100))}%`,
                                    backgroundColor: '#34d399',
                                }}
                            ></div>
                        </div>
                        <span className="metric-status">{visibilityStatus}</span>
                    </div>

                    {/* Feels Like */}
                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">FEELS LIKE</span>
                            <div className="metric-icon-bg">
                                <ThermostatIcon className="metric-icon" sx={{ color: '#f87171' }} />
                            </div>
                        </div>
                        <div className="metric-value-row">
                            <span className="metric-value">{Math.round(feelsLike)}</span>
                            <span className="metric-unit">°C</span>
                        </div>
                        <div className="metric-subtext">
                            Actual: {Math.round(temp)}°C
                        </div>
                        <span className="metric-status">{feelsStatus}</span>
                    </div>

                    {/* Sunrise & Sunset */}
                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">SUN SCHEDULE</span>
                            <div className="metric-icon-bg">
                                <WbTwilightIcon className="metric-icon" sx={{ color: '#fbbf24' }} />
                            </div>
                        </div>
                        <div className="sun-schedule-row">
                            <div className="sun-item">
                                <span className="sun-label">Sunrise</span>
                                <span className="sun-time">{sunriseTime}</span>
                            </div>
                            <div className="sun-divider"></div>
                            <div className="sun-item">
                                <span className="sun-label">Sunset</span>
                                <span className="sun-time">{sunsetTime}</span>
                            </div>
                        </div>
                        <span className="metric-status">Solar cycle</span>
                    </div>
                </div>
            </section>

            {/* HOURLY FORECAST SECTION (24 Hours) */}
            {hourlyList.length > 0 && (
                <section className="section-block" aria-label="Hourly Forecast">
                    <div className="section-header">
                        <div className="section-title-wrapper">
                            <AccessTimeIcon className="section-header-icon" />
                            <h3 className="section-title">Hourly Forecast</h3>
                        </div>
                        <span className="section-subtitle">Next 24 Hours</span>
                    </div>

                    <div className="hourly-scroll-container">
                        {hourlyList.map((hour, idx) => (
                            <div key={idx} className="hourly-card">
                                <span className="hourly-time">{hour.time}</span>
                                <img
                                    src={`https://openweathermap.org/img/wn/${hour.icon}@2x.png`}
                                    alt={hour.condition}
                                    className="hourly-icon"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <span className="hourly-temp">{hour.temp}°</span>
                                {hour.pop > 0 ? (
                                    <span className="hourly-pop">💧 {hour.pop}%</span>
                                ) : (
                                    <span className="hourly-condition">{hour.condition}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 5-DAY FORECAST SECTION */}
            {forecastList.length > 0 && (
                <section className="section-block" aria-label="5-Day Forecast">
                    <div className="section-header">
                        <div className="section-title-wrapper">
                            <CalendarMonthIcon className="section-header-icon" />
                            <h3 className="section-title">5-Day Forecast</h3>
                        </div>
                        <span className="section-subtitle">Upcoming Trend</span>
                    </div>

                    <div className="forecast-grid">
                        {forecastList.map((dayItem, idx) => (
                            <div key={idx} className="forecast-card">
                                <div className="forecast-day-date">
                                    <span className="forecast-day-name">{dayItem.day}</span>
                                    <span className="forecast-date">{dayItem.date}</span>
                                </div>
                                <div className="forecast-icon-wrapper">
                                    <img
                                        src={`https://openweathermap.org/img/wn/${dayItem.icon}@2x.png`}
                                        alt={dayItem.condition}
                                        className="forecast-weather-icon"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <span className="forecast-condition">{dayItem.condition}</span>
                                </div>
                                <div className="forecast-temp-range">
                                    <span className="forecast-max-temp">{dayItem.tempMax}°</span>
                                    <div className="forecast-mini-bar">
                                        <div className="forecast-mini-bar-fill"></div>
                                    </div>
                                    <span className="forecast-min-temp">{dayItem.tempMin}°</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}