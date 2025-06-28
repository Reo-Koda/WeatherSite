"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { ForecastResponse } from "./types/forecast";
import { Location } from "./types/location"

export default function Home() {
  const WeatherAPIKEY = process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_KEY!; // ! は該当の変数にnullやundefindedが入らないことを示している

  const SECOUND = 1000; // 1 秒 = 1000 ミリ秒
  const MINUITE = 60; // 1 分 = 60 秒
  const HOUR = 60; // 1 時間 = 60 分
  const TO_BORDER = 1.5; // 1.5時間の設定
  const WEATHER_TOP = 0 // 予報データの wether 要素の先頭を指定するための定数
  const TO_PERCENT = 100 // 確率をパーセンテージで表示させるための定数
  const IMG_SIZE = 40 // 天気画像の大きさ
  const TRANS_JST = MINUITE*HOUR*9; // 9時間をUTCに足し日本標準時に変える

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [locations, setLocations] = useState<Location[]>([
    { name: "静岡大学浜松キャンパス", lat: 34.725385, lon: 137.718008, advice: "" },
    { name: "浜松駅",                lat: 34.703862, lon: 137.735160, advice: "" },
  ]);

  const [weatherData, setWeatherData] = useState<ForecastResponse[]>([]);
  const [adviceLoading, setAdviceLoading] = useState<boolean[]>([false, false]);

  const [nowTime, setNowTime] = useState<number | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Math.floor(Date.now() / 1000) + TRANS_JST);
    }, 1000);

    return () => clearInterval(interval);
  }, [TRANS_JST])

  useEffect(() => {
    if (!WeatherAPIKEY) return setErrorMsg("APIキー未設定");

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${ lat }&lon=${ lon }&appid=${ WeatherAPIKEY }&lang=ja&units=metric`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "取得失敗");
        return data as ForecastResponse;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(msg);
      }
    };

    const updateAll = async () => {
      try {
        const results = await Promise.all(
          locations.map(loc => fetchWeather(loc.lat, loc.lon))
        );
        setWeatherData(results);
        setErrorMsg(null);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : String(err));
      }
    };

    updateAll();
    const id = setInterval(updateAll, MINUITE * SECOUND);
    return () => clearInterval(id);
  }, [WeatherAPIKEY]);

  // 現在の時刻が3時間おきに表示される予報時刻のうち、近い時刻から天気予報を表示させる
  const permissibleTime = MINUITE*HOUR*TO_BORDER;
  const listCnt = (index: number) => {
    if (!nowTime) return 0;
    return weatherData[index].list.findIndex(item => item.dt + permissibleTime > nowTime)
  }
  
  const formatUnixTime = (unixSeconds: number) => {
    // ミリ秒に変換
    const date = new Date(unixSeconds * SECOUND);
    //「時:分」の形式に整形
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC"
    });
  };
  
  const getAdvice = async (index: number) => {
    if (weatherData.length === 0) return;
    setAdviceLoading(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    try {
      const res = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( weatherData[index] ),
      });

      if (!res.ok) {
        throw new Error(`サーバーエラー: ${ res.status }`);
      }

      const data = await res.json();

      const content = data.choices?.[0]?.message?.content;
      if (typeof content === "string") {
        setLocations(prev => {
          return prev.map(
            (loc, i) => i === index ? { ...loc, advice: content } : loc
          );
        });
      } else {
        throw new Error("予期しないレスポンス形式");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setAdviceLoading(prev => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
    }
  }
  
  return (
    <>
    <header className={ styles.title }>
      <h1>静岡大学浜松キャンパス<br />天気予報</h1>
      <p>現在の時刻: { nowTime && formatUnixTime(nowTime) }</p>
    </header>
    { errorMsg && <p>{ errorMsg }</p> }
    <main className={ styles.mainContainer }>
      { locations.map((city, index) => (
        <section key={ index }>
          <h3>{ city.name }</h3>
          { weatherData[index] &&
            <>
            <p>日の出時刻: { formatUnixTime(weatherData[index].city.sunrise + TRANS_JST) } / 日の入り時刻: { formatUnixTime(weatherData[index].city.sunset + TRANS_JST) }</p>
            
            <div className={ styles.timeline }>
              { Array.from({ length: 9 }, (_, i) => {
                const data = weatherData[index].list[listCnt(index) + i];
                var imgIcon = data.weather[WEATHER_TOP].icon;

                // 天気アイコンの修正
                const isDay = formatUnixTime(weatherData[index].city.sunrise + TRANS_JST) < formatUnixTime(data.dt) && formatUnixTime(weatherData[index].city.sunset + TRANS_JST) > formatUnixTime(data.dt)
                if (imgIcon.includes('d') && !isDay) {
                  imgIcon = imgIcon.replace('d', 'n');
                } else if (imgIcon.includes('n') && isDay) {
                  imgIcon = imgIcon.replace('n', 'd');
                }
                
                const imgSrc = `https://openweathermap.org/img/wn/${ imgIcon }@2x.png`;
                return (
                  <div className={ styles.timeBlock } key={ i }>
                    <div>{ data.dt_txt }</div>
                    <div>{ data.weather[WEATHER_TOP].description }</div>
                    <div className={ styles.imgBox }>
                      { imgSrc && <Image src={ imgSrc } alt={ imgSrc } width={ IMG_SIZE } height={ IMG_SIZE } /> }
                    </div>
                    <div>体感温度 { data.main.feels_like }℃</div>
                    <div>湿度 { data.main.humidity }%</div>
                    <div>降水確率 { data.pop * TO_PERCENT }%</div>
                    <div>風速 { data.wind.speed }m/s</div>
                    <div>最大瞬間風速 { data.wind.gust }m/s</div>
                    <div>気圧 { data.main.pressure }hPa</div>
                  </div>
                );
              }) }
            </div>
            <h4>外出の際の注意</h4>
            { locations[index].advice === "" ?
              <button onClick={() => getAdvice(index) }>{ adviceLoading[index] ? `アドバイスを取得中...` : `アドバイスを表示する` }</button>
              :
              <p>{ locations[index].advice }</p>
            }
            </>
          }
        </section>
      )) }

    </main>
    </>
  );
}
