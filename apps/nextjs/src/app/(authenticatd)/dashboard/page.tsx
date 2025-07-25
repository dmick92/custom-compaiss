"use client"

import React from 'react'
import { ChangeBadgeVariantInput } from '~/calendar/components/change-badge-variant-input'
import { ClientContainer } from '~/calendar/components/client-container'
import { useCalendar } from '~/calendar/contexts/calendar-context'

const page = () => {
    const { view } = useCalendar();

    return (
        <div className="container mx-auto space-y-6 p-6">
            <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 p-4">
                <ChangeBadgeVariantInput />
                <ClientContainer view={view} />
            </div>
        </div>
    )
}

export default page