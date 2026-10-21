import "../styles/calendar.css";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../components/Card";
import PageTitle from "../components/PageTitle";
import { getWorkoutForDate, hasScheduledWorkout } from "../data/workoutSchedule";

function getWeekNumber(date) {
  const thursday = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const weekday = thursday.getUTCDay() || 7;
  thursday.setUTCDate(thursday.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  return Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
}

export default function CalendarPage({ team, openWorkout }) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const today = new Date();
  const year = month.getFullYear(),
    monthIndex = month.getMonth(),
    firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7,
    daysInMonth = new Date(year, monthIndex + 1, 0).getDate(),
    weekCount = Math.ceil((firstWeekday + daysInMonth) / 7);
  const monthLabel = new Intl.DateTimeFormat("da-DK", {
    month: "long",
    year: "numeric",
  }).format(month);
  const dateLabel = new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
  });
  const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const weeks = Array.from({ length: weekCount }, (_, weekIndex) => {
    const dates = Array.from({ length: 7 }, (_, dayIndex) =>
      new Date(year, monthIndex, 1 - firstWeekday + weekIndex * 7 + dayIndex),
    );
    return {
      number: getWeekNumber(dates[0]),
      dates,
      total: dates.reduce(
        (sum, date) => sum + getWorkoutForDate(date, team).distance,
        0,
      ),
    };
  });

  return (
    <>
      <PageTitle
        eyebrow={`${team.toUpperCase()} · TRÆNINGSPROGRAM`}
        title="Kalender"
        description="Klik på en markeret træning for detaljer."
      />
      <Card className="calendar-card">
        <div className="calendar-toolbar">
          <button
            type="button"
            aria-label="Forrige måned"
            onClick={() =>
              setMonth(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
          >
            <ChevronLeft size={20} />
          </button>
          <h2>{monthLabel}</h2>
          <button
            type="button"
            aria-label="Næste måned"
            onClick={() =>
              setMonth(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="calendar-content">
          <div className="calendar-weekdays">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
            <span className="week-heading">Uge</span>
          </div>
          <div className="calendar-weeks">
            {weeks.map((week) => (
              <div className="calendar-week-row" key={`${year}-${week.number}`}>
                {week.dates.map((date) => {
                  const workout = getWorkoutForDate(date, team);
                  const hasWorkout = hasScheduledWorkout(workout);
                  const isToday =
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
                  const inMonth = date.getMonth() === monthIndex;
                  const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                  return (
                    <button
                      type="button"
                      key={localDate}
                      className={`calendar-day${hasWorkout ? " workout" : ""}${isToday ? " today" : ""}${inMonth ? "" : " outside-month"}`}
                      onClick={
                        hasWorkout
                          ? () => openWorkout(workout, team)
                          : undefined
                      }
                      disabled={!hasWorkout}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={`${dateLabel.format(date)}, ${workout.name}${workout.distance ? `, ${workout.distance} km` : ""}${workout.duration ? `, ${workout.duration} minutter` : ""}`}
                    >
                      <span className="calendar-weekday-label" aria-hidden="true">
                        {weekdays[(date.getDay() + 6) % 7]}
                      </span>
                      <time dateTime={localDate}>{dateLabel.format(date)}</time>
                      {isToday && (
                        <span className="calendar-today-label">I dag</span>
                      )}
                      {workout.zone && (
                        <span
                          className={`zone-symbol zone-${workout.zone.toLowerCase()}`}
                          title={workout.name}
                        >
                          {workout.zone}
                        </span>
                      )}
                      {hasWorkout && !workout.zone && (
                        <span className="calendar-workout-name">
                          {workout.name}
                        </span>
                      )}
                      {!hasWorkout && (
                        <span className="calendar-rest">{workout.name}</span>
                      )}
                      {workout.zone && (
                        <span
                          className="calendar-workout-name"
                          title={workout.name}
                        >
                          {workout.name}
                        </span>
                      )}
                      {hasWorkout && (
                        <span className="calendar-distance">
                          {workout.distance > 0
                            ? `${workout.distance} km`
                            : `${workout.duration} min`}
                        </span>
                      )}
                    </button>
                  );
                })}
                <div
                  className="calendar-week-total"
                  aria-label={`Uge ${week.number}, ${week.total} kilometer`}
                >
                  <span>Uge {week.number}</span>
                  <strong>{week.total} km</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}
