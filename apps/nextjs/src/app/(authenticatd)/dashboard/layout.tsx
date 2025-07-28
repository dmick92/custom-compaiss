'use client'

import React from 'react'
import { CalendarProvider } from '~/calendar/contexts/calendar-context'
import { CALENDAR_ITENS_MOCK, USERS_MOCK } from '~/calendar/mocks'

import { useTRPC } from '~/trpc/react'
import { useQuery } from '@tanstack/react-query'

const layout = ({ children }: { children: React.ReactNode }) => {
    const trpc = useTRPC();
    const tasks = useQuery(trpc.task.list.queryOptions());
    const users = useQuery(trpc.user.getAll.queryOptions());

    console.log('Tasks from server:', tasks.data)
    console.log('Users from server:', users.data)

    console.log('Tasks from server:', tasks)
    console.log('Users from server:', users)

    // Transform tasks into calendar events
    const calendarEvents = tasks.data?.map((task, index) => {
        const taskData = task.task.data as { title?: string; description?: string }

        return {
            id: index + 1,
            startDate: task.task.createdAt.toISOString(),
            endDate: new Date(task.task.createdAt.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
            title: `${task.project.name} - ${taskData.title}`,
            color: getTaskColor(task.task.type),
            description: taskData.description || `Task type: ${task.task.type}`,
            user: {
                id: task.task.userId,
                name: task.user.name,
                picturePath: null
            }
        }
    }) ?? []


    console.log('Calendar events:', calendarEvents)
    return (
        <CalendarProvider users={USERS_MOCK} events={calendarEvents} >
            {children}
        </CalendarProvider>
    )
}

// Helper function to assign colors based on task type
function getTaskColor(taskType: string): "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "gray" {
    const colorMap: Record<string, "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "gray"> = {
        'design': 'purple',
        'development': 'blue',
        'testing': 'yellow',
        'deployment': 'green',
        'content': 'orange',
        'planning': 'gray'
    }

    return colorMap[taskType] ?? 'blue'
}

export default layout