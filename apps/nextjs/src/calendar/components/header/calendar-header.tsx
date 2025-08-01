import Link from "next/link";
import { Columns, Grid3x3, List, Plus, Grid2x2, CalendarRange } from "lucide-react";

import { Button } from "~/components/ui/button";

import { UserSelect } from "~/calendar/components/header/user-select";
import { TodayButton } from "~/calendar/components/header/today-button";
import { DateNavigator } from "~/calendar/components/header/date-navigator";
import { AddEventDialog } from "~/calendar/components/dialogs/add-event-dialog";

import type { IEvent } from "~/calendar/interfaces";
import type { TCalendarView } from "~/calendar/types";
import { useCalendar } from "~/calendar/contexts/calendar-context";

interface IProps {
  view: TCalendarView;
  events: IEvent[];
}

export function CalendarHeader({ view, events }: IProps) {
  const { setView } = useCalendar();

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator view={view} events={events} />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            <Button
              asChild
              aria-label="View by day"
              size="icon"
              variant={view === "day" ? "default" : "outline"}
              className="rounded-r-none [&_svg]:size-5"
              onClick={() => setView("day")}
            >
              <Link href="/day-view" onClick={(e) => e.preventDefault()}>
                <List strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by week"
              size="icon"
              variant={view === "week" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView("week")}
            >
              <Link href="/week-view" onClick={(e) => e.preventDefault()}>
                <Columns strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by month"
              size="icon"
              variant={view === "month" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView("month")}
            >
              <Link href="/month-view" onClick={(e) => e.preventDefault()}>
                <Grid2x2 strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by year"
              size="icon"
              variant={view === "year" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView("year")}
            >
              <Link href="/year-view" onClick={(e) => e.preventDefault()}>
                <Grid3x3 strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by agenda"
              size="icon"
              variant={view === "agenda" ? "default" : "outline"}
              className="-ml-px rounded-l-none [&_svg]:size-5"
              onClick={() => setView("agenda")}
            >
              <Link href="/agenda-view" onClick={(e) => e.preventDefault()}>
                <CalendarRange strokeWidth={1.8} />
              </Link>
            </Button>
          </div>

          <UserSelect />
        </div>

        <AddEventDialog>
          <Button className="w-full sm:w-auto">
            <Plus />
            Add Event
          </Button>
        </AddEventDialog>
      </div>
    </div>
  );
}
