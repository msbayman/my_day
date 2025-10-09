'use client'

import { getAllTodos, deleteTodo } from "@/app/actions/todos"
import React, { useEffect, useState } from "react"
import { Calendar22 } from "@/components/ui/calenderpicker"

interface Todo {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
  status: string
  status_display: string
}

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const fetchTodos = async (date?: Date) => {
    try {
      setLoading(true)
      let formattedDate: string | undefined

      if (date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        formattedDate = `${year}-${month}-${day}`
      }

      const data = await getAllTodos(formattedDate)
      setTodos(data)
    } catch (error) {
      console.error("Error fetching todos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const toggleTodo = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "not_started" : "completed"
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              status: newStatus,
              status_display:
                newStatus === "completed" ? "Completed" : "Not Started",
            }
          : todo
      )
    )
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ""
    try {
      const [hours, minutes] = timeString.split(":")
      const hour = parseInt(hours)
      const period = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${period}`
    } catch {
      return timeString
    }
  }

  const formatDateLabel = (dateString: string) => {
    if (dateString === "unknown") return "Unknown Date"

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"

    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"

    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const groupTodosByDate = (todos: Todo[]) => {
    const groups: Record<string, Todo[]> = {}

    for (const todo of todos) {
      let dateKey = "unknown"
      if (todo.start_time) {
        const isoDate = new Date(todo.start_time).toISOString()
        dateKey = isoDate.split("T")[0]
      }

      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(todo)
    }

    return groups
  }

  const handleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteId) return

    const id = confirmDeleteId
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    setConfirmDeleteId(null)

    try {
      const success = await deleteTodo(id)
      if (!success) {
        console.error("Failed to delete on server")
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen p-20 bg-[#0b0b0b] text-white">
        <p>Loading...</p>
      </div>
    )
  }

  const groupedTodos = groupTodosByDate(todos)
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="flex flex-col h-screen p-20 bg-[#0b0b0b] text-white">
      <h1 className="text-4xl pb-10 border-b-2 border-white font-semibold">To-Do</h1>

      <div className="flex flex-row gap-4 mb-10 pt-4">
        <button className="bg-green-800/40 hover:bg-green-900 transition text-white p-2 px-4 rounded-lg">
          + New Task
        </button>
        <button className="bg-gray-500 hover:bg-gray-800 transition text-white p-2 px-4 rounded-lg">
          Filter
        </button>
        <Calendar22 onDateChange={(date) => fetchTodos(date)} />
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto">
        {Object.keys(groupedTodos).length === 0 ? (
          <p className="text-gray-400">No todos yet</p>
        ) : (
          Object.entries(groupedTodos).map(([date, todosForDate]) => (
            <div
              key={date}
              className={`rounded-lg p-4 ${
                date === today
                  ? "bg-green-900/30 border border-green-700"
                  : "bg-gray-900/30 border border-gray-700"
              }`}
            >
              <h2
                className={`text-xl mb-4 font-semibold ${
                  date === today ? "text-green-400" : "text-gray-300"
                }`}
              >
                {formatDateLabel(date)}
              </h2>

              <div className="flex flex-col gap-4">
                {todosForDate.map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => handleExpand(todo.id)}
                    className={`flex flex-col gap-2 p-4 rounded-lg border border-gray-700 cursor-pointer transition ${
                      todo.status === "completed"
                        ? "bg-green-800/40"
                        : "bg-gray-800 hover:bg-gray-700/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={todo.status === "completed"}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleTodo(todo.id, todo.status)
                          }}
                          className="w-5 h-5 accent-green-400 cursor-pointer"
                        />
                        <div>
                          <h2
                            className={`text-lg font-medium ${
                              todo.status === "completed"
                                ? "line-through text-gray-400"
                                : "text-white"
                            }`}
                          >
                            {todo.title}
                          </h2>
                          <p className="text-sm text-gray-400">
                            {formatTime(todo.start_time)} -{" "}
                            {formatTime(todo.end_time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            todo.status === "completed"
                              ? "bg-green-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {todo.status_display}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(todo.id)
                          }}
                          className="text-red-400 hover:text-red-600 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {expandedId === todo.id && (
                      <div className="text-sm text-gray-400 mt-2 border-t border-gray-700 pt-2">
                        <p className="mb-1">{todo.description}</p>
                        <p className="text-xs text-gray-500 italic">
                          Starts:{" "}
                          {new Date(todo.start_time).toLocaleDateString()}{" "}
                          {formatTime(todo.start_time)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center w-[300px]">
            <p className="text-white mb-4">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Todos
