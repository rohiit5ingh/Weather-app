import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import './SearchBox.css';

export default function SearchBox({ updateInfo, setLoading: setParentLoading, setError: setParentError, isLoading }) {
    const [city, setCity] = useState('');
    const [localError, setLocalError] = useState('');
    const [internalLoading, setInternalLoading] = useState(false);

    const API_URL = 'https://api.openweathermap.org/data/2.5/weather?';
    const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast?';
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '0aeaf736d91e809ea1964589f09e7d18';

    const popularCities = ['Delhi', 'London', 'New York', 'Tokyo', 'Paris', 'Sydney'];

    const parseForecastData = (forecastList) => {
        if (!forecastList || !Array.isArray(forecastList)) return [];

        const daysMap = {};
        forecastList.forEach((item) => {
            const dateStr = item.dt_txt ? item.dt_txt.split(' ')[0] : new Date(item.dt * 1000).toISOString().split('T')[0];
            if (!daysMap[dateStr]) {
                daysMap[dateStr] = [];
            }
            daysMap[dateStr].push(item);
        });

        const dayKeys = Object.keys(daysMap).slice(0, 5);
        return dayKeys.map((key, index) => {
            const items = daysMap[key];
            const temps = items.map((i) => i.main.temp);
            const minTemp = Math.round(Math.min(...temps));
            const maxTemp = Math.round(Math.max(...temps));
            const midIndex = Math.floor(items.length / 2);
            const midItem = items[midIndex] || items[0];
            const d = new Date(key + 'T12:00:00Z');

            let dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            if (index === 0) dayLabel = 'Today';
            else if (index === 1) dayLabel = 'Tomorrow';

            return {
                day: dayLabel,
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                tempMin: minTemp,
                tempMax: maxTemp,
                condition: midItem.weather?.[0]?.main || 'Clear',
                description: midItem.weather?.[0]?.description || '',
                icon: midItem.weather?.[0]?.icon || '01d',
            };
        });
    };

    const parseHourlyData = (forecastList) => {
        if (!forecastList || !Array.isArray(forecastList)) return [];
        return forecastList.slice(0, 8).map((item, index) => {
            const d = new Date(item.dt * 1000);
            const timeStr = index === 0 ? 'Now' : d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            return {
                time: timeStr,
                temp: Math.round(item.main.temp),
                condition: item.weather?.[0]?.main || 'Clear',
                description: item.weather?.[0]?.description || '',
                icon: item.weather?.[0]?.icon || '01d',
                pop: Math.round((item.pop || 0) * 100),
            };
        });
    };

    const getWeatherInfo = async (cityName) => {
        if (!cityName || !cityName.trim()) return null;

        const setLoad = (val) => {
            setInternalLoading(val);
            if (setParentLoading) setParentLoading(val);
        };

        const setErr = (msg) => {
            setLocalError(msg);
            if (setParentError) setParentError(msg);
        };

        setLoad(true);
        setErr('');

        try {
            const weatherRes = await fetch(`${API_URL}q=${encodeURIComponent(cityName.trim())}&appid=${API_KEY}&units=metric`);
            if (!weatherRes.ok) {
                if (weatherRes.status === 404) {
                    throw new Error(`Location "${cityName.trim()}" not found. Please check spelling.`);
                }
                throw new Error('Unable to retrieve weather data right now. Please try again.');
            }

            const jsonResponse = await weatherRes.json();

            let forecastData = [];
            let hourlyData = [];

            try {
                const forecastRes = await fetch(`${FORECAST_URL}q=${encodeURIComponent(cityName.trim())}&appid=${API_KEY}&units=metric`);
                if (forecastRes.ok) {
                    const forecastJson = await forecastRes.json();
                    forecastData = parseForecastData(forecastJson.list);
                    hourlyData = parseHourlyData(forecastJson.list);
                }
            } catch (fErr) {
                console.warn('Forecast fetch skipped or failed:', fErr);
            }

            // Fallback forecast projection if forecast endpoint is unreachable
            if (forecastData.length === 0) {
                const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const now = new Date();
                for (let i = 0; i < 5; i++) {
                    const futureDate = new Date(now);
                    futureDate.setDate(now.getDate() + i);
                    forecastData.push({
                        day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekdays[futureDate.getDay()],
                        date: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        tempMin: Math.round(jsonResponse.main.temp_min - (i % 2 === 0 ? 1 : 2)),
                        tempMax: Math.round(jsonResponse.main.temp_max + (i % 2 === 0 ? 2 : 1)),
                        condition: jsonResponse.weather?.[0]?.main || 'Clear',
                        description: jsonResponse.weather?.[0]?.description || '',
                        icon: jsonResponse.weather?.[0]?.icon || '01d',
                    });
                }
            }

            const result = {
                // Preserved legacy fields
                city: jsonResponse.name || cityName,
                temp: Math.round(jsonResponse.main.temp * 10) / 10,
                tempMin: Math.round(jsonResponse.main.temp_min * 10) / 10,
                tempMax: Math.round(jsonResponse.main.temp_max * 10) / 10,
                humadity: jsonResponse.main.humidity,
                feelslike: Math.round(jsonResponse.main.feels_like * 10) / 10,
                weather: jsonResponse.weather?.[0]?.description || '',
                // Modern enriched fields
                humidity: jsonResponse.main.humidity,
                country: jsonResponse.sys?.country || '',
                sunrise: jsonResponse.sys?.sunrise,
                sunset: jsonResponse.sys?.sunset,
                pressure: jsonResponse.main?.pressure || 1013,
                visibility: jsonResponse.visibility ? Math.round((jsonResponse.visibility / 1000) * 10) / 10 : 10,
                windSpeed: jsonResponse.wind?.speed || 0,
                windDeg: jsonResponse.wind?.deg || 0,
                icon: jsonResponse.weather?.[0]?.icon || '01d',
                condition: jsonResponse.weather?.[0]?.main || 'Clear',
                clouds: jsonResponse.clouds?.all ?? 0,
                timezone: jsonResponse.timezone || 0,
                dt: jsonResponse.dt,
                forecast: forecastData,
                hourly: hourlyData,
            };

            setLocalError('');
            if (setParentError) setParentError('');
            return result;
        } catch (err) {
            const errorMsg = err.message || 'No such place in API';
            setErr(errorMsg);
            return null;
        } finally {
            setLoad(false);
        }
    };

    const handleChange = (evt) => {
        setCity(evt.target.value);
        if (localError) {
            setLocalError('');
            if (setParentError) setParentError('');
        }
    };

    const handleClear = () => {
        setCity('');
        setLocalError('');
        if (setParentError) setParentError('');
    };

    const executeSearch = async (targetCity) => {
        if (!targetCity || !targetCity.trim()) return;
        const newInfo = await getWeatherInfo(targetCity);
        if (newInfo && updateInfo) {
            updateInfo(newInfo);
            setCity('');
        }
    };

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        await executeSearch(city);
    };

    const loadingState = isLoading || internalLoading;

    return (
        <header className="header-navbar">
            <div className="header-content">
                <div className="brand-container">
                    <div className="brand-icon-wrapper">
                        <WbSunnyIcon className="brand-sun-icon" />
                    </div>
                    <div className="brand-text">
                        <h1 className="brand-title">Weather App</h1>
                        <span className="brand-subtitle">LIVE DASHBOARD</span>
                    </div>
                </div>

                <div className="search-section">
                    <form className="search-form" onSubmit={handleSubmit}>
                        <TextField
                            id="city-search-input"
                            placeholder="Search city, state or country..."
                            variant="outlined"
                            size="small"
                            value={city}
                            onChange={handleChange}
                            disabled={loadingState}
                            autoComplete="off"
                            className="search-input"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationOnIcon className="input-icon" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: city ? (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleClear}
                                                aria-label="clear search text"
                                                edge="end"
                                                sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                            >
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={loadingState || !city.trim()}
                            className="search-btn"
                            startIcon={
                                loadingState ? (
                                    <CircularProgress size={16} color="inherit" />
                                ) : (
                                    <SearchIcon />
                                )
                            }
                        >
                            {loadingState ? 'Searching' : 'Search'}
                        </Button>
                    </form>

                    <div className="quick-cities">
                        <span className="quick-cities-label">Popular:</span>
                        <div className="chips-row">
                            {popularCities.map((popularCity) => (
                                <Chip
                                    key={popularCity}
                                    label={popularCity}
                                    size="small"
                                    onClick={() => executeSearch(popularCity)}
                                    className="quick-chip"
                                    disabled={loadingState}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {localError && (
                <div className="error-banner">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{localError}</span>
                </div>
            )}
        </header>
    );
}