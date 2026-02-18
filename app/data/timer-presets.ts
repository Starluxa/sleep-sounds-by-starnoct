export interface TimerPreset {
  seconds: number;
  color: string;
  iconClass: string;
  label: string;
}

export const TIMER_PRESETS: TimerPreset[] = [
  { seconds: 15 * 60, color: "from-purple-400/20 to-purple-500/15", iconClass: "text-purple-400", label: "15 min" },
  { seconds: 30 * 60, color: "from-sky-400/20 to-sky-500/15", iconClass: "text-sky-400", label: "30 min" },
  { seconds: 60 * 60, color: "from-emerald-400/20 to-emerald-500/15", iconClass: "text-emerald-400", label: "1 hour" },
  { seconds: 120 * 60, color: "from-indigo-400/20 to-indigo-500/15", iconClass: "text-indigo-400", label: "2 hours" },
  { seconds: 240 * 60, color: "from-rose-400/20 to-rose-500/15", iconClass: "text-rose-400", label: "4 hours" },
  { seconds: 480 * 60, color: "from-yellow-400/20 to-yellow-500/15", iconClass: "text-yellow-400", label: "8 hours" },
];