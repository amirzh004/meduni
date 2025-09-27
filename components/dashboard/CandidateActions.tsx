"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { candidatesApi, type CandidateOut } from "@/lib/api"
import { useTranslation } from "@/lib/language" 

interface CandidateActionsProps {
  candidate: CandidateOut
  onUpdate?: (c: CandidateOut | null) => void
}

export function CandidateActions({ candidate, onUpdate }: CandidateActionsProps) {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation() 

  const handleStatusChange = async (status: string) => {
    setLoading(true)
    try {
      const updated = await candidatesApi.updateStatus(candidate.id, status) // фикс id
      onUpdate?.(updated)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await candidatesApi.delete(candidate.id)
      onUpdate?.(null)
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
          {t("inviteInterviewBtn")}
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
            {t("inviteAdaptationBtn")}
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => handleStatusChange("interview_failed")}
            className="w-full whitespace-normal break-words text-sm px-2 py-1 text-center cursor-pointer"
          >
            {t("interviewFailedBtn")}
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
            {t("adaptationSuccessBtn")}
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => handleStatusChange("adaptation_failed")}
            className="w-full whitespace-normal break-words text-sm px-2 py-1 text-center cursor-pointer"
          >
            {t("adaptationFailedBtn")}
          </Button>
        </div>
      )

    case "interview_failed":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-red-600">{t("interviewFailedLabel")}</span>
          <Button variant="outline" disabled={loading} onClick={handleDelete}>
            {t("delete")}
          </Button>
        </div>
      )

    case "adaptation_success":
      return <span className="text-green-600">{t("adaptationPassedLabel")}</span>

    case "adaptation_failed":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-red-600">{t("adaptationFailedLabel")}</span>
          <Button variant="outline" disabled={loading} onClick={handleDelete}>
            {t("delete")}
          </Button>
        </div>
      )

    default:
      return <span className="text-gray-500">{t("unknownStatus")}</span>
  }
}
