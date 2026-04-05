import { google } from '@ai-sdk/google'

export const geminiModel = google(process.env.MODEL_NAME || 'gemini-2.5-flash')
