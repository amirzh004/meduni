"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useTranslation } from "@/lib/language"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { RecommendedCandidates } from "./recommended-candidates"
import { QuestionsManagement } from "./questions-management"
import { FormsManagement } from "./forms-management"
import { AdaptationTracking } from "./adaptation-tracking"
import { Users, FileText, ClipboardList, UserCheck, LogOut } from "lucide-react"
import Image from "next/image"

type ActivePage = "candidates" | "questions" | "forms" | "adaptation"

export function Dashboard() {
  const [activePage, setActivePage] = useState<ActivePage>("candidates")
  const { logout, user } = useAuth()
  const { t } = useTranslation()

  const navigationItems = [
    { id: "candidates" as const, label: t("recommendedCandidates"), icon: Users },
    { id: "questions" as const, label: t("questions"), icon: FileText },
    { id: "forms" as const, label: t("forms"), icon: ClipboardList },
    { id: "adaptation" as const, label: t("adaptation"), icon: UserCheck },
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
      {/* ---------- Header ---------- */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-4">
            {/* Логотип с анимацией */}
            <div className="relative animate-float">
              <Image
                src="/images/university-logo.png"
                alt="West Kazakhstan Medical University"
                width={56}
                height={56}
                className="rounded-full shadow-md"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text tracking-tight">
                HRsystem for West Kazakhstan Medical University
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Recruitment Hub — AI Scoring & Status Updates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{t("welcome")}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-2 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Sidebar + Main ---------- */}
      <div className="flex">
        <nav className="w-72 bg-sidebar border-r border-sidebar-border min-h-[calc(100vh-97px)]">
          <div className="p-6 flex flex-col justify-between h-full">
            <div className="space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="lg"
                    className={`w-full justify-start gap-3 h-12 text-left font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                    onClick={() => setActivePage(item.id)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </nav>

        <main className="flex-1 p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="animate-slide-up">{renderActivePage()}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
