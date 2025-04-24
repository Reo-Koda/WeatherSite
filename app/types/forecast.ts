import { Coord, WeatherItem, Main, Wind, Clouds } from "./weather";

/** 時間帯ごとの予報データ */
export interface ForecastItem {
  dt: number;               // Unix タイムスタンプ
  main: Main;               // 気温・湿度など
  weather: WeatherItem[];   // 天気情報配列
  clouds: Clouds;           // 雲量
  wind: Wind;               // 風速・風向
  visibility: number;       // 視程 (m)
  pop: number;              // 降水確率 (0〜1)
  sys: { pod: "d" | "n" };  // 日中／夜の区分
  dt_txt: string;           // フォーマット済日時文字列
}

/** 都市情報 */
export interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;   // UTC との時差 (秒)
  sunrise: number;    // 日の出 (Unix)
  sunset: number;     // 日の入 (Unix)
}

/** 5日間／3時間ごとの予報 API レスポンス */
export interface ForecastResponse {
  cod: string;             // ステータスコード (文字列)
  message: number;         // 内部メッセージ（通常 0）
  cnt: number;             // list 配列の要素数
  list: ForecastItem[];    // 各時間帯の予報データ
  city: City;              // 都市情報
}