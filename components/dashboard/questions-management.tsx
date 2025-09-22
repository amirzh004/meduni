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
import { questionsApi, type QuestionOut } from "@/lib/api"

export function QuestionsManagement() {
  const [questions, setQuestions] = useState<QuestionOut[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionOut | null>(null)
  const [newQuestionText, setNewQuestionText] = useState("")
  const [editText, setEditText] = useState("")

  async function loadQuestions() {
    setLoading(true)
    try {
      const data = await questionsApi.getAll()
      setQuestions(data)
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
    setQuestions(prev => [...prev, created])
    setNewQuestionText("")
    setIsAddDialogOpen(false)
  }

  function openEditDialog(q: QuestionOut) {
    setEditingQuestion(q)
    setEditText(q.text)
    setIsEditDialogOpen(true)
  }

  async function handleEditQuestion() {
    if (!editingQuestion) return
    const updated = await questionsApi.update(editingQuestion.id, { text: editText })
    setQuestions(prev => prev.map(q => (q.id === updated.id ? updated : q)))
    setIsEditDialogOpen(false)
  }

  async function handleDeleteQuestion(id: number) {
    await questionsApi.delete(id)
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  if (loading) return <div className="p-6">Загрузка…</div>

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Вопросы</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Добавить вопрос</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый вопрос</DialogTitle>
                <DialogDescription>Введите текст вопроса</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label>Текст</Label>
                <Input value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
                <Button onClick={handleAddQuestion}>Сохранить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Текст</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map(q => (
                <TableRow key={q.id}>
                  <TableCell>{q.id}</TableCell>
                  <TableCell>{q.text}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" onClick={() => openEditDialog(q)}>Редактировать</Button>
                    <Button variant="destructive" onClick={() => handleDeleteQuestion(q.id)}>Удалить</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать вопрос</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Текст</Label>
            <Input value={editText} onChange={e => setEditText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleEditQuestion}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
