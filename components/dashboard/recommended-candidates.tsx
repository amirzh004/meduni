"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { candidatesApi, type AnalysisOut, type CandidateOut } from "@/lib/api"
import { ExpandableText } from "./ExpandableText"
import { CandidateActions } from "./CandidateActions"

type Row = AnalysisOut & { name: string; status?: string }

export function RecommendedCandidates() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const rec = await candidatesApi.getRecommended() // AnalysisOut[]
        const withNames: Row[] = await Promise.all(
          rec.map(async a => {
            let name = `ID ${a.user_id}`
            let status: string | undefined
            try {
              const cand: CandidateOut = await candidatesApi.getById(a.user_id)
              name = cand.name ?? name
              status = a.status
            } catch {}
            return { ...a, name, status }
          })
        )
        setRows(withNames)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="p-6">Загрузка…</div>

  const color = (score: number) =>
    score >= 70 ? "bg-green-100 text-green-800" : score >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"

const handleUpdate = async (userId: number, updated: CandidateOut | null) => {
  try {
    const rec = await candidatesApi.getRecommended()
    const withNames: Row[] = await Promise.all(
      rec.map(async a => {
        let name = `ID ${a.user_id}`
        let status: string | undefined
        try {
          const cand: CandidateOut = await candidatesApi.getById(a.user_id)
          name = cand.name ?? name
          status = a.status
        } catch {}
        return { ...a, name, status }
      })
    )
    setRows(withNames)
  } catch (err) {
    console.error("Ошибка обновления списка кандидатов:", err)
  }
}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Рекомендованные кандидаты</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[5%]">Имя</TableHead>
              <TableHead className="w-[15%]">Позиция</TableHead>
              <TableHead className="w-[5%]">Score</TableHead>
              <TableHead className="w-[25%]">Сильные стороны</TableHead>
              <TableHead className="w-[25%]">Слабые стороны</TableHead>
              <TableHead className="w-[15%]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={`${r.user_id}-${r.position}`}>
                <TableCell className="align-top">{r.name}</TableCell>
                <TableCell className="align-top">
                  <ExpandableText text={r.position} limit={120} />
                </TableCell>
                <TableCell className="align-top">
                  <Badge className={color(r.score)}>{Math.round(r.score)}%</Badge>
                </TableCell>
                <TableCell className="align-top whitespace-normal break-words">
                  <ExpandableText text={r.strengths} limit={120} />
                </TableCell>
                <TableCell className="align-top whitespace-normal break-words">
                  <ExpandableText text={r.weaknesses} limit={120} />
                </TableCell>
                <TableCell className="align-top">
                  <CandidateActions
                    candidate={r}
                    onUpdate={updated => handleUpdate(r.user_id, updated)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
