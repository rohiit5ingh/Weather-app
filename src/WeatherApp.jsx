import { useState, useEffect, useCallback } from 'react';
import SearchBox from './SearchBox';
import InfoBox from './InfoBox';

// Determines the visual theme based on live weather condition & day/night
const getWeatherTheme = (info) => {
    if (!info) return 'theme-clear-day';
    const condition = (info.condition || info.weather || '').toLowerCase();
    const icon = (info.icon || '').toLowerCase();
    const isNight = icon.includes('n');

    if (condition.includes('thunder') || condition.includes('storm')) {
        return 'theme-thunderstorm';
    }
    if (condition.includes('rain') || condition.includes('drizzle')) {
        return 'theme-rain';
    }
    if (condition.includes('snow') || condition.includes('sleet') || condition.includes('ice')) {
        return 'theme-snow';
    }
    if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze') || condition.includes('smoke') || condition.includes('dust')) {
        return 'theme-mist';
    }
    if (isNight) {
        return 'theme-clear-night';
    }
    if (condition.includes('cloud')) {
        return 'theme-clouds';
    }
    return 'theme-clear-day';
};

export default function WeatherApp() {
    const [weatherInfo, setWeatherInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const updateInfo = (newInfo) => {
        if (newInfo) {
            setWeatherInfo(newInfo);
            setError('');
        }
    };

    const fetchCityWeather = useCallback(async (cityName = 'Delhi') => {
        setIsLoading(true);
        setError('');
        const API_URL = 'https://api.openweathermap.org/data/2.5/weather?';
        const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast?';
        const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '0aeaf736d91e809ea1964589f09e7d18';

        try {
            const weatherRes = await fetch(`${API_URL}q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`);
            if (!weatherRes.ok) {
                throw new Error('Could not load weather data');
            }
            const jsonResponse = await weatherRes.json();

            let forecastData = [];
            let hourlyData = [];

            try {
                const forecastRes = await fetch(`${FORECAST_URL}q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`);
                if (forecastRes.ok) {
                    const fJson = await forecastRes.json();

                    // Group into 5 days
                    const daysMap = {};
                    fJson.list.forEach((item) => {
                        const dateStr = item.dt_txt ? item.dt_txt.split(' ')[0] : new Date(item.dt * 1000).toISOString().split('T')[0];
                        if (!daysMap[dateStr]) daysMap[dateStr] = [];
                        daysMap[dateStr].push(item);
                    });

                    const dayKeys = Object.keys(daysMap).slice(0, 5);
                    forecastData = dayKeys.map((key, index) => {
                        const items = daysMap[key];
                        const temps = items.map((i) => i.main.temp);
                        const minTemp = Math.round(Math.min(...temps));
                        const maxTemp = Math.round(Math.max(...temps));
                        const midItem = items[Math.floor(items.length / 2)] || items[0];
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

                    // 8 hourly items (next 24 hours)
                    hourlyData = fJson.list.slice(0, 8).map((item, index) => {
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
                }
            } catch (fErr) {
                console.warn('Forecast fetch skipped:', fErr);
            }

            setWeatherInfo({
                // Preserved legacy fields
                city: jsonResponse.name || cityName,
                temp: Math.round(jsonResponse.main.temp * 10) / 10,
                tempMin: Math.round(jsonResponse.main.temp_min * 10) / 10,
                tempMax: Math.round(jsonResponse.main.temp_max * 10) / 10,
                humadity: jsonResponse.main.humidity,
                feelslike: Math.round(jsonResponse.main.feels_like * 10) / 10,
                weather: jsonResponse.weather?.[0]?.description || 'haze',
                // Modern enriched fields
                humidity: jsonResponse.main.humidity,
                country: jsonResponse.sys?.country || 'IN',
                sunrise: jsonResponse.sys?.sunrise,
                sunset: jsonResponse.sys?.sunset,
                pressure: jsonResponse.main?.pressure || 1013,
                visibility: jsonResponse.visibility ? Math.round((jsonResponse.visibility / 1000) * 10) / 10 : 10,
                windSpeed: jsonResponse.wind?.speed || 0,
                windDeg: jsonResponse.wind?.deg || 0,
                clouds: jsonResponse.clouds?.all ?? 0,
                icon: jsonResponse.weather?.[0]?.icon || '01d',
                condition: jsonResponse.weather?.[0]?.main || 'Clear',
                timezone: jsonResponse.timezone || 0,
                dt: jsonResponse.dt,
                forecast: forecastData,
                hourly: hourlyData,
            });
        } catch (err) {
            console.error('Fetch failed:', err);
            setError(err.message || 'Failed to load weather data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadInitial = async () => {
            const API_URL = 'https://api.openweathermap.org/data/2.5/weather?';
            const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast?';
            const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '0aeaf736d91e809ea1964589f09e7d18';

            try {
                const weatherRes = await fetch(`${API_URL}q=Delhi&appid=${API_KEY}&units=metric`);
                if (!weatherRes.ok) throw new Error('Could not load initial weather data');
                const jsonResponse = await weatherRes.json();

                let forecastData = [];
                let hourlyData = [];

                try {
                    const forecastRes = await fetch(`${FORECAST_URL}q=Delhi&appid=${API_KEY}&units=metric`);
                    if (forecastRes.ok) {
                        const fJson = await forecastRes.json();
                        const daysMap = {};
                        fJson.list.forEach((item) => {
                            const dateStr = item.dt_txt ? item.dt_txt.split(' ')[0] : new Date(item.dt * 1000).toISOString().split('T')[0];
                            if (!daysMap[dateStr]) daysMap[dateStr] = [];
                            daysMap[dateStr].push(item);
                        });

                        const dayKeys = Object.keys(daysMap).slice(0, 5);
                        forecastData = dayKeys.map((key, index) => {
                            const items = daysMap[key];
                            const temps = items.map((i) => i.main.temp);
                            const minTemp = Math.round(Math.min(...temps));
                            const maxTemp = Math.round(Math.max(...temps));
                            const midItem = items[Math.floor(items.length / 2)] || items[0];
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

                        hourlyData = fJson.list.slice(0, 8).map((item, index) => {
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
                    }
                } catch (fErr) {
                    console.warn('Initial forecast fetch skipped:', fErr);
                }

                if (isMounted) {
                    setWeatherInfo({
                        city: jsonResponse.name || 'Delhi',
                        temp: Math.round(jsonResponse.main.temp * 10) / 10,
                        tempMin: Math.round(jsonResponse.main.temp_min * 10) / 10,
                        tempMax: Math.round(jsonResponse.main.temp_max * 10) / 10,
                        humadity: jsonResponse.main.humidity,
                        feelslike: Math.round(jsonResponse.main.feels_like * 10) / 10,
                        weather: jsonResponse.weather?.[0]?.description || 'haze',
                        humidity: jsonResponse.main.humidity,
                        country: jsonResponse.sys?.country || 'IN',
                        sunrise: jsonResponse.sys?.sunrise,
                        sunset: jsonResponse.sys?.sunset,
                        pressure: jsonResponse.main?.pressure || 1013,
                        visibility: jsonResponse.visibility ? Math.round((jsonResponse.visibility / 1000) * 10) / 10 : 10,
                        windSpeed: jsonResponse.wind?.speed || 0,
                        windDeg: jsonResponse.wind?.deg || 0,
                        clouds: jsonResponse.clouds?.all ?? 0,
                        icon: jsonResponse.weather?.[0]?.icon || '01d',
                        condition: jsonResponse.weather?.[0]?.main || 'Clear',
                        timezone: jsonResponse.timezone || 0,
                        dt: jsonResponse.dt,
                        forecast: forecastData,
                        hourly: hourlyData,
                    });
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Failed to load weather data');
                    setIsLoading(false);
                }
            }
        };

        loadInitial();
        return () => {
            isMounted = false;
        };
    }, []);

    const currentTheme = getWeatherTheme(weatherInfo);

    return (
        <div className={`weather-app-wrapper ${currentTheme}`}>
            <SearchBox
                updateInfo={updateInfo}
                setLoading={setIsLoading}
                setError={setError}
                isLoading={isLoading}
            />
            <InfoBox
                info={weatherInfo}
                isLoading={isLoading}
                error={error}
                onRetry={() => fetchCityWeather('Delhi')}
            />
            <footer className="app-footer">
                <p className="footer-text">
                    Weather App • Live Meteorological Intelligence powered by <span>OpenWeather</span>
                </p>
            </footer>
        </div>
    );
}