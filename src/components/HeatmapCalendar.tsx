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
  dayOfWeek: number;
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ profile }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    cell: DayCell;
    x: number;
    y: number;
  } | null>(null);

  const calendarData = profile.calendar.submissionCalendar || {};

  const { weeks, monthLabels, totalYearSubmissions } = useMemo(() => {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const todayTs = todayUtc.getTime() / 1000;

    const daysBack = 364;
    const startDate = new Date(todayUtc);
    startDate.setUTCDate(startDate.getUTCDate() - daysBack);
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

  // Sameerasw Mint Green color mapping
  const getColorClass = (count: number, isToday: boolean) => {
    if (count === 0) {
      return isToday
        ? 'bg-white/10 border-2 border-[#ffe855] ring-2 ring-[#ffe855]/30'
        : 'bg-white/[0.04] hover:bg-white/[0.12] border border-white/[0.03]';
    }
    if (count === 1) {
      return isToday
        ? 'bg-[#0f4d38] border-2 border-[#ffe855] ring-2 ring-[#ffe855]/30'
        : 'bg-[#0d3d2d] hover:bg-[#0f4d38] border border-[#0f4d38]';
    }
    if (count <= 3) {
      return isToday
        ? 'bg-[#15805a] border-2 border-[#ffe855] ring-2 ring-[#ffe855]/30'
        : 'bg-[#147250] hover:bg-[#1a8c62] border border-[#1a8c62]/40';
    }
    return isToday
      ? 'bg-[#4affbd] border-2 border-[#ffe855] ring-2 ring-[#ffe855]/30'
      : 'bg-[#4affbd] hover:bg-[#5bff89] border border-[#4affbd] text-black';
  };

  return (
    <div className="expressive-card p-6 sm:p-7 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4affbd]/15 text-[#4affbd] flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base tracking-tight">Submission Activity</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
            <strong className="text-white font-mono">{totalYearSubmissions.toLocaleString()}</strong> submissions past year
          </span>
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
            Streak: <strong className="text-[#4affbd] font-mono">{profile.calendar.streak}d</strong>
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 pt-1">
        <div className="inline-block min-w-[760px] select-none">
          {/* Months header */}
          <div className="flex text-[10px] text-slate-400 font-semibold mb-2 pl-7">
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
            <div className="flex flex-col justify-between text-[9px] text-slate-500 font-medium pr-2 py-0.5 h-[105px]">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            <div className="flex gap-[4px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[4px]">
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
                      className={`w-[12px] h-[12px] rounded-[3.5px] transition-all duration-200 cursor-pointer ${getColorClass(
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

        {/* Floating Tooltip */}
        {hoveredCell && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-full bg-[#161a22]/95 text-white text-xs shadow-2xl border border-white/[0.15] font-semibold whitespace-nowrap backdrop-blur-2xl"
            style={{ left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#4affbd]">
                {hoveredCell.cell.count} submission{hoveredCell.cell.count !== 1 ? 's' : ''}
              </span>
              <span className="text-slate-300">on {hoveredCell.cell.dateStr}</span>
              {hoveredCell.cell.isToday && (
                <span className="px-2 py-0.2 rounded-full bg-[#ffe855]/20 text-[#ffe855] text-[10px] font-extrabold">
                  TODAY
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
          <Info className="w-3.5 h-3.5 text-[#ffe855]" />
          <span>Yellow border marks today. Preserved streak updates instantly.</span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span>Less</span>
          <div className="flex gap-1.5 items-center">
            <span className="w-3 h-3 rounded-[3px] bg-white/[0.04] border border-white/[0.06]" />
            <span className="w-3 h-3 rounded-[3px] bg-[#0d3d2d]" />
            <span className="w-3 h-3 rounded-[3px] bg-[#147250]" />
            <span className="w-3 h-3 rounded-[3px] bg-[#4affbd]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
