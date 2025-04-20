/** 座標情報 */
export interface Coord {
    lon: number;  // 経度
    lat: number;  // 緯度
  }
  
  /** 天気配列の各要素 */
  export interface WeatherItem {
    id: number;           // 天気コード
    main: string;         // 天気グループ名（例: "Clouds"）
    description: string;  // 詳細説明（例: "曇りがち"）
    icon: string;         // アイコンコード（例: "04n"）
  }
  
  /** 温度や湿度などの主要気象データ */
  export interface Main {
    temp: number;        // 気温 (℃)
    feels_like: number;  // 体感温度 (℃)
    temp_min: number;    // 最低気温 (℃)
    temp_max: number;    // 最高気温 (℃)
    pressure: number;    // 気圧 (hPa)
    humidity: number;    // 湿度 (%)
    sea_level: number;   // 海面気圧 (hPa)
    grnd_level: number;  // 地表気圧 (hPa)
  }
  
  /** 風速・風向など */
  export interface Wind {
    speed: number;  // 風速 (m/s)
    deg: number;    // 風向 (度)
    gust: number;   // 瞬間最大風速 (m/s)
  }
  
  /** 雲量情報 */
  export interface Clouds {
    all: number;  // 雲の覆われ率 (%)
  }
  
  /** システム情報（日の出・日の入など） */
  export interface Sys {
    type: number;      // 内部コード
    id: number;        // ステーション ID
    country: string;   // 国コード (ISO 3166)
    sunrise: number;   // 日の出時刻 (Unix タイムスタンプ)
    sunset: number;    // 日の入時刻 (Unix タイムスタンプ)
  }
  
  /** API レスポンス全体 */
  export interface WeatherResponse {
    coord: Coord;
    weather: WeatherItem[];
    base: string;       // データ取得元（通常 "stations"）
    main: Main;
    visibility: number; // 視程 (m)
    wind: Wind;
    clouds: Clouds;
    dt: number;         // 観測時刻 (Unix タイムスタンプ)
    sys: Sys;
    timezone: number;   // UTC との時差 (秒)
    id: number;         // 場所の一意 ID
    name: string;       // 場所名
    cod: number;        // HTTP ステータスコード (200＝OK)
  }