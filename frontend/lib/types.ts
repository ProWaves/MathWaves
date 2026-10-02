export interface TranslateRequest {
  formula: string;
  language: string;
  mode: string;
}

export interface TranslateResponse {
  latex: string;
  code: string;
  language: string;
  derivative?: string;
  integral?: string;
}

export interface PlotRequest {
  formula: string;
  kind: string;
  x_min: number;
  x_max: number;
}

export interface PlotResponse {
  figure_json: {
    data: any[];
    layout: any;
  };
  latex: string;
  kind: string;
}

export interface ExplainResponse {
  explanation: string;
}