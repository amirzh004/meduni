"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { candidatesApi, type CandidateOut } from "@/lib/api"

interface CandidateActionsProps {
  candidate: CandidateOut
  onUpdate?: (c: CandidateOut | null) => void // колбэк для обновления списка
}

export function CandidateActions({ candidate, onUpdate }: CandidateActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (status: string) => {
    setLoading(true)
    try {
      const updated = await candidatesApi.updateStatus(candidate.user_id, status)
      onUpdate?.(updated)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await candidatesApi.delete(candidate.id)
      onUpdate?.(null) // удалили — вернём null
    } finally {
      setLoading(false)
    }
  }

  switch (candidate.status) {
    case "new":
      return (
        <Button
          disabled={loading}
          onClick={() => handleStatusChange("interview")}
          className="w-full whitespace-normal break-words text-sm px-2 py-1 text-center cursor-pointer"
        >
          Пригласить на собеседование
        </Button>
      )

    case "interview":
      return (
        <div className="flex flex-col gap-2">
          <Button
            disabled={loading}
            onClick={() => handleStatusChange("adaptation")}
            className="w-full whitespace-normal break-words text-sm px-2 py-1 text-center cursor-pointer"
          >
            Пригласить на адаптацию
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => handleStatusChange("interview_failed")}
            className="w-full whitespace-normal break-words text-sm px-2 py-1 text-center cursor-pointer"
          >
            Собеседование не пройдено
          </Button>
        </div>
      )

    case "adaptation":
      return (
        <div className="flex flex-col gap-2">
          <Button
            disabled={loading}
            onClick={() => handleStatusChange("adaptation_success")}
            className="w-full whitespace-normal break-words text-sm px-2 py-1 text-center cursor-pointer"
          >
            Прошел адаптацию
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => handleStatusChange("adaptation_failed")}
            className="w-full whitespace-normal break-words text-sm px-2 py-1 text-center cursor-pointer"
          >
            Не прошел адаптацию
          </Button>
        </div>
      )

    case "interview_failed":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-red-600">Собеседование провалено</span>
        </div>
      )

    case "adaptation_success":
      return <span className="text-green-600">Адаптация пройдена</span>

    case "adaptation_failed":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-red-600">Адаптация провалена</span>
        </div>
      )

    default:
      return <span className="text-gray-500">Неизвестный статус</span>
  }
}
