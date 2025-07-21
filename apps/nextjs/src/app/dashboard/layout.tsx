
import React from 'react'
import { CalendarProvider } from '~/calendar/contexts/calendar-context'
import { CALENDAR_ITENS_MOCK, USERS_MOCK } from '~/calendar/mocks'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <CalendarProvider users={USERS_MOCK} events={CALENDAR_ITENS_MOCK} >
            {children}
        </CalendarProvider>
    )
}

export default layout