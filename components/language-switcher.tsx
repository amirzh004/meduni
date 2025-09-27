"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  // берём значения через селекторы, чтобы гарантированно триггерилась перерисовка
  const language = useLanguage(s => s.language)
  const setLanguage = useLanguage(s => s.setLanguage)

  // защита от мерцания при rehydration zustand-persist
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const toggleLanguage = () => {
    setLanguage(language === "ru" ? "kz" : "ru")
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 bg-transparent"
      title={language === "ru" ? "Қазақ тілі" : "Русский язык"}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === "ru" ? "РУС" : "ҚАЗ"}</span>
    </Button>
  )
}
