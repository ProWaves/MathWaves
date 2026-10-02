import axios from "axios";
import type {
  TranslateRequest,
  TranslateResponse,
  PlotRequest,
  PlotResponse,
  ExplainResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

export async function translateFormula(
  req: TranslateRequest
): Promise<TranslateResponse> {
  const { data } = await api.post<TranslateResponse>("/api/translate", req);
  return data;
}

export async function plotFormula(req: PlotRequest): Promise<PlotResponse> {
  const { data } = await api.post<PlotResponse>("/api/plot", req);
  return data;
}

export async function explainFormula(formula: string): Promise<ExplainResponse> {
  const { data } = await api.post<ExplainResponse>("/api/explain", { formula });
  return data;
}