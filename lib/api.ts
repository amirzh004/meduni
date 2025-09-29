// API integration layer for HR Bot Admin Panel
// OpenAPI 3.1.0 — строго под FastAPI

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.nusacorp.com"

// ---------- Interfaces ----------
export interface QuestionOut {
  id: number
  text: string
}

export interface QuestionCreate {
  text: string
}

export interface CandidateOut {
  user_id(user_id: any, status: string): unknown
  id: number
  name: string | null
  telegram_id: number
  status: string          
}

export interface CandidateCreate {
  name: string | null
  telegram_id: number
}

export interface AnswerOut {
  id: number
  question_id: number
  question_text: string
  answer: string
}

export interface AnswerCreate {
  telegram_id: number
  question_id: number
  answer: string
}

export interface AnalysisOut {
  user_id: number
  position: string
  score: number
  strengths: string
  weaknesses: string
}

export interface AdaptationOut {
  id: number
  // user_id: number
  name: string
  telegram_id: number
  // status: string
}

export interface AdaptationCreate {
  user_id: number
  status: string
}

// ---------- Generic request ----------
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API Error: ${response.status} ${response.statusText} → ${errText}`)
  }

  return await response.json()
}

// ---------- Questions ----------
export const questionsApi = {
  getAll: (): Promise<QuestionOut[]> => apiRequest("/questions"),
  create: (data: QuestionCreate): Promise<QuestionOut> =>
    apiRequest("/questions", { method: "POST", body: JSON.stringify(data) }),
  update: (qid: number, data: QuestionCreate): Promise<QuestionOut> =>
    apiRequest(`/questions/${qid}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (qid: number): Promise<void> =>
    apiRequest(`/questions/${qid}`, { method: "DELETE" }),
}
// ---------- Candidates ----------
export const candidatesApi = {
  getAll: (): Promise<CandidateOut[]> => apiRequest("/candidates"),
  create: (data: CandidateCreate): Promise<CandidateOut> =>
    apiRequest("/candidates", { method: "POST", body: JSON.stringify(data) }),
  getById: (uid: number): Promise<CandidateOut> =>
    apiRequest(`/candidates/${uid}`),
  getRecommended: (): Promise<AnalysisOut[]> =>
    apiRequest("/candidates/recommended"),
  analyze: (uid: number): Promise<AnalysisOut> =>
    apiRequest(`/candidates/${uid}/analyze`, { method: "POST" }),
  updateStatus: (uid: number, status: string): Promise<CandidateOut> =>
    apiRequest(`/candidates/${uid}/status?new_status=${status}`, {
      method: "PUT",
    }),
  delete: (uid: number): Promise<{ deleted: number }> =>
    apiRequest(`/candidates/${uid}`, { method: "DELETE" }),
}

// ---------- Answers ----------
export const answersApi = {
  create: (data: AnswerCreate): Promise<AnswerOut> =>
    apiRequest("/answers", { method: "POST", body: JSON.stringify(data) }),
  getByTelegramId: (telegramId: number): Promise<AnswerOut[]> =>
    apiRequest(`/answers/${telegramId}`),
  getAll: (): Promise<AnswerOut[]> => apiRequest("/answers"),
}

// ---------- Analysis ----------
export const analysisApi = {
  getByUserId: (uid: number): Promise<AnalysisOut> =>
    apiRequest(`/analysis/${uid}`),
}

// ---------- Adaptation ----------
export const adaptationApi = {
  getAll: (): Promise<AdaptationOut[]> => apiRequest("/adaptation"),
  create: (data: AdaptationCreate): Promise<AdaptationOut> =>
    apiRequest("/adaptation", { method: "POST", body: JSON.stringify(data) }),
  update: (aid: number, data: AdaptationCreate): Promise<AdaptationOut> =>
    apiRequest(`/adaptation/${aid}`, { method: "PUT", body: JSON.stringify(data) }),
}
