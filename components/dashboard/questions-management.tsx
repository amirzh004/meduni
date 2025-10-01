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
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslation } from "@/lib/language"
import { Plus, Edit, Trash2, FileText, CheckCircle2, AlertTriangle, Archive } from "lucide-react"

type QuestionWithStatus = QuestionOut & { 
  status?: "new" | "edited" | "archived" | "default"
  isSelected?: boolean
}

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
      setQuestions(data.map(q => ({ ...q, status: "default", isSelected: q.isSelected ?? false })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  async function handleAddQuestion() {
    if (!newQuestionText.trim()) return
    const created = await questionsApi.create({ text: newQuestionText.trim(), isSelected: true })
    const newQ: QuestionWithStatus = { ...created, status: "new" }
    setQuestions(prev => [...prev, newQ])
    setNewQuestionText("")
    setIsAddDialogOpen(false)

    // Через 10 секунд статус вернется к default
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

    // Авто-сброс edited → default
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

  async function handleToggleSelection(id: number, current: boolean) {
    try {
      const updated = await questionsApi.update(id, { isSelected: !current })
      setQuestions(prev =>
        prev.map(q => (q.id === id ? { ...q, isSelected: updated.isSelected } : q))
      )
    } catch (e) {
      console.error("Ошибка обновления статуса выбора", e)
    }
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

  if (loading) return <div className="p-6">Загрузка…</div>

  const selectedCount = questions.filter(q => q.isSelected).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("questionsTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("selectedQuestions")}: {selectedCount} {t("of")} {questions.length}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("addQuestion")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addNewQuestion")}</DialogTitle>
                <DialogDescription>{t("enterQuestionText")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label>{t("questionText")}</Label>
                <Input value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
                <Button onClick={handleAddQuestion}>{t("save")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("include")}</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>{t("questionText")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map(q => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Checkbox
                      checked={q.isSelected}
                      onCheckedChange={() => handleToggleSelection(q.id, q.isSelected ?? false)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                      #{q.id}
                    </span>
                  </TableCell>
                  <TableCell>{q.text}</TableCell>
                  <TableCell>{q.status ? statusLabels[q.status] : statusLabels.default}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" onClick={() => openEditDialog(q)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteQuestion(q.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editQuestion")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t("questionText")}</Label>
            <Input value={editText} onChange={e => setEditText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleEditQuestion}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
