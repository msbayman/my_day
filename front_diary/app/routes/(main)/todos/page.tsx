'use client'
import { getAllTodos } from "@/app/actions/todos"
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

  const fetchTodos = async (date?: Date) => {
    try {
      setLoading(true)
      let formattedDate: string | undefined

      if (date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
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
            status_display: newStatus === "completed" ? "Completed" : "Not Started",
          }
          : todo
      )
    )
  }

  const formatTime = (timeString: string) => {
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

  if (loading) {
    return (
      <div className="flex flex-col h-screen p-20 bg-[#0b0b0b] text-white">
        <p>Loading...</p>
      </div>
    )
  }

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

      <div className="flex flex-col gap-4 overflow-y-auto">
        {todos.length === 0 ? (
          <p className="text-gray-400">No todos yet</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center justify-between p-4 rounded-lg border border-gray-700 transition ${todo.status === "completed" ? "bg-green-800/40" : "bg-gray-800"
                }`}
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={todo.status === "completed"}
                  onChange={() => toggleTodo(todo.id, todo.status)}
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
                  {todo.description && (
                    <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                  )}
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${todo.status === "completed" ? "bg-green-600" : "bg-gray-600"
                  }`}
              >
                {todo.status_display}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Todos
