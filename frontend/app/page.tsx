"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Chat from "@/frontend/components/chat";
import WeatherWidget from "@/frontend/components/weather-widget";
import { getWeather } from "@/frontend/utils/weather";
import FileViewer from "@/frontend/components/file-viewer";

const Home = () => {
  const [weatherData, setWeatherData] = useState({});

  const functionCallHandler = async (call) => {
    if (call?.function?.name !== "get_weather") return;
    const args = JSON.parse(call.function.arguments);
    const data = getWeather(args.location);
    setWeatherData(data);
    return JSON.stringify(data);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
          <WeatherWidget {...weatherData} />
          <FileViewer />
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat functionCallHandler={functionCallHandler} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
