
import React from 'react'
import { headers } from 'next/headers'
import { CalendarProvider } from '~/calendar/contexts/calendar-context'
import { CALENDAR_ITENS_MOCK, USERS_MOCK } from '~/calendar/mocks'

import { createCaller } from '~/trpc/server'
import { auth } from '~/auth/server'

const layout = async ({ children }: { children: React.ReactNode }) => {
    // Simple server-side tRPC calls
    const caller = await createCaller()

    // Set active organization with proper headers
    const heads = await headers()
    await auth.api.setActiveOrganization({
        headers: heads,
        body: {
            organizationId: "3XqSov1rTbp5oYgl4qp8mXyQXIXJrRLq"
        }
    })

    // Method 1: Get session through tRPC caller
    const session = await caller.auth.getSession()

    // Method 2: Get session directly from auth
    const directSession = await auth.api.getSession({ headers: await headers() })

    // Method 3: Access session in protected procedures
    const tasks = await caller.task.list() // This will have access to session
    const users = await caller.user.getAll()

    console.log('Tasks from server:', tasks)
    console.log('Users from server:', users)

    // Transform tasks into calendar events
    const calendarEvents = tasks.map((task, index) => {
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
    })


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