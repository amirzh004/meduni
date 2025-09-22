"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { RecommendedCandidates } from "./recommended-candidates"
import { QuestionsManagement } from "./questions-management"
import { FormsManagement } from "./forms-management"
import { AdaptationTracking } from "./adaptation-tracking"
import { Users, FileText, ClipboardList, UserCheck, LogOut, Activity } from "lucide-react"

type ActivePage = "candidates" | "questions" | "forms" | "adaptation"

export function Dashboard() {
  const [activePage, setActivePage] = useState<ActivePage>("candidates")
  const { logout, user } = useAuth()

  const navigationItems = [
    { id: "candidates" as const, label: "Кандидаты", icon: Users },
    { id: "questions" as const, label: "Вопросы", icon: FileText },
    { id: "forms" as const, label: "Анкеты", icon: ClipboardList },
    { id: "adaptation" as const, label: "Адаптация", icon: UserCheck },
  ]

  const renderActivePage = () => {
    switch (activePage) {
      case "candidates":
        return <RecommendedCandidates />
      case "questions":
        return <QuestionsManagement />
      case "forms":
        return <FormsManagement />
      case "adaptation":
        return <AdaptationTracking />
      default:
        return <RecommendedCandidates />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">HR MedUniversity</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Добро пожаловать, {user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-card border-r border-border min-h-[calc(100vh-73px)]">
          <div className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activePage === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActivePage(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">{renderActivePage()}</main>
      </div>
    </div>
  )
}
