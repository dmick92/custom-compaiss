import { projectPriorityEnum } from '@acme/db/schema';
import React from 'react'
import { Badge } from '~/components/ui/badge';
import { SelectItem } from '~/components/ui/select';
import { cn } from '~/lib/utils';

export const priorities = projectPriorityEnum.enumValues;
export const priorityColorMap: Record<(typeof projectPriorityEnum.enumValues)[number], string> = {
    Lowest: "bg-gray-400",
    Low: "bg-green-600",
    Medium: "bg-yellow-600",
    High: "bg-red-600",
    Critical: "bg-purple-800",
};

export const PriorityBadge = ({ priority }: { priority: (typeof projectPriorityEnum.enumValues)[number] }) => {
    return (
        <Badge
            className={cn(`text-xs flex items-center gap-1`, priorityColorMap[priority], priority === "Lowest" ? "text-gray-900" : "text-white")}
        >
            {priority}
        </Badge>
    )
}

export const PrioritySelectOptions = ({ reverse = false }: { reverse?: boolean }) => {
    const items = reverse ? [...priorities].reverse() : priorities;
    return (
        <>
            {items.map(priority => (
                <SelectItem key={priority} value={priority}>
                    <span className={cn(`inline-block w-2 h-2 rounded-full mr-2 align-middle`, priorityColorMap[priority])} />
                    {priority}
                </SelectItem>
            ))}
        </>
    )
}