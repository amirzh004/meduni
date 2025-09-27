"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { questionsApi, type QuestionOut } from "@/lib/api"
import { useTranslation } from "@/lib/language"
import { Plus, Edit, Trash2, FileText, CheckCircle2, AlertTriangle, Archive } from "lucide-react"

type QuestionWithStatus = QuestionOut & { status?: "new" | "edited" | "archived" | "default" }

export function QuestionsManagement() {
  const [questions, setQuestions] = useState<QuestionWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithStatus | null>(null)
  const [newQuestionText, setNewQuestionText] = useState("")
  const [editText, setEditText] = useState("")
  const { t } = useTranslation()

  async function loadQuestions() {
    setLoading(true)
    try {
      const data = await questionsApi.getAll()
      setQuestions(data.map(q => ({ ...q, status: "default" })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  async function handleAddQuestion() {
    if (!newQuestionText.trim()) return
    const created = await questionsApi.create({ text: newQuestionText.trim() })
    const newQ: QuestionWithStatus = { ...created, status: "new" }
    setQuestions(prev => [...prev, newQ])
    setNewQuestionText("")
    setIsAddDialogOpen(false)

    // 🔄 Авто-сброс статуса new → default через 10 секунд
    setTimeout(() => {
      setQuestions(prev =>
        prev.map(q =>
          q.id === newQ.id && q.status === "new" ? { ...q, status: "default" } : q
        )
      )
    }, 10000)
  }

  function openEditDialog(q: QuestionWithStatus) {
    setEditingQuestion(q)
    setEditText(q.text)
    setIsEditDialogOpen(true)
  }

  async function handleEditQuestion() {
    if (!editingQuestion) return
    const updated = await questionsApi.update(editingQuestion.id, { text: editText })
    setQuestions(prev =>
      prev.map(q =>
        q.id === updated.id ? { ...updated, status: "edited" } : q
      )
    )
    setIsEditDialogOpen(false)

    // 🔄 Авто-сброс edited → default через 10 секунд
    setTimeout(() => {
      setQuestions(prev =>
        prev.map(q =>
          q.id === updated.id && q.status === "edited" ? { ...q, status: "default" } : q
        )
      )
    }, 10000)
  }

  async function handleDeleteQuestion(id: number) {
    await questionsApi.delete(id)
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, status: "archived" } : q))
    )
  }

  const statusLabels: Record<string, JSX.Element> = {
    new: (
      <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" /> {t("new")}
      </Badge>
    ),
    edited: (
      <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" /> {t("edited")}
      </Badge>
    ),
    archived: (
      <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
        <Archive className="h-3 w-3" /> {t("archived")}
      </Badge>
    ),
    default: (
      <Badge variant="outline">{t("default")}</Badge>
    ),
  }

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-card/80">
        <CardHeader>
          <CardTitle>{t("questionsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">{t("loadingQuestions")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-card/80 animate-pulse-glow">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/20 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            {t("questionsTitle")}
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hover:scale-105 transition-transform duration-200 shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                {t("addQuestion")}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect">
              <DialogHeader>
                <DialogTitle className="gradient-text">{t("addNewQuestion")}</DialogTitle>
                <DialogDescription>{t("enterQuestionText")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="new-question-text">{t("questionText")}</Label>
                <Input
                  id="new-question-text"
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  placeholder={t("questionPlaceholder")}
                  className="border-primary/20 focus:border-primary/50"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
                <Button onClick={handleAddQuestion} className="hover:scale-105 transition-transform duration-200">
                  {t("save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-hidden rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{t("id")}</TableHead>
                  <TableHead className="font-semibold">{t("questionText")}</TableHead>
                  <TableHead className="font-semibold">{t("status")}</TableHead>
                  <TableHead className="font-semibold text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, index) => (
                  <TableRow
                    key={q.id}
                    className="hover:bg-muted/30 transition-colors duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TableCell>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                        #{q.id}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm leading-relaxed">{q.text}</p>
                    </TableCell>
                    <TableCell>
                      {q.status ? statusLabels[q.status] : statusLabels.default}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(q)}
                          className="hover:scale-105 transition-transform duration-200 hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="hover:scale-105 transition-transform duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="bg-card border border-border shadow-lg rounded-lg">
  <DialogHeader>
    <DialogTitle className="gradient-text">{t("editQuestion")}</DialogTitle>
    <DialogDescription>{t("changeQuestionText")}</DialogDescription>
  </DialogHeader>
  <div className="space-y-4">
    <Label htmlFor="edit-question-text">{t("questionText")}</Label>
    <Input
      id="edit-question-text"
      value={editText}
      onChange={e => setEditText(e.target.value)}
      className="border-primary/20 focus:border-primary/50"
    />
  </div>
  <DialogFooter>
    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
      {t("cancel")}
    </Button>
    <Button onClick={handleEditQuestion} className="hover:scale-105 transition-transform duration-200">
      {t("save")}
    </Button>
  </DialogFooter>
</DialogContent>
      </Dialog>
    </div>
  )
}
