import React from 'react';
import { CloudSun, Sun, CloudRain, MapPin } from 'lucide-react';
import { getWidgetsDataSync } from '../../services/dataService.js';
import styles from '../../styles/gui/Widgets.module.css';

/* Note: Static weather snapshot sourced from data layer (demoData.json); no external weather API is required */

const ICON_MAP = {
  CloudSun,
  Sun,
  CloudRain,
};

export default function WeatherWidget() {
  const widgetsData = getWidgetsDataSync();
  const weather = widgetsData?.weather ?? {
    location: 'Himachal Pradesh',
    temperature: '18°',
    condition: 'Partly Cloudy',
    high: '22°',
    low: '11°',
    hourly: [
      { time: '10 AM', temp: '18°', icon: 'CloudSun' },
      { time: '11 AM', temp: '19°', icon: 'Sun' },
      { time: '12 PM', temp: '21°', icon: 'Sun' },
      { time: '1 PM',  temp: '22°', icon: 'CloudSun' },
      { time: '2 PM',  temp: '20°', icon: 'CloudRain' },
    ],
  };

  return (
    <div className={`${styles.glassCard} ${styles.weatherWidget}`} title={`${weather.location} Weather`}>
      <div className={styles.weatherTop}>
        <div>
          <div className={styles.weatherLocation}>
            <MapPin size={11} aria-hidden="true" />
            <span>{weather.location}</span>
          </div>
          <div className={styles.weatherTempMain}>{weather.temperature}</div>
        </div>

        <div className={styles.weatherCondition}>
          <div className={styles.weatherIconLarge}>
            <CloudSun size={28} />
          </div>
          <div className={styles.weatherDesc}>{weather.condition}</div>
          <div className={styles.weatherRange}>H:{weather.high} · L:{weather.low}</div>
        </div>
      </div>

      <div className={styles.weatherHourly}>
        {(weather.hourly || []).map((item) => {
          const Icon = ICON_MAP[item.icon] || CloudSun;
          return (
            <div key={item.time} className={styles.weatherHourCol}>
              <span className={styles.weatherHourTime}>{item.time}</span>
              <Icon size={14} color="rgba(255,255,255,0.85)" />
              <span className={styles.weatherHourTemp}>{item.temp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
