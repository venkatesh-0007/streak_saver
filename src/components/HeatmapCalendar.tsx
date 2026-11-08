import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
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

interface MonthCluster {
  monthKey: string;
  monthShort: string;
  year: number;
  columns: (DayCell | null)[][];
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ profile }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    cell: DayCell;
    x: number;
    y: number;
  } | null>(null);

  const calendarData = profile.calendar.submissionCalendar || {};
  const totalActiveDays = profile.calendar.totalActiveDays || 0;
  const maxStreak = profile.calendar.streak || 0;

  // Build the 12 month clusters exactly as shown in LeetCode
  const { monthClusters, totalYearSubmissions } = useMemo(() => {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const todayTs = todayUtc.getTime() / 1000;

    let totalSubs = 0;
    const clusters: MonthCluster[] = [];

    const curYear = todayUtc.getUTCFullYear();
    const curMonth = todayUtc.getUTCMonth();
    const curDate = todayUtc.getUTCDate();

    // Past 12 months ending in current month
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(Date.UTC(curYear, curMonth - i, 1));
      const y = monthStart.getUTCFullYear();
      const m = monthStart.getUTCMonth();
      const monthShort = monthStart.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      const isCurrentMonth = i === 0;

      // In current month, only go up to today's date (or full month with future empty)
      const daysInThisMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const maxDay = isCurrentMonth ? curDate : daysInThisMonth;
      const startDayOfWeek = monthStart.getUTCDay();

      const columns: (DayCell | null)[][] = [];
      let currentColumn: (DayCell | null)[] = new Array(7).fill(null);
      let dayOfWeek = startDayOfWeek;

      for (let day = 1; day <= maxDay; day++) {
        const d = new Date(Date.UTC(y, m, day));
        const ts = d.getTime() / 1000;
        const count = calendarData[String(ts)] || 0;
        totalSubs += count;

        currentColumn[dayOfWeek] = {
          date: d,
          dateStr: d.toISOString().split('T')[0],
          utcTs: ts,
          count,
          isToday: ts === todayTs,
          dayOfMonth: day,
          dayOfWeek,
        };

        dayOfWeek++;
        if (dayOfWeek === 7) {
          columns.push(currentColumn);
          currentColumn = new Array(7).fill(null);
          dayOfWeek = 0;
        }
      }

      if (currentColumn.some((c) => c !== null)) {
        columns.push(currentColumn);
      }

      clusters.push({
        monthKey: `${y}-${m}`,
        monthShort,
        year: y,
        columns,
      });
    }

    return { monthClusters: clusters, totalYearSubmissions: totalSubs };
  }, [calendarData]);

  // Auto-scroll to end (current month) on mobile/mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [monthClusters]);

  // Color mapping matching LeetCode screenshot exactly
  const getCellColor = (count: number, isToday: boolean) => {
    if (count === 0) {
      return isToday
        ? 'bg-[#383838] border-2 border-[#FFA116] ring-1 ring-[#FFA116]/40'
        : 'bg-[#383838] hover:bg-[#484848]';
    }
    if (count === 1) {
      return isToday
        ? 'bg-[#0e5935] border-2 border-[#FFA116] ring-1 ring-[#FFA116]/40'
        : 'bg-[#0e5935] hover:bg-[#127042]';
    }
    if (count <= 3) {
      return isToday
        ? 'bg-[#179b4b] border-2 border-[#FFA116] ring-1 ring-[#FFA116]/40'
        : 'bg-[#179b4b] hover:bg-[#1db357]';
    }
    if (count <= 6) {
      return isToday
        ? 'bg-[#3de07a] border-2 border-[#FFA116] ring-1 ring-[#FFA116]/40'
        : 'bg-[#3de07a] hover:bg-[#52e78c]';
    }
    return isToday
      ? 'bg-[#a3ffcd] border-2 border-[#FFA116] ring-1 ring-[#FFA116]/40'
      : 'bg-[#a3ffcd] hover:bg-[#bdffdc]';
  };

  return (
    <div className="bg-[#282828] border border-white/[0.08] rounded-2xl p-4 sm:p-6 shadow-xl transition-all">
      {/* Top Info Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 mb-4 border-b border-white/[0.06]">
        {/* Left: Total submissions */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {totalYearSubmissions.toLocaleString()}
          </span>
          <span className="text-xs sm:text-sm text-[#8A8A8E] font-normal flex items-center gap-1.5">
            <span>submissions in the past one year</span>
            <span title="Past 365 days of activity on LeetCode" className="cursor-help text-[#71717A] hover:text-[#FFA116] transition">
              <Info className="w-3.5 h-3.5 inline" />
            </span>
          </span>
        </div>

        {/* Right: Total active days & Max streak */}
        <div className="flex items-center gap-4 text-xs text-[#8A8A8E] font-medium self-start sm:self-auto">
          <span>
            Total active days: <strong className="text-white font-mono font-bold">{totalActiveDays}</strong>
          </span>
          <span>
            Max streak: <strong className="text-white font-mono font-bold">{maxStreak}</strong>
          </span>
        </div>
      </div>

      {/* Single Horizontal Month-Divided Heatmap Section */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto pb-2 pt-1 scroll-smooth select-none"
      >
        <div className="inline-flex items-start gap-3 sm:gap-4.5 min-w-max pr-2">
          {monthClusters.map((cluster) => (
            <div key={cluster.monthKey} className="flex flex-col items-center">
              {/* Columns of 7 days within this month */}
              <div className="flex gap-[3.5px]">
                {cluster.columns.map((column, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-[3.5px]">
                    {column.map((day, rowIdx) => {
                      if (!day) {
                        return (
                          <div
                            key={`empty-${rowIdx}`}
                            className="w-[11.5px] h-[11.5px] sm:w-[13px] sm:h-[13px] opacity-0 pointer-events-none"
                          />
                        );
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
                          className={`w-[11.5px] h-[11.5px] sm:w-[13px] sm:h-[13px] rounded-[3px] transition-colors cursor-pointer ${getCellColor(
                            day.count,
                            day.isToday
                          )}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Month label centered below its columns */}
              <div className="text-[11px] text-[#8A8A8E] font-medium mt-2.5 text-center">
                {cluster.monthShort}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Tooltip */}
        {hoveredCell && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg bg-[#181818] text-white text-xs shadow-2xl border border-white/[0.15] font-semibold whitespace-nowrap"
            style={{ left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#FFA116]">
                {hoveredCell.cell.count} submission{hoveredCell.cell.count !== 1 ? 's' : ''}
              </span>
              <span className="text-[#8A8A8E]">on {hoveredCell.cell.dateStr}</span>
              {hoveredCell.cell.isToday && (
                <span className="px-1.5 py-0.2 rounded bg-[#FFA116] text-black text-[9px] font-black">
                  TODAY
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & hint */}
      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-[#8A8A8E]">
        <span className="text-[11px] text-[#71717A] hidden sm:inline">
          Scroll horizontally to view past months
        </span>
        <div className="flex items-center gap-1.5 text-[11px] ml-auto">
          <span className="text-[#71717A] mr-1">Less</span>
          <span className="w-3 h-3 rounded-[2.5px] bg-[#383838]" />
          <span className="w-3 h-3 rounded-[2.5px] bg-[#0e5935]" />
          <span className="w-3 h-3 rounded-[2.5px] bg-[#179b4b]" />
          <span className="w-3 h-3 rounded-[2.5px] bg-[#3de07a]" />
          <span className="w-3 h-3 rounded-[2.5px] bg-[#a3ffcd]" />
          <span className="text-[#71717A] ml-1">More</span>
        </div>
      </div>
    </div>
  );
};
