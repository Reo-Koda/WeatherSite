"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { WeatherResponse } from "./types/weather";

export default function Home() {
  const WeatherAPIKEY = process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_KEY!;

  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!WeatherAPIKEY) return setErrorMsg("APIキー未設定");

    const fetchWeather = async () => {
      const lat = 34.725385;
      const lon = 137.718008;
  
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${ lat }&lon=${ lon }&appid=${ WeatherAPIKEY }&lang=ja&units=metric`);
  
        const data = await res.json();
        if (res.ok) {
          setWeatherData(data);
        } else {
          setErrorMsg(`エラー: ${ data.message  }`);
        }
      } catch (error: any) {
        setErrorMsg(`通信エラー: ${ error.message  }`);
      }
    };

    fetchWeather();
  }, [WeatherAPIKEY]);

  useEffect(() => {
    if (!weatherData) return;
    setImgSrc(`https://openweathermap.org/img/wn/${ weatherData.weather[0].icon }@2x.png`);
  }, [weatherData]);

  return (
    <>
    <header className={ styles.title }>
      <h1>静岡大学浜松キャンパス<br />天気予報</h1>
    </header>
    { errorMsg && <p>{ errorMsg }</p> }
    <main>
      <h3>静岡大学浜松キャンパス</h3>
      { weatherData ? <p>{ weatherData.weather[0].main }</p> : <p>Now Loading ...</p> }
      { weatherData ? <p>{ weatherData.weather[0].description }</p> : <p>Now Loading ...</p> }

      { imgSrc && <Image src={ imgSrc } alt={ imgSrc } width={ 40 } height={ 40 }/> }
      
      <h3>浜松駅</h3>

    </main>
    </>
  );
}
