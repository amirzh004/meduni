"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useCallback } from "react"

export type Language = "ru" | "kz"

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: "ru",
      setLanguage: (language) => set({ language }),
    }),
    { name: "hr-language-storage" },
  ),
)

// Translation dictionaries
export const translations = {
  ru: {
    // Header
    welcome: "Добро пожаловать",
    logout: "Выйти",

    // Navigation
    recommendedCandidates: "Кандидаты",
    questions: "Вопросы",
    forms: "Анкеты",
    adaptation: "Адаптация",

    inviteInterviewBtn: "Пригласить на собеседование",
    inviteAdaptationBtn: "Пригласить на адаптацию",
    interviewFailedBtn: "Собеседование не пройдено",
    adaptationSuccessBtn: "Прошел адаптацию",
    adaptationFailedBtn: "Не прошел адаптацию",
    interviewFailedLabel: "Собеседование провалено",
    adaptationPassedLabel: "Адаптация пройдена",
    adaptationFailedLabel: "Адаптация провалена",
    delete: "Удалить",
    unknownStatus: "Неизвестный статус",

    // Recommended Candidates Page
    candidatesTitle: "Рекомендованные кандидаты",
    candidatesSubtitle: "Кандидаты с оценкой 70% и выше",
    name: "Имя",
    position: "Позиция",
    email: "Email",
    phone: "Телефон",
    score: "Score",
    status: "Статус",
    actions: "Действие",
    analyze: "Анализировать",
    excellent: "Отлично",
    good: "Хорошо",
    average: "Средне",
    strengths: "Сильные стороны",
    weaknesses: "Слабые стороны",
    inviteToInterview: "Пригласить на собеседование",
    loadingCandidates: "Загрузка кандидатов...",

    // Questions Management
    questionsTitle: "Управление вопросами",
    questionsSubtitle: "Создание и редактирование вопросов для интервью",
    addQuestion: "Добавить вопрос",
    question: "Текст вопроса",
    questionText: "Текст вопроса",
    category: "Категория",
    edit: "Редактировать",
    delete: "Удалить",
    save: "Сохранить",
    cancel: "Отмена",
    add: "Добавить",
    loadingQuestions: "Загрузка вопросов...",
    addNewQuestion: "Добавить новый вопрос",
    enterQuestionText: "Введите текст нового вопроса для анкеты кандидатов",
    questionPlaceholder: "Введите текст вопроса...",
    editQuestion: "Редактировать вопрос",
    changeQuestionText: "Измените текст вопроса",
    include: "Включить",
    selectedQuestions: "Выбрано вопросов",
    of: "из",

    // Forms Management
    formsTitle: "Анкеты кандидатов",
    formsSubtitle: "Просмотр ответов кандидатов и их анализ",
    candidate: "Кандидат",
    candidateName: "Имя кандидата",
    telegramId: "Telegram ID",
    submittedAt: "Дата подачи",
    viewAnswers: "Просмотреть",
    runAnalysis: "Анализировать",
    loadingForms: "Загрузка анкет...",
    candidateAnswers: "Ответы кандидата",
    candidateAnalysis: "Анализ кандидата",
    analyzingCandidate: "Анализируем кандидата...",
    recommendedPosition: "Рекомендуемая позиция",
    analysisScore: "Оценка",
    needsAttention: "Требует внимания",
    actions: "Действия",
    savedAnswers: "Сохранённые ответы",
    noAnswers: "Ответов нет",
    noAnalysisData: "Нет данных анализа",
    // дубли ключей допустимы — берётся последнее значение:
    // question: "Вопрос",
    // strengths: "Сильные стороны",
    // weaknesses: "Слабые стороны",

    // Adaptation Tracking
    adaptationTitle: "Отслеживание адаптации сотрудников",
    adaptationSubtitle: "Мониторинг процесса адаптации сотрудников",
    employee: "Сотрудник",
    employeeName: "Имя сотрудника",
    department: "Отдел",
    startDate: "Дата начала",
    progress: "Прогресс",
    adaptationStatus: "Статус адаптации",
    updateStatus: "Изменить статус",
    changeStatus: "Изменить статус адаптации",
    newStatus: "Новый статус",
    selectStatus: "Выберите статус",
    loadingData: "Загрузка данных...",

    // Status labels
    internship: "На стажировке",
    adaptationProcess: "Проходит адаптацию",
    completed: "Прошёл адаптацию",

    // Common
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успешно",
    close: "Закрыть",
    id: "ID",
  },
  kz: {
    // Header
    welcome: "Қош келдіңіз",
    logout: "Шығу",

    // Navigation
    recommendedCandidates: "Ұсынылған кандидаттар",
    questions: "Сұрақтар",
    forms: "Сауалнамалар",
    adaptation: "Бейімделу",

    // Recommended Candidates Page
    candidatesTitle: "Ұсынылған кандидаттар",
    candidatesSubtitle: "70% және одан жоғары бағалы кандидаттар",
    name: "Аты",
    position: "Лауазым",
    email: "Email",
    phone: "Телефон",
    score: "Баға",
    status: "Мәртебе",
    actions: "Әрекеттер",
    analyze: "Талдау",
    excellent: "Өте жақсы",
    good: "Жақсы",
    average: "Орташа",
    strengths: "Күшті жақтары",
    weaknesses: "Әлсіз жақтары",
    inviteToInterview: "Сұхбатқа шақыру",
    loadingCandidates: "Кандидаттар жүктелуде...",

    // Questions Management
    questionsTitle: "Сұрақтарды басқару",
    questionsSubtitle: "Сұхбат сұрақтарын жасау және өңдеу",
    addQuestion: "Сұрақ қосу",
    question: "Сұрақ мәтіні",
    questionText: "Сұрақ мәтіні",
    category: "Санат",
    edit: "Өңдеу",
    delete: "Жою",
    save: "Сақтау",
    cancel: "Болдырмау",
    add: "Қосу",
    loadingQuestions: "Сұрақтар жүктелуде...",
    addNewQuestion: "Жаңа сұрақ қосу",
    enterQuestionText: "Кандидаттар сауалнамасы үшін жаңа сұрақ мәтінін енгізіңіз",
    questionPlaceholder: "Сұрақ мәтінін енгізіңіз...",
    editQuestion: "Сұрақты өңдеу",
    changeQuestionText: "Сұрақ мәтінін өзгертіңіз",
    include: "Қосу",
    selectedQuestions: "Таңдалған сұрақтар",
    of: "дан",

    // Forms Management
    formsTitle: "Кандидаттар сауалнамалары",
    formsSubtitle: "Кандидаттардың жауаптарын қарау және талдау",
    candidate: "Кандидат",
    candidateName: "Кандидат аты",
    telegramId: "Telegram ID",
    submittedAt: "Жіберілген күні",
    viewAnswers: "Қарау",
    runAnalysis: "Талдау",
    loadingForms: "Сауалнамалар жүктелуде...",
    candidateAnswers: "Кандидат жауаптары",
    candidateAnalysis: "Кандидат талдауы",
    analyzingCandidate: "Кандидат талдануда...",
    recommendedPosition: "Ұсынылған лауазым",
    analysisScore: "Баға",
    needsAttention: "Назар аудару қажет",

    // Adaptation Tracking
    adaptationTitle: "Қызметкерлердің бейімделуін қадағалау",
    adaptationSubtitle: "Қызметкерлердің бейімделу процесін бақылау",
    employee: "Қызметкер",
    employeeName: "Қызметкер аты",
    department: "Бөлім",
    startDate: "Басталу күні",
    progress: "Прогресс",
    adaptationStatus: "Бейімделу мәртебесі",
    updateStatus: "Мәртебені өзгерту",
    changeStatus: "Бейімделу мәртебесін өзгерту",
    newStatus: "Жаңа мәртебе",
    selectStatus: "Мәртебені таңдаңыз",
    loadingData: "Деректер жүктелуде...",

    inviteInterviewBtn: "Сұхбатқа шақыру",
    inviteAdaptationBtn: "Бейімделуге шақыру",
    interviewFailedBtn: "Сұхбаттан өтпеді",
    adaptationSuccessBtn: "Бейімделуді өтті",
    adaptationFailedBtn: "Бейімделуден өтпеді",
    interviewFailedLabel: "Сұхбат сәтсіз аяқталды",
    adaptationPassedLabel: "Бейімделу сәтті өтті",
    adaptationFailedLabel: "Бейімделу сәтсіз",
    delete: "Жою",
    unknownStatus: "Белгісіз мәртебе",

    // Status labels
    internship: "Тәжірибеде",
    adaptationProcess: "Бейімделуде",
    completed: "Бейімделуді аяқтады",

    // Common
    loading: "Жүктелуде...",
    error: "Қате",
    success: "Сәтті",
    close: "Жабу",
    id: "ID",
  },
} as const

// ---------- Типобезопасные помощники ----------

// Приводим словарь к типу “язык -> произвольный набор ключей”
type Dict = Record<Language, Record<string, string>>
const DICT = translations as unknown as Dict

// Хук для компонентов (ВЫЗЫВАТЬ СТРОГО НА ВЕРХНЕМ УРОВНЕ КОМПОНЕНТА!)
export const useTranslation = () => {
  const language = useLanguage((s) => s.language)

  const t = useCallback((key: string): string => {
    return DICT[language][key] ?? DICT.ru[key] ?? key
  }, [language])

  return { t, language }
}

// Функция для вызовов ВНЕ React-компонентов (без хуков)
export const tNow = (key: string, lang?: Language): string => {
  const l = lang ?? useLanguage.getState().language
  return DICT[l][key] ?? DIICT.ru[key] ?? key
}
