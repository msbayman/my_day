'use client'

import { getAllTodos, deleteTodo, checkTodo, addTodo } from "@/app/actions/todos"
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

interface TodoFormData {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [addTodoo, setAddTodo] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string>("")

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

  const toggleTodo = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "not_started" : "completed"
    const isCompleted = newStatus === "completed"

    // Optimistic update
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
            ...todo,
            status: newStatus,
            status_display: isCompleted ? "Completed" : "Not Started",
          }
          : todo
      )
    )

    try {
      const success = await checkTodo(id, isCompleted)

      if (!success) {
        console.error("Failed to update todo status")
        revertTodoStatus(id, currentStatus)
      }
    } catch (error) {
      console.error("Error updating todo:", error)
      revertTodoStatus(id, currentStatus)
    }
  }

  const revertTodoStatus = (id: number, currentStatus: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
            ...todo,
            status: currentStatus,
            status_display:
              currentStatus === "completed" ? "Completed" : "Not Started",
          }
          : todo
      )
    )
  }

  const validateTodoForm = (formData: TodoFormData): string | null => {
    const { startDate, startTime, endDate, endTime } = formData

    const startDateTime = new Date(`${startDate}T${startTime}`)
    const endDateTime = new Date(`${endDate}T${endTime}`)

    if (startDateTime >= endDateTime) {
      return "Start date and time must be before end date and time!"
    }

    // Optional: Check if start time is in the past
    const now = new Date()
    if (startDateTime < now) {
      return "Start date and time cannot be in the past!"
    }

    return null
  }

  const handleAddTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidationError("")

    const formData = new FormData(e.currentTarget)
    const todoData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      startDate: formData.get("startDate") as string,
      startTime: formData.get("startTime") as string,
      endDate: formData.get("endDate") as string,
      endTime: formData.get("endTime") as string,
    }


    const error = validateTodoForm(todoData)
    if (error) {
      setValidationError(error)
      return
    }

    try {
      setLoading(true) 
      const newTodo = await addTodo(todoData) 

      
      setTodos(prev => [...prev, newTodo])


      setAddTodo(false)
      setValidationError("")

 
      await fetchTodos()
    } catch (error: any) {
      console.error("Error creating todo:", error)
      setValidationError(
        error.response?.data?.error ||
        "Failed to create todo. Please try again."
      )
    } finally {
      setLoading(false)
    }
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
       
        await fetchTodos()
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
      await fetchTodos()
    }
  }

  const handleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const closeAddTodoModal = () => {
    setAddTodo(false)
    setValidationError("")
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
        <button
          onClick={() => setAddTodo(true)}
          className="bg-green-800/40 hover:bg-green-900 transition text-white p-2 px-4 rounded-lg"
        >
          + New Task
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
              className={`rounded-lg p-4 ${date === today
                  ? "bg-green-900/30 border border-green-700"
                  : "bg-gray-900/30 border border-gray-700"
                }`}
            >
              <h2
                className={`text-xl mb-4 font-semibold ${date === today ? "text-green-400" : "text-gray-300"
                  }`}
              >
                {formatDateLabel(date)}
              </h2>

              <div className="flex flex-col gap-4">
                {todosForDate.map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => handleExpand(todo.id)}
                    className={`flex flex-col gap-2 p-4 rounded-lg border border-gray-700 cursor-pointer transition ${todo.status === "completed"
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
                            className={`text-lg font-medium ${todo.status === "completed"
                                ? "line-through text-gray-400"
                                : "text-white"
                              }`}
                          >
                            {todo.title}
                          </h2>
                          <p className="text-sm text-gray-400">
                            {formatTime(todo.start_time)} - {formatTime(todo.end_time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${todo.status === "completed" ? "bg-green-600" : "bg-gray-600"
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
                          Starts: {new Date(todo.start_time).toLocaleDateString()}{" "}
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

   
      {addTodoo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-[400px]">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">New Task</h2>

            {validationError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                {validationError}
              </div>
            )}

            <form onSubmit={handleAddTodo} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Title</label>
                <input
                  type="text"
                  name="title"
                  className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-500 outline-none"
                  placeholder="Task title"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Description</label>
                <textarea
                  name="description"
                  className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-500 outline-none"
                  rows={3}
                  placeholder="Task details"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col flex-1 gap-1">
                  <label className="text-gray-400 text-sm">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-500 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <label className="text-gray-400 text-sm">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col flex-1 gap-1">
                  <label className="text-gray-400 text-sm">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-500 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <label className="text-gray-400 text-sm">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeAddTodoModal}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center w-[300px]">
            <p className="text-white mb-4">Are you sure you want to delete this task?</p>
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