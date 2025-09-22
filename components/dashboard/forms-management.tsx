"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, BarChart3, Loader2 } from "lucide-react"
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
      setAnalysis(res)
    } catch (err: any) {
      if (err.message.includes("400")) {
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

  if (loading) return <div className="p-6">Загрузка…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Анкеты кандидатов</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.telegram_id}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" onClick={() => openView(c)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Просмотр
                  </Button>
                  <Button onClick={() => runAnalysis(c)} disabled={analyzing}>
                    {analyzing && selected?.id === c.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <BarChart3 className="mr-2 h-4 w-4" />
                    )}
                    Анализ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Просмотр ответов */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ответы кандидата {selected?.name}</DialogTitle>
            <DialogDescription>Сохранённые ответы</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {answers.length === 0 ? (
              <div>Ответов нет</div>
            ) : (
              answers.map(a => (
                <div key={a.id} className="border rounded p-2">
                  <div className="text-xs text-gray-500">Вопрос: {a.question_text}</div>
                  <div>{a.answer}</div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Результат анализа */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Результат анализа {selected?.name}</DialogTitle>
          </DialogHeader>
          {analyzing ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Идёт анализ…
            </div>
          ) : analysisError ? (
            <div className="text-red-600">{analysisError}</div>
          ) : analysis ? (
            <div className="space-y-2">
              <div><b>Позиция:</b> {analysis.position}</div>
              <div><b>Оценка:</b> {Math.round(analysis.score)}%</div>
              <div><b>Сильные стороны:</b> {analysis.strengths}</div>
              <div><b>Слабые стороны:</b> {analysis.weaknesses}</div>
            </div>
          ) : (
            <div className="text-gray-500">Нет данных анализа</div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
