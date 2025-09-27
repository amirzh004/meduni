"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/language"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye, BarChart3, Loader2, Calendar, User } from "lucide-react"
import { candidatesApi, answersApi, type CandidateOut, type AnswerOut, type AnalysisOut } from "@/lib/api"


export function FormsManagement() {
  const [forms, setForms] = useState<CandidateOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewOpen, setViewOpen] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  const [selected, setSelected] = useState<CandidateOut | null>(null)
  const [answers, setAnswers] = useState<AnswerOut[]>([])
  const [analysis, setAnalysis] = useState<AnalysisOut | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const { t } = useTranslation()

  useEffect(() => {
    (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await candidatesApi.getAll()
        setForms(data)
      } catch (err: any) {
        setError("Ошибка загрузки списка кандидатов")
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function openView(c: CandidateOut) {
    setSelected(c)
    setError(null)
    try {
      const a = await answersApi.getByTelegramId(c.telegram_id)
      setAnswers(a)
    } catch (err: any) {
      setAnswers([])
      setError("Не удалось загрузить ответы кандидата")
      console.error(err)
    }
    setViewOpen(true)
  }

  async function runAnalysis(c: CandidateOut) {
    setSelected(c)
    setAnalysis(null)
    setAnalysisError(null)
    setAnalyzing(true)

    try {
      const res = await candidatesApi.analyze(c.id)

      // 🔥 обновляем запись, а не добавляем дубликат
      setForms(prev =>
        prev.map(f =>
          f.id === c.id
            ? { ...f, position: res.position, score: res.score, strengths: res.strengths, weaknesses: res.weaknesses }
            : f
        )
      )

      setAnalysis(res)
    } catch (err: any) {
      if (err.message?.includes("400")) {
        setAnalysisError("Анкета неполная или заполнена неправильно")
      } else {
        setAnalysisError("Ошибка при анализе анкеты. Попробуйте позже.")
      }
      console.error(err)
    } finally {
      setAnalyzing(false)
      setAnalysisOpen(true)
    }
  }

  if (loading) return <div className="p-6">{t("loadingForms")}</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-card/80 animate-pulse-glow">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <User className="h-6 w-6 text-primary" />
          {t("formsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-hidden rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">{t("id")}</TableHead>
                <TableHead className="font-semibold">{t("candidateName")}</TableHead>
                <TableHead className="font-semibold">{t("telegramId")}</TableHead>
                <TableHead className="font-semibold text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map(c => (
                <TableRow key={c.id} className="hover:bg-muted/30 transition-colors duration-200 animate-fade-in">
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {c.telegram_id}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => openView(c)}
                      className="hover:scale-105 transition-transform duration-200 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("viewAnswers")}
                    </Button>
                    <Button
                      onClick={() => runAnalysis(c)}
                      disabled={analyzing && selected?.id === c.id}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      {analyzing && selected?.id === c.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BarChart3 className="mr-2 h-4 w-4" />
                      )}
                      {t("runAnalysis")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Просмотр ответов */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {t("candidateAnswers")}: {selected?.name}
            </DialogTitle>
            <DialogDescription>Telegram: {selected?.telegram_id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {answers.length === 0 ? (
              <div className="text-muted-foreground">{t("noAnswers")}</div>
            ) : (
              answers.map((a, index) => (
                <div key={a.id} className="space-y-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <h4 className="font-medium text-sm text-primary">{a.question_text}</h4>
                  <p className="text-sm text-muted-foreground bg-gradient-to-r from-muted to-muted/50 p-4 rounded-lg border border-border/50">
                    {a.answer}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Анализ */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {t("candidateAnalysis")}: {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {analyzing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground font-medium">{t("analyzingCandidate")}</p>
            </div>
          ) : analysisError ? (
            <div className="text-red-600">{analysisError}</div>
          ) : analysis ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
                <h4 className="font-medium text-primary">{t("recommendedPosition")}:</h4>
                <p className="text-lg font-semibold text-foreground">{analysis.position}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <h4 className="font-medium">{t("analysisScore")}:</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl font-bold gradient-text">{Math.round(analysis.score)}</span>
                  <Badge
                    className={`px-3 py-1 text-sm font-medium ${
                      analysis.score >= 70
                        ? "bg-green-100 text-green-800"
                        : analysis.score >= 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {analysis.score >= 70 ? "🟢 Отлично" : analysis.score >= 50 ? "🟡 Хорошо" : "🔴 Требует внимания"}
                  </Badge>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">{t("strengths")}:</h4>
                  <ul className="space-y-2">
                    {analysis.strengths.split(",").map((s, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        {s.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-3">{t("weaknesses")}:</h4>
                  <ul className="space-y-2">
                    {analysis.weaknesses.split(",").map((w, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">⚠</span>
                        {w.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">{t("noAnalysisData")}</div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
