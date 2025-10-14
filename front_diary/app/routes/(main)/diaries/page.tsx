'use client'

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar22 } from "@/components/ui/calenderpicker"
import { Textarea } from "@/components/ui/textarea"
import { getDiaryByDate, saveDiary } from "@/app/actions/diary"

interface Diary {
  date: string
  content: string
  status?: string
}

const Diaries = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [noDiary, setNoDiary] = useState<boolean>(false)


  const fetchDiary = async (date?: Date) => {
    try {
      setLoading(true)
      setMessage("")
      setNoDiary(false)

      let formattedDate: string | undefined

      if (date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        formattedDate = `${year}-${month}-${day}`
      }

      const data: Diary = await getDiaryByDate(formattedDate)

      if (data.status === "not_found") {
        setNoDiary(true)
        setContent("")
      } else {
        setNoDiary(false)
        setContent(data?.content || "")
      }
    } catch (err) {
      console.error("Error fetching diary:", err)
      setMessage("Failed to load diary ❌")
      setContent("")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchDiary(selectedDate)
  }, [selectedDate])

  const handleSave = async () => {
    if (!content.trim()) {
      setMessage("Please write something before saving.")
      return
    }

    try {
      setSaving(true)
      setMessage("")

      const currentDate = new Date(selectedDate)
      const formattedDate = new Intl.DateTimeFormat("en-CA").format(currentDate)

      await saveDiary({ date: formattedDate, content })
      setMessage(`Diary saved successfully for ${formattedDate} ✅`)
    } catch (error: any) {
      console.error("Error saving diary:", error)
      setMessage(error.response?.data?.error || "Failed to save diary ❌")
    } finally {
      setSaving(false)
    }
  }

  const handleDateChange = (date?: Date) => {
    if (date) {
      setContent("") 
      setSelectedDate(date) 
    }
  }

  return (
    <div className="flex flex-col h-screen p-20 bg-[#0b0b0b] text-white">
      <h1 className="text-4xl pb-10 border-b-2 border-white font-semibold">Diaries</h1>

      <div className="flex flex-row gap-4 mb-10 pt-4">
        <Calendar22 onDateChange={handleDateChange} />
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {message && (
        <p
          className={`mb-4 text-sm ${message.includes("✅") ? "text-green-400" : "text-red-400"
            }`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 animate-pulse">Loading your diary...</p>
        </div>
      ) : (
        <>
          {noDiary && (
            <p className="text-gray-400 mb-2">No diary for this date — start writing 📝</p>
          )}
          <Textarea
            placeholder="Write your diary..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 resize-none"
            disabled={loading}
          />
        </>
      )}
    </div>
  )
}

export default Diaries
