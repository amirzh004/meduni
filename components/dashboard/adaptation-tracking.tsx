"use client"

import { useEffect, useState } from "react"
import { adaptationApi, type AdaptationOut } from "@/lib/api"
import { useTranslation } from "@/lib/language"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, UserCheck, Edit } from "lucide-react"

export function AdaptationTracking() {
  const [rows, setRows] = useState<AdaptationOut[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { t } = useTranslation()

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

  async function updateStatus(r: Record<string, any>, status: string) {
    try {
      await adaptationApi.update(r.id, {
        user_id: r.user_id,
        status,
      })
      await load()
    } catch (e) {
      console.error("Ошибка обновления статуса", e)
    }
  }

  async function handleSaveStatus() {
    if (selectedRow && newStatus) {
      try {
        await adaptationApi.update(selectedRow.id, {
          user_id: selectedRow.user_id,
          status: newStatus,
        })
        await load()
        setIsDialogOpen(false)
        setSelectedRow(null)
        setNewStatus("")
      } catch (e) {
        console.error("Ошибка обновления статуса", e)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-card/80">
          <CardHeader>
            <CardTitle>{t("adaptationTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">{t("loadingData")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    adaptation: t("adaptationProcess"),
    adaptation_success: t("adaptationSuccess"),
    adaptation_failed: t("adaptationFailed"),
  }

  const statusColors: Record<string, string> = {
    adaptation: "bg-yellow-100 text-yellow-800",
    adaptation_success: "bg-green-100 text-green-800",
    adaptation_failed: "bg-red-100 text-red-800",
  }

  const statusIcons: Record<string, string> = {
    adaptation: "🟡",
    adaptation_success: "🟢",
    adaptation_failed: "🔴",
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-card/80 animate-pulse-glow">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/20 rounded-lg">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            {t("adaptationTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-hidden rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{t("id")}</TableHead>
                  <TableHead className="font-semibold">{t("employeeName")}</TableHead>
                  <TableHead className="font-semibold">{t("adaptationStatus")}</TableHead>
                  <TableHead className="font-semibold">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((raw, index) => {
                  const r = raw as Record<string, any> // 👈 один раз привели
                  return (
                    <TableRow
                      key={r.id}
                      className="hover:bg-muted/30 transition-colors duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TableCell>{r.id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-primary/10 rounded-full">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          {r.name ?? `ID ${r.user_id}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[r.status]} font-medium`}>
                          {statusIcons[r.status]} {statusLabels[r.status] ?? r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRow(r)
                            setNewStatus(r.status)
                            setIsDialogOpen(true)
                          }}
                          className="hover:scale-105 transition-transform duration-200 hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t("updateStatus")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Диалог изменения статуса */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-effect">
          <DialogHeader>
            <DialogTitle className="gradient-text">{t("changeStatus")}</DialogTitle>
            <DialogDescription>
              {t("employee")}: {selectedRow?.name ?? `ID ${selectedRow?.user_id}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("newStatus")}</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="border-primary/20 focus:border-primary/50">
                  <SelectValue placeholder={t("selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adaptation">🟡 {t("adaptationProcess")}</SelectItem>
                  <SelectItem value="adaptation_success">🟢 {t("adaptationSuccess")}</SelectItem>
                  <SelectItem value="adaptation_failed">🔴 {t("adaptationFailed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveStatus} className="hover:scale-105 transition-transform duration-200">
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
