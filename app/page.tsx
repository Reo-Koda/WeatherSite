"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { ForecastResponse } from "./types/forecast";

export default function Home() {
  const WeatherAPIKEY = process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_KEY!;

  const [weatherData, setWeatherData] = useState<ForecastResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const transJST = 60*60*9; // 9時間をUTCに足し日本標準時に変える
  const [nowTime, setNowTime] = useState<number | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Math.floor(Date.now() / 1000) + transJST);
    }, 1000);

    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    if (!WeatherAPIKEY) return setErrorMsg("APIキー未設定");

    const fetchWeather = async () => {
      const lat = 34.725385;
      const lon = 137.718008;
  
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${ lat }&lon=${ lon }&appid=${ WeatherAPIKEY }&lang=ja&units=metric`);
  
        const data = await res.json();
        if (res.ok) {
          setWeatherData(data);
        } else {
          setErrorMsg(`エラー: ${ data.message  }`);
        }
      } catch (error: unknown) {
        // any を使わずにエラーメッセージを取り出す
        const msg = error instanceof Error ? error.message : String(error);
        setErrorMsg(`通信エラー: ${msg}`);
      }
    };

    fetchWeather();
    const id = setInterval(fetchWeather, 60 * 1000);
    return () => clearInterval(id);
  }, [WeatherAPIKEY]);

  const listCnt =
    weatherData && nowTime
      ? weatherData.list.findIndex(item => item.dt > nowTime)
      : 0;

  return (
    <>
    <header className={ styles.title }>
      <h1>静岡大学浜松キャンパス<br />天気予報</h1>
    </header>
    { errorMsg && <p>{ errorMsg }</p> }
    <main className={ styles.mainContainer }>
      <h3>静岡大学浜松キャンパス</h3>
      <div className={ styles.timeline }>
        { weatherData ?
          Array.from({ length: 9 }, (_, i) => {
            const data = weatherData.list[listCnt + i];
            const imgSrc = `https://openweathermap.org/img/wn/${ data.weather[0].icon }@2x.png`;
            return (
              <div className={ styles.timeBlock } key={ i }>
                <div>{ data.dt_txt }</div>
                <div>{ data.weather[0].description }</div>
                <div className={ styles.imgBox }>
                  { imgSrc && <Image src={ imgSrc } alt={ imgSrc } width={ 40 } height={ 40 } /> }
                </div>
                <div>体感温度 { data.main.feels_like }℃</div>
                <div>湿度 { data.main.humidity }%</div>
                <div>降水確率 { data.pop }%</div>
                <div>風速 { data.wind.speed }m/s</div>
                <div>気圧 { data.main.pressure }hPa</div>
              </div>
            );
          })
        :
          <p>Now Loading ...</p>
        }
      </div>
      {/* { weatherData ? <p>{ JSON.stringify(weatherData, null, 1) }</p> : <p>Now Loading ...</p> } */}
      
      <h3>浜松駅</h3>

    </main>
    </>
  );
}
