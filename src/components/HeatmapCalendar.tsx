import React, { useState, useMemo } from 'react';
import { Calendar, Info } from 'lucide-react';
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
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ profile }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    cell: DayCell;
    x: number;
    y: number;
  } | null>(null);

  const calendarData = profile.calendar.submissionCalendar || {};

  // Compute 52-53 weeks ending on today
  const { weeks, monthLabels, totalYearSubmissions } = useMemo(() => {
    const today = new Date();
    // Normalize today to UTC day start
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const todayTs = todayUtc.getTime() / 1000;

    // Go back ~364 days to previous Sunday
    const daysBack = 364;
    const startDate = new Date(todayUtc);
    startDate.setUTCDate(startDate.getUTCDate() - daysBack);
    // Adjust to starting Sunday
    const dayOfWeek = startDate.getUTCDay();
    startDate.setUTCDate(startDate.getUTCDate() - dayOfWeek);

    const allDays: DayCell[] = [];
    const cur = new Date(startDate);
    let totalSubs = 0;

    while (cur <= todayUtc) {
      const ts = cur.getTime() / 1000;
      const count = calendarData[String(ts)] || 0;
      totalSubs += count;

      allDays.push({
        date: new Date(cur),
        dateStr: cur.toISOString().split('T')[0],
        utcTs: ts,
        count,
        isToday: ts === todayTs,
        dayOfWeek: cur.getUTCDay(),
      });

      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    // Group into weeks (columns of 7 days)
    const weeksList: DayCell[][] = [];
    let currentWeek: DayCell[] = [];

    allDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksList.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      weeksList.push(currentWeek);
    }

    // Determine month labels positions
    const months: Array<{ label: string; colIndex: number }> = [];
    let lastMonth = -1;

    weeksList.forEach((week, colIdx) => {
      const firstDayInWeek = week[0]?.date;
      if (firstDayInWeek) {
        const m = firstDayInWeek.getUTCMonth();
        if (m !== lastMonth) {
          const monthShort = firstDayInWeek.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
          months.push({ label: monthShort, colIndex: colIdx });
          lastMonth = m;
        }
      }
    });

    return { weeks: weeksList, monthLabels: months, totalYearSubmissions: totalSubs };
  }, [calendarData]);

  // Color mapping based on submission count
  const getColorClass = (count: number, isToday: boolean) => {
    if (count === 0) {
      return isToday
        ? 'bg-slate-800 border-2 border-amber-400 ring-2 ring-amber-400/20'
        : 'bg-slate-850 hover:bg-slate-800 border border-slate-800/80';
    }
    if (count === 1) {
      return isToday
        ? 'bg-emerald-800 border-2 border-amber-400 ring-2 ring-amber-400/30'
        : 'bg-emerald-900 hover:bg-emerald-800 border border-emerald-800/60';
    }
    if (count <= 3) {
      return isToday
        ? 'bg-emerald-600 border-2 border-amber-400 ring-2 ring-amber-400/30'
        : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/60';
    }
    return isToday
      ? 'bg-emerald-400 border-2 border-amber-400 ring-2 ring-amber-400/30'
      : 'bg-emerald-400 hover:bg-emerald-300 border border-emerald-300/80';
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-base">Submission Activity</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
          <span>
            <strong className="text-white font-mono">{totalYearSubmissions.toLocaleString()}</strong> submissions in the last year
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">
            Max streak: <strong className="text-amber-400 font-mono">{profile.calendar.streak}</strong>
          </span>
        </div>
      </div>

      {/* Heatmap Grid Container with horizontal scroll on mobile */}
      <div className="relative overflow-x-auto pb-2 pt-1">
        <div className="inline-block min-w-[760px] select-none">
          {/* Month labels header */}
          <div className="flex text-[10px] text-slate-400 font-medium mb-1 pl-7">
            {monthLabels.map((m, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  left: `${m.colIndex * 14}px`,
                  marginRight: idx < monthLabels.length - 1 ? '16px' : '0',
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Weekday labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[9px] text-slate-500 pr-2 py-0.5 h-[105px]">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3.5px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3.5px]">
                  {week.map((day) => {
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
                        className={`w-[11.5px] h-[11.5px] rounded-[2.5px] transition-colors cursor-pointer ${getColorClass(
                          day.count,
                          day.isToday
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredCell && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-slate-950 text-slate-100 text-xs shadow-2xl border border-slate-700 font-medium whitespace-nowrap"
            style={{ left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` }}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-amber-400">
                {hoveredCell.cell.count} submission{hoveredCell.cell.count !== 1 ? 's' : ''}
              </span>
              <span className="text-slate-400">on {hoveredCell.cell.dateStr}</span>
              {hoveredCell.cell.isToday && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  TODAY
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Hint */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Gold border marks today's cell. Changes reflect immediately on submission.</span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <span className="w-3 h-3 rounded-[2px] bg-slate-850 border border-slate-800" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-900" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-600" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

