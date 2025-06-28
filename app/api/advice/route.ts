import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { ForecastResponse } from "../../types/forecast";

export async function POST(req: NextRequest) {
	try {
		const weatherData: ForecastResponse = await req.json();
		const AIAPIKEY = process.env.OPEN_AI_API_KEY!; // サーバー専用のkeyなのでNEXT_PUBLIC_は付けない
		const openai = new OpenAI({
			apiKey: AIAPIKEY,
		});
		
		const completion = await openai.chat.completions.create({
			model: 'gpt-4.1-mini',
			store: true,
			messages: [
			{
				role: 'system',
				content: `送られるJSONデータをもとに、現在の時刻から24時間分の
					天気、気温（最高気温、最低気温、体感気温）、湿度、降水確率、風の強さ, 気圧を考慮し、
					現時刻より出かける際の服装(傘の必要性の有無を含む)のアドバイスを200文字程度でしてください。
					予報の説明はせず、服装(傘の必要性の有無を含む)のアドバイスに専念してください。`,
			},
			{
				role: 'user',
				content: JSON.stringify(weatherData),
			},
			],
		});
		
		return NextResponse.json(completion);
	} catch (err: unknown) {
		console.error('API/advice error:', err);
		const message = err instanceof Error ? err.stack : String(err);
		return NextResponse.json(
		{ error: message },
		{ status: 500 }
		);
	}
	
}