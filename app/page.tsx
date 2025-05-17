"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { ForecastResponse } from "./types/forecast";

export default function Home() {
  const WeatherAPIKEY = process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_KEY!; // ! は該当の変数にnullやundefindedが入らないことを示している

  const [weatherData, setWeatherData] = useState<ForecastResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [advice, setAdvice] = useState('');

  const transJST = 60*60*9; // 9時間をUTCに足し日本標準時に変える
  const [nowTime, setNowTime] = useState<number | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Math.floor(Date.now() / 1000) + transJST);
    }, 1000);

    return () => clearInterval(interval);
  }, [transJST])

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
        const msg = error instanceof Error ? error.message : String(error);
        setErrorMsg(`通信エラー: ${msg}`);
      }
    };

    fetchWeather();
    const id = setInterval(fetchWeather, 60 * 1000);
    return () => clearInterval(id);
  }, [WeatherAPIKEY]);

  const permissibleTime = 60*60*1.5;
  const listCnt =
    weatherData && nowTime
      ? weatherData.list.findIndex(item => item.dt + permissibleTime > nowTime)
      : 0;
  
  const formatUnixTime = (unixSeconds: number) => {
    // ミリ秒に変換
    const date = new Date(unixSeconds * 1000);
    // 日本語ロケールで「時:分」の形式に整形
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Tokyo"  // 念のためタイムゾーンを指定
    });
  };
  
  const [adviceLoading, setAdviceLoading] = useState(false);
  const getAdvice = async () => {
    if (!weatherData) return;

    setAdviceLoading(true);
    try {
      const res = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weatherData }),
      });

      if (!res.ok) {
        throw new Error(`サーバーエラー: ${ res.status }`);
      }

      const data = await res.json();

      const content = data.choices?.[0]?.message?.content;
      if (typeof content === "string") {
        setAdvice(content);
      } else {
        throw new Error("予期しないレスポンス形式");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setAdviceLoading(false);
    }
  }
  
  return (
    <>
    <header className={ styles.title }>
      <h1>静岡大学浜松キャンパス<br />天気予報</h1>
    </header>
    { errorMsg && <p>{ errorMsg }</p> }
    <main className={ styles.mainContainer }>
      <h3>静岡大学浜松キャンパス</h3>
      { weatherData &&
        <>
        <p>日の出時刻: { formatUnixTime(weatherData.city.sunrise) } / 日の入り時刻: { formatUnixTime(weatherData.city.sunset) }</p>
        {/* <p>日の出時刻: { weatherData.city.sunrise } / 日の入り時刻: { weatherData.city.sunset }</p> */}
        </>
      }
      <div className={ styles.timeline }>
        { weatherData ?
          Array.from({ length: 9 }, (_, i) => {
            const data = weatherData.list[listCnt + i];
            const imgIcon = data.weather[0].icon;
            // 後で条件を正す
            if (imgIcon.includes('d')
              && weatherData.city.sunrise > data.dt && weatherData.city.sunset < data.dt) {
              imgIcon.replace('d', 'n');
            } else if (imgIcon.includes('n')
              && (weatherData.city.sunrise < data.dt || weatherData.city.sunset > data.dt)) {
              imgIcon.replace('n', 'd');
            }
            const imgSrc = `https://openweathermap.org/img/wn/${ imgIcon }@2x.png`;
            return (
              <div className={ styles.timeBlock } key={ i }>
                <div>{ data.dt_txt }</div>
                <div>{ data.weather[0].description }</div>
                <div>{ imgIcon }</div>
                <div className={ styles.imgBox }>
                  { imgSrc && <Image src={ imgSrc } alt={ imgSrc } width={ 40 } height={ 40 } /> }
                </div>
                <div>体感温度 { data.main.feels_like }℃</div>
                <div>湿度 { data.main.humidity }%</div>
                <div>降水確率 { data.pop * 100 }%</div>
                <div>風速 { data.wind.speed }m/s</div>
                <div>最大瞬間風速 { data.wind.gust }m/s</div>
                <div>気圧 { data.main.pressure }hPa</div>
              </div>
            );
          })
        :
          <p>Now Loading ...</p>
        }
      </div>
      <h4>外出の際の注意</h4>
      <button onClick={ getAdvice }>{ adviceLoading ? '取得中...' : 'アドバイスを取得' }</button>
      <p>{ advice }</p>
      {/* { weatherData ? <p>{ JSON.stringify(weatherData, null, 1) }</p> : <p>Now Loading ...</p> } */}
      
      <h3>浜松駅</h3>

    </main>
    </>
  );
}
