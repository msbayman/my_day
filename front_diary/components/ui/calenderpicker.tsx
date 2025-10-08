"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover"

interface Calendar22Props {
   onDateChange?: (date: Date | undefined) => void
}

export function Calendar22({ onDateChange }: Calendar22Props) {
   const [open, setOpen] = React.useState(false)
   const [date, setDate] = React.useState<Date | undefined>(undefined)

   const isToday = (date: Date) => {
      const today = new Date()
      return (
         date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth()  &&
         date.getFullYear() === today.getFullYear()
      )
   }

   const formattedDate = date
      ? isToday(date)
         ? "Today"
         : date.toLocaleDateString()
      : "Select date"

   return (
      <div className="flex flex-col gap-3">
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
               >
                  {formattedDate}
                  <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
               </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
               <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(selectedDate) => {
                     setDate(selectedDate)
                     setOpen(false)
                     onDateChange?.(selectedDate) 
                  }}
               />
            </PopoverContent>
         </Popover>
      </div>
   )
}
