import { useState } from "react"

export function ExpandableText({ text, limit = 100 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false)

  if (!text) return null

  const isLong = text.length > limit
  const displayText = expanded || !isLong ? text : text.slice(0, limit) + "..."

  return (
    <div className="whitespace-normal break-words">
      {displayText}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-1 text-blue-600 hover:underline text-sm"
        >
          {expanded ? "Скрыть" : "ещё"}
        </button>
      )}
    </div>
  )
}
