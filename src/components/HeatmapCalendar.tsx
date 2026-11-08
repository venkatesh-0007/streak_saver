import React, { useState, useMemo } from 'react';
import { Calendar, LayoutGrid, StretchHorizontal, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfileData } from '../types';

interface HeatmapCalendarProps {
  profile: UserProfileData;
}

interface DayCell {
  date: Date;
  dateStr: string;
  utcTs: number;
  count: number;
  isToday: boolean;
  dayOfMonth: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
}

interface MonthGroup {
  monthKey: string; // "2026-11"
  monthName: string; // "November 2026"
  monthShort: string; // "Nov"
  year: number;
  monthIndex: number;
  totalSubmissions: number;
  activeDaysCount: number;
  weeks: (DayCell | null)[][];
  days: DayCell[];
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ profile }) => {
  const [viewMode, setViewMode] = useState<'months' | 'timeline'>('months');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    cell: DayCell;
    x: number;
    y: number;
  } | null>(null);

  const calendarData = profile.calendar.submissionCalendar || {};

  // Compute structured months data for the past 12 months
  const { monthGroups, timelineWeeks, totalYearSubmissions } = useMemo(() => {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const todayTs = todayUtc.getTime() / 1000;

    let totalSubs = 0;
    const monthsMap = new Map<string, DayCell[]>();

    // Collect past 365 days
    for (let i = 364; i >= 0; i--) {
      const d = new Date(todayUtc);
      d.setUTCDate(d.getUTCDate() - i);
      const ts = d.getTime() / 1000;
      const count = calendarData[String(ts)] || 0;
      totalSubs += count;

      const monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, []);
      }

      monthsMap.get(monthKey)!.push({
        date: new Date(d),
        dateStr: d.toISOString().split('T')[0],
        utcTs: ts,
        count,
        isToday: ts === todayTs,
        dayOfMonth: d.getUTCDate(),
        dayOfWeek: d.getUTCDay(),
      });
    }

    // Convert map to structured MonthGroup list
    const groups: MonthGroup[] = [];
    monthsMap.forEach((days, monthKey) => {
      const firstDay = days[0].date;
      const monthName = firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
      const monthShort = firstDay.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });

      let monthSubTotal = 0;
      let activeDays = 0;

      // Group days into 7-day grid weeks (Sun-Sat)
      const weeksGrid: (DayCell | null)[][] = [];
      let currentWeek: (DayCell | null)[] = new Array(7).fill(null);

      // Pad leading empty slots before first day of month if starting mid-week
      const firstDayOfWeek = days[0].dayOfWeek;
      for (let w = 0; w < firstDayOfWeek; w++) {
        currentWeek[w] = null;
      }

      days.forEach((day) => {
        monthSubTotal += day.count;
        if (day.count > 0) activeDays++;

        currentWeek[day.dayOfWeek] = day;
        if (day.dayOfWeek === 6) {
          weeksGrid.push(currentWeek);
          currentWeek = new Array(7).fill(null);
        }
      });

      // Push any remaining days
      if (currentWeek.some((c) => c !== null)) {
        weeksGrid.push(currentWeek);
      }

      groups.push({
        monthKey,
        monthName,
        monthShort,
        year: firstDay.getUTCFullYear(),
        monthIndex: firstDay.getUTCMonth(),
        totalSubmissions: monthSubTotal,
        activeDaysCount: activeDays,
        weeks: weeksGrid,
        days,
      });
    });

    // Also build continuous timeline weeks
    const startDate = new Date(todayUtc);
    startDate.setUTCDate(startDate.getUTCDate() - 364);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());

    const allTimelineDays: DayCell[] = [];
    const cur = new Date(startDate);
    while (cur <= todayUtc) {
      const ts = cur.getTime() / 1000;
      const count = calendarData[String(ts)] || 0;
      allTimelineDays.push({
        date: new Date(cur),
        dateStr: cur.toISOString().split('T')[0],
        utcTs: ts,
        count,
        isToday: ts === todayTs,
        dayOfMonth: cur.getUTCDate(),
        dayOfWeek: cur.getUTCDay(),
      });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    const tWeeks: DayCell[][] = [];
    let curW: DayCell[] = [];
    allTimelineDays.forEach((day) => {
      curW.push(day);
      if (curW.length === 7) {
        tWeeks.push(curW);
        curW = [];
      }
    });
    if (curW.length > 0) tWeeks.push(curW);

    return { monthGroups: groups, timelineWeeks: tWeeks, totalYearSubmissions: totalSubs };
  }, [calendarData]);

  // LeetCode green scale
  const getLeetCodeCellClass = (count: number, isToday: boolean) => {
    if (count === 0) {
      return isToday
        ? 'bg-[#282828] border-2 border-[#FFA116] ring-2 ring-[#FFA116]/30'
        : 'bg-[#262626] border border-[#333333] hover:bg-[#363636]';
    }
    if (count === 1) {
      return isToday
        ? 'bg-[#166534] border-2 border-[#FFA116] ring-2 ring-[#FFA116]/30'
        : 'bg-[#0e4429] border border-[#166534]/40 hover:bg-[#166534]';
    }
    if (count <= 3) {
      return isToday
        ? 'bg-[#15803d] border-2 border-[#FFA116] ring-2 ring-[#FFA116]/30'
        : 'bg-[#006d32] border border-[#006d32] hover:bg-[#15803d]';
    }
    return isToday
      ? 'bg-[#00B8A3] border-2 border-[#FFA116] ring-2 ring-[#FFA116]/40'
      : 'bg-[#00B8A3] hover:bg-[#20cfbb] border border-[#00B8A3] text-black font-bold';
  };

  const currentMonthGroup = monthGroups[monthGroups.length - 1];

  return (
    <div className="lc-card p-4 sm:p-6 transition-all">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFA116]/15 text-[#FFA116] flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
              <span>Submission Heatmap</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFA116]/15 text-[#FFA116]">
                Divided by Month
              </span>
            </h2>
            <p className="text-xs text-[#8A8A8E]">Activity record across the past 12 months</p>
          </div>
        </div>

        {/* View mode toggle & total */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex rounded-lg bg-[#282828] p-1 border border-white/[0.06] text-xs font-semibold">
            <button
              onClick={() => setViewMode('months')}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'months'
                  ? 'bg-[#FFA116] text-black font-bold shadow'
                  : 'text-[#8A8A8E] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Month Cards</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'timeline'
                  ? 'bg-[#FFA116] text-black font-bold shadow'
                  : 'text-[#8A8A8E] hover:text-white'
              }`}
            >
              <StretchHorizontal className="w-3.5 h-3.5" />
              <span>Full Year</span>
            </button>
          </div>

          <span className="text-xs font-mono text-[#8A8A8E] hidden sm:inline">
            <strong className="text-white font-bold">{totalYearSubmissions.toLocaleString()}</strong> submissions
          </span>
        </div>
      </div>

      {/* VIEW 1: MONTH-DIVIDED CARDS (Optimized for Mobile & Desktop) */}
      {viewMode === 'months' && (
        <div className="space-y-4">
          {/* Quick Month Filter Pills (Scrollable on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedMonthIdx(null)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedMonthIdx === null
                  ? 'bg-[#FFA116] text-black font-bold'
                  : 'bg-[#282828] text-[#8A8A8E] hover:text-white border border-white/[0.06]'
              }`}
            >
              All 12 Months
            </button>
            {monthGroups.map((mg, idx) => (
              <button
                key={mg.monthKey}
                onClick={() => setSelectedMonthIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1 ${
                  selectedMonthIdx === idx
                    ? 'bg-[#FFA116] text-black font-bold'
                    : 'bg-[#282828] text-[#8A8A8E] hover:text-white border border-white/[0.06]'
                }`}
              >
                <span>{mg.monthShort}</span>
                {mg.totalSubmissions > 0 && (
                  <span className={`text-[10px] px-1 rounded ${
                    selectedMonthIdx === idx ? 'bg-black text-[#FFA116]' : 'text-[#FFA116]'
                  }`}>
                    {mg.totalSubmissions}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Month Cards Grid (1 col on mobile, 2-3 on tablet/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {(selectedMonthIdx !== null
              ? [monthGroups[selectedMonthIdx]]
              : [...monthGroups].reverse()
            ).map((mg) => {
              const isCurrentMonth = mg.monthKey === currentMonthGroup?.monthKey;

              return (
                <div
                  key={mg.monthKey}
                  className={`lc-subcard p-3.5 transition-all flex flex-col justify-between ${
                    isCurrentMonth ? 'border-[#FFA116]/40 shadow-md shadow-[#FFA116]/5' : ''
                  }`}
                >
                  {/* Month Card Title */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">
                        {mg.monthName}
                      </span>
                      {isCurrentMonth && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#FFA116] text-black">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#8A8A8E]">
                      <strong className="text-[#FFA116]">{mg.totalSubmissions}</strong> subs
                    </span>
                  </div>

                  {/* Day of Week Label Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#5C5C5E] font-medium mb-1">
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                  </div>

                  {/* 7-column Calendar Days Grid for this Month */}
                  <div className="grid grid-cols-7 gap-1">
                    {mg.weeks.flat().map((day, idx) => {
                      if (!day) {
                        return <div key={`empty-${idx}`} className="w-full aspect-square" />;
                      }

                      return (
                        <div
                          key={day.dateStr}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              cell: day,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              cell: day,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          className={`w-full aspect-square rounded-[3px] transition-all cursor-pointer flex items-center justify-center text-[9px] font-mono ${getLeetCodeCellClass(
                            day.count,
                            day.isToday
                          )}`}
                        >
                          <span className={day.count > 0 ? 'font-bold' : 'text-[#71717A]'}>
                            {day.dayOfMonth}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: CONTINUOUS 52-WEEK TIMELINE */}
      {viewMode === 'timeline' && (
        <div className="relative overflow-x-auto pb-2 pt-1">
          <div className="inline-block min-w-[760px] select-none">
            {/* Month labels header */}
            <div className="flex text-[10px] text-[#8A8A8E] font-bold mb-1.5 pl-7">
              {monthGroups.map((mg) => (
                <div key={mg.monthKey} className="mr-8">
                  {mg.monthShort}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              {/* Day of week labels */}
              <div className="flex flex-col justify-between text-[9px] text-[#5C5C5E] font-medium pr-2 py-0.5 h-[105px]">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>

              {/* Columns */}
              <div className="flex gap-[3.5px]">
                {timelineWeeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3.5px]">
                    {week.map((day) => (
                      <div
                        key={day.dateStr}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            cell: day,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-[11.5px] h-[11.5px] rounded-[2.5px] transition-all cursor-pointer ${getLeetCodeCellClass(
                          day.count,
                          day.isToday
                        )}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg bg-[#1a1a1a] text-white text-xs shadow-2xl border border-white/[0.15] font-semibold whitespace-nowrap"
          style={{ left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#FFA116]">
              {hoveredCell.cell.count} submission{hoveredCell.cell.count !== 1 ? 's' : ''}
            </span>
            <span className="text-[#8A8A8E]">on {hoveredCell.cell.dateStr}</span>
            {hoveredCell.cell.isToday && (
              <span className="px-1.5 py-0.2 rounded bg-[#FFA116] text-black text-[9px] font-extrabold">
                TODAY
              </span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#8A8A8E] gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Info className="w-3.5 h-3.5 text-[#FFA116]" />
          <span>Orange border marks today. Switch to Month Cards on mobile for clear individual month views.</span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <span className="w-3 h-3 rounded-[2px] bg-[#262626] border border-[#333333]" />
            <span className="w-3 h-3 rounded-[2px] bg-[#0e4429]" />
            <span className="w-3 h-3 rounded-[2px] bg-[#006d32]" />
            <span className="w-3 h-3 rounded-[2px] bg-[#00B8A3]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
