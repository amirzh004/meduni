"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { adaptationApi, type AdaptationOut } from "@/lib/api"

export function AdaptationTracking() {
  const [rows, setRows] = useState<AdaptationOut[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const items = await adaptationApi.getAll()
      setRows(items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

async function updateStatus(r: AdaptationOut, status: string) {
  try {
    await adaptationApi.update(r.id, { user_id: r.user_id, status })
    await load() // 🔥 обновляем список с бэка
  } catch (e) {
    console.error("Ошибка обновления статуса", e)
  }
}


  if (loading) return <div className="p-6">Загрузка…</div>

  const color = (s: string) =>
    s === "adaptation_success"
      ? "bg-green-100 text-green-800"
      : s === "adaptation_failed"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800"

  const statusMap: Record<string, string> = {
    adaptation: "Проходит адаптацию",
    adaptation_success: "Адаптация пройдена",
    adaptation_failed: "Адаптация провалена",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Адаптация сотрудников</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Сотрудник</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{(r as any).name ?? `ID ${r.user_id}`}</TableCell>
                <TableCell>
                  <Badge>Адаптация</Badge>
                </TableCell>
                <TableCell className="text-right flex gap-2 justify-end">
                  <Button
                    className="whitespace-normal break-words text-sm px-2 py-1"
                    onClick={() => updateStatus(r, "adaptation_success")}
                  >
                    Адаптация пройдена
                  </Button>
                  <Button
                    variant="destructive"
                    className="whitespace-normal break-words text-sm px-2 py-1"
                    onClick={() => updateStatus(r, "adaptation_failed")}
                  >
                    Адаптация провалена
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
