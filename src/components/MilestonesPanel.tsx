import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Milestone } from '../types';
import { ThemeConfig } from '../styles/themes';
import { MilestoneProgress, DEFAULT_MILESTONE_DAYS } from '../utils/dateCalculations';
import { Sparkles, Plus, Trash2, Bell, BellOff, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MilestonesPanelProps {
  milestoneProgress: MilestoneProgress;
  customMilestones: Milestone[];
  showDefaultMilestones: boolean;
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onAddMilestone: (
    days: number,
    label: string,
    trackingType: Milestone['trackingType'],
    startDate: string | undefined,
    targetDate: string | undefined,
    status: Milestone['status']
  ) => Promise<void>;
  onDeleteMilestone: (id: string) => Promise<void>;
  onUpdateMilestoneStatus: (id: string, status: NonNullable<Milestone['status']>) => Promise<void>;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => Promise<void>;
}

export const MilestonesPanel: React.FC<MilestonesPanelProps> = ({
  milestoneProgress,
  customMilestones,
  showDefaultMilestones,
  theme,
  isOpen,
  onClose,
  onAddMilestone,
  onDeleteMilestone,
  onUpdateMilestoneStatus,
  notificationsEnabled,
  onToggleNotifications,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [daysInput, setDaysInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [trackingTypeInput, setTrackingTypeInput] = useState<NonNullable<Milestone['trackingType']>>('daily');
  const [startDateInput, setStartDateInput] = useState(new Date().toISOString().slice(0, 10));
  const [targetDateInput, setTargetDateInput] = useState('');
  const [statusInput, setStatusInput] = useState<NonNullable<Milestone['status']>>('planned');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusWarning, setStatusWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: theme.particleColors,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseInt(daysInput, 10);
    const milestoneDays = Number.isNaN(days) ? 0 : days;
    if ((!isNaN(days) && days < 0) || !labelInput.trim()) return;
    if (trackingTypeInput === 'daily' && (isNaN(days) || days <= 0)) {
      setStatusWarning('Daily milestones need a target duration in days.');
      return;
    }

    const startDate = startDateInput ? new Date(`${startDateInput}T00:00:00`) : new Date();
    const targetDate = trackingTypeInput === 'date'
      ? new Date(`${targetDateInput}T23:59:59`)
      : new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
    const now = new Date();
    if (statusInput === 'started' && startDate > now) {
      setStatusWarning('A milestone can only be started on or after its start date.');
      return;
    }
    if (statusInput === 'achieved' && targetDate > now) {
      setStatusWarning('This target is not due yet. It can be marked achieved after its target date.');
      return;
    }
    if (statusInput === 'missed' && targetDate > now) {
      setStatusWarning('A target can be marked not achieved only after its target date has passed.');
      return;
    }
    if (trackingTypeInput === 'date' && !targetDateInput) {
      setStatusWarning('Choose a target date for a time-based milestone.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddMilestone(
        milestoneDays,
        labelInput.trim(),
        trackingTypeInput,
        startDateInput || undefined,
        trackingTypeInput === 'date' ? targetDateInput : undefined,
        statusInput
      );
      setDaysInput('');
      setLabelInput('');
      setTrackingTypeInput('daily');
      setStartDateInput(new Date().toISOString().slice(0, 10));
      setTargetDateInput('');
      setStatusInput('planned');
      setStatusWarning(null);
      setIsAdding(false);
      handleCelebrate();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDays = milestoneProgress.currentDays;

  // Only the original seeded journey receives built-in milestones.
  const allList = [
    ...(showDefaultMilestones
      ? DEFAULT_MILESTONE_DAYS.map((d) => ({
          id: `default-${d.days}`,
          days: d.days,
          label: d.label,
          trackingType: 'daily',
          startDate: undefined,
          targetDate: undefined,
          status: undefined,
          isCustom: false,
        }))
      : []),
    ...customMilestones.map((c) => ({
      id: c.id,
      days: c.days,
      label: c.label,
      trackingType: c.trackingType || (c.targetDate ? 'date' : 'daily'),
      startDate: c.startDate,
      targetDate: c.targetDate,
      status: c.status,
      isCustom: true,
    })),
  ].sort((a, b) => a.days - b.days);

  return (
    <div
      id="milestones-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: '#0c0e14',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-medium">
              Progress & Horizons
            </span>
            <h2 className="text-xl sm:text-2xl font-cinzel text-white">Journey Milestones</h2>
              <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-white/45">
                If you do not update a milestone by its last target date, it will automatically be marked as not achieved.
              </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleNotifications(!notificationsEnabled)}
              title={notificationsEnabled ? 'Milestone notifications enabled' : 'Enable milestone notifications'}
              className={`p-2 rounded-full border transition-colors ${
                notificationsEnabled
                  ? 'bg-white/10 text-white border-white/30'
                  : 'bg-black/20 text-white/40 border-white/10 hover:text-white'
              }`}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
            <button
              id="close-milestones-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Next Milestone Hero Banner */}
          {statusWarning && !isAdding && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-400/10 p-2.5 text-[11px] text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{statusWarning}</span>
            </div>
          )}

          {milestoneProgress.nextMilestone && (
            <div
              className="p-5 rounded-xl border relative overflow-hidden transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: `${theme.accentColor}40`,
                boxShadow: `0 0 30px -10px ${theme.accentGlow}`,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
                    Next Destination
                  </span>
                  <h3 className="text-2xl font-cinzel text-white mt-0.5">
                    {milestoneProgress.nextMilestone.label}
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Arrives around <strong className="text-white font-medium">{milestoneProgress.nextMilestone.targetDate}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-3xl font-cinzel font-light text-white">
                    {milestoneProgress.nextMilestone.daysRemaining}
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">
                    Days Remaining
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-white/40 mb-1">
                  <span>Progress from previous milestone</span>
                  <span>{milestoneProgress.progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${milestoneProgress.progressPercent}%`,
                      backgroundColor: theme.accentColor,
                      boxShadow: `0 0 10px ${theme.accentColor}`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add custom milestone button / form */}
          {isAdding ? (
            <form
              onSubmit={handleCreate}
              className="p-4 rounded-xl border border-white/15 bg-white/[0.03] space-y-3"
            >
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="text-xs font-medium text-white">Set a Custom Milestone</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">Update Method</label>
                  <select
                    value={trackingTypeInput}
                    onChange={(e) => {
                      setTrackingTypeInput(e.target.value as NonNullable<Milestone['trackingType']>);
                      setStatusWarning(null);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                  >
                    <option value="daily">Daily update / target days</option>
                    <option value="date">Time-based / target date</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">Target Starts On</label>
                  <input
                    type="date"
                    required
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">
                    Target Days{trackingTypeInput === 'date' ? ' (optional)' : ''}
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 777"
                    value={daysInput}
                    onChange={(e) => setDaysInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">Title / Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lucky 777 Days"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">
                    Target Date{trackingTypeInput === 'date' ? '' : ' (optional)'}
                  </label>
                  <input
                    type="date"
                    value={targetDateInput}
                    onChange={(e) => setTargetDateInput(e.target.value)}
                    disabled={trackingTypeInput !== 'date'}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">Milestone Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => {
                      setStatusInput(e.target.value as NonNullable<Milestone['status']>);
                      setStatusWarning(null);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                  >
                    <option value="planned">Planned</option>
                    <option value="started">Started</option>
                    <option value="achieved">Achieved</option>
                    <option value="missed">Not achieved</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all hover:scale-105"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: theme.accentContrastText,
                  }}
                >
                  Save Milestone
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/60 font-medium">Full Journey Roadmap</span>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all hover:scale-105 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Custom Milestone</span>
              </button>
            </div>
          )}

          {/* Milestone List */}
          <div className="space-y-2">
            {allList.map((m) => {
              const targetTimestamp = m.trackingType === 'date' && m.targetDate
                ? new Date(`${m.targetDate}T23:59:59`)
                : m.startDate
                  ? new Date(m.startDate).getTime() + m.days * 24 * 60 * 60 * 1000
                  : null;
              const targetTime = targetTimestamp instanceof Date ? targetTimestamp.getTime() : targetTimestamp;
              const hasPassedTarget = targetTime !== null && targetTime <= Date.now();
              const manuallyAchieved = m.status === 'achieved';
              const status = manuallyAchieved
                ? 'achieved'
                : m.status === 'missed' || (hasPassedTarget && !manuallyAchieved)
                  ? 'missed'
                  : m.status === 'started'
                    ? 'started'
                    : !m.isCustom && currentDays >= m.days
                      ? 'achieved'
                      : 'planned';
              const reached = status === 'achieved';
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    reached
                      ? 'bg-white/[0.04] border-white/15 text-white'
                      : status === 'missed'
                        ? 'bg-red-500/[0.04] border-red-400/20 text-white/70'
                        : 'bg-black/20 border-white/5 text-white/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {reached ? (
                      <CheckCircle2
                        className="w-4 h-4 cursor-pointer hover:scale-125 transition-transform"
                        style={{ color: theme.accentColor }}
                        onClick={handleCelebrate}
                      />
                    ) : status === 'missed' ? (
                      <div className="w-4 h-4 rounded-full border border-red-400/60" />
                    ) : status === 'started' ? (
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: theme.accentColor }} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20" />
                    )}
                    <div>
                      <h4 className="text-sm font-medium">{m.label}</h4>
                      <span className="text-[11px] text-white/40">
                        {m.trackingType === 'date' ? `Target ${m.targetDate}` : `${m.days.toLocaleString()} days from ${m.startDate || 'journey start'}`}
                      </span>
                      {status === 'started' && (
                        <div className="mt-2 h-1 w-40 max-w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${targetTime ? Math.min(100, Math.max(4, ((Date.now() - new Date(m.startDate || Date.now()).getTime()) / Math.max(1, targetTime - new Date(m.startDate || Date.now()).getTime())) * 100)) : 4}%`,
                              backgroundColor: theme.accentColor,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {reached ? (
                      <span className="text-xs font-medium text-emerald-400">Target achieved ✓</span>
                    ) : status === 'missed' ? (
                      <span className="text-xs font-medium text-red-300">Not achieved</span>
                    ) : status === 'started' ? (
                      <span className="text-xs font-medium" style={{ color: theme.accentColor }}>Started</span>
                    ) : (
                      <span className="text-xs text-white/40">
                        {(m.days - currentDays).toLocaleString()} days to go
                      </span>
                    )}

                    {m.isCustom && (
                      <>
                        <select
                          aria-label={`Status for ${m.label}`}
                          value={status}
                          disabled={status === 'missed'}
                          onChange={(e) => {
                            const nextStatus = e.target.value as NonNullable<Milestone['status']>;
                            if (nextStatus === 'achieved' && !hasPassedTarget) {
                              setStatusWarning(`“${m.label}” cannot be marked achieved until its target date has passed.`);
                              return;
                            }
                            if (nextStatus === 'missed' && !hasPassedTarget) {
                              setStatusWarning(`“${m.label}” can only be marked not achieved after its target date.`);
                              return;
                            }
                            onUpdateMilestoneStatus(m.id, nextStatus);
                          }}
                          className="rounded-md bg-black/40 border border-white/15 px-1.5 py-1 text-[10px] text-white/70 [color-scheme:dark]"
                        >
                          <option value="planned">Planned</option>
                          <option value="started">Started</option>
                          <option value="achieved">Achieved</option>
                          <option value="missed">Not achieved</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onDeleteMilestone(m.id)}
                          className="p-1 text-white/25 hover:text-red-400 transition-colors"
                          aria-label={`Delete ${m.label}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
