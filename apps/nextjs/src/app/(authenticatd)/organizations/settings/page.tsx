import { OrganizationMembersCard, OrganizationSettingsCards } from '@daveyplate/better-auth-ui'
import React from 'react'

function Page() {
    return (
        <div className="container mx-auto space-y-6 p-6">
            <OrganizationSettingsCards />
            <OrganizationMembersCard />

        </div>
    )
}

export default Page