"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/toast-provider";
import {
    Calculator,
    Play,
    AlertTriangle,
    CalendarDays,
    Clock,
    Mails,
    ArrowLeft,
    Zap,
    Shuffle,
    ListOrdered,
    ShieldAlert,
    Activity,
    Cpu,
    Target,
    Terminal,
    Globe,
    Settings,
    Radio
} from "lucide-react";

import {
    CampaignSettingsSchema,
    type CampaignSettings,
    type CampaignPayload
} from "@/lib/validations/campaign";

import {
    calculateTotalCapacity,
    calculateRequiredDays,
    calculateAverageDelay,
    checkWindowWarning,
    estimateCompletionTime,
    type EstimationResult
} from "@/lib/calculations";

import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const TIMEZONES = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT/BST)" },
    { value: "Europe/Berlin", label: "Central Europe (CET/CEST)" },
    { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

import { MappedLead } from "@/components/campaign-builder/Step2Leads";

interface Step4Props {
    leads: MappedLead[];
    subject: string;
    body: string;
    selectedAccountIds: string[];
    onBack: () => void;
}

export function CampaignScheduler({ leads, subject, body, selectedAccountIds, onBack }: Step4Props) {
    const [isInstantSubmitting, setIsInstantSubmitting] = useState(false);
    const [isScheduleSubmitting, setIsScheduleSubmitting] = useState(false);

    const totalLeads = leads.length;
    const activeAccounts = selectedAccountIds.length;

    const [capacity, setCapacity] = useState(0);
    const [daysInt, setDaysInt] = useState(0);
    const [avgDelay, setAvgDelay] = useState(0);
    const [windowWarning, setWindowWarning] = useState(false);
    const [estimate, setEstimate] = useState<EstimationResult>({
        estimatedEndDate: "",
        estimatedEndTime: "",
        totalCalendarDaysScheduled: 0,
    });

    const form = useForm<CampaignSettings>({
        resolver: zodResolver(CampaignSettingsSchema) as any,
        defaultValues: {
            totalLeads: totalLeads,
            activeAccounts: activeAccounts,
            dailyLimitPerAccount: 40,
            startTime: "09:00",
            endTime: "17:00",
            minDelay: 5,
            maxDelay: 15,
            skipWeekends: true,
            timezone: "America/New_York",
            startDate: format(new Date(), 'yyyy-MM-dd'),
            sendingMode: "round-robin" as const,
        },
        mode: "onChange",
    });

    useEffect(() => {
        const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (localTz) {
            form.setValue("timezone", localTz);
        }
    }, [form]);

    useEffect(() => {
        form.setValue("totalLeads", totalLeads);
        form.setValue("activeAccounts", activeAccounts);
    }, [totalLeads, activeAccounts, form]);

    const values = form.watch();

    useEffect(() => {
        if (
            !isNaN(values.activeAccounts) &&
            !isNaN(values.dailyLimitPerAccount) &&
            !isNaN(values.totalLeads) &&
            !isNaN(values.minDelay) &&
            !isNaN(values.maxDelay) &&
            values.startDate
        ) {
            const currentCapacity = calculateTotalCapacity(values.activeAccounts, values.dailyLimitPerAccount);
            const reqDays = calculateRequiredDays(values.totalLeads, currentCapacity);
            const average = calculateAverageDelay(values.minDelay, values.maxDelay);
            const isWarn = checkWindowWarning(
                values.dailyLimitPerAccount,
                average,
                values.startTime,
                values.endTime
            );

            const newEstimate = estimateCompletionTime(
                values.totalLeads,
                currentCapacity,
                average,
                values.startTime,
                values.endTime,
                values.timezone,
                values.skipWeekends,
                values.startDate
            );

            setCapacity(currentCapacity);
            setDaysInt(reqDays);
            setAvgDelay(average);
            setWindowWarning(isWarn);
            setEstimate(newEstimate);
        }
    }, [
        values.totalLeads,
        values.activeAccounts,
        values.dailyLimitPerAccount,
        values.startTime,
        values.endTime,
        values.minDelay,
        values.maxDelay,
        values.skipWeekends,
        values.timezone,
        values.startDate
    ]);

    async function onSubmit(data: CampaignSettings) {
        setIsScheduleSubmitting(true);
        const idempotencyKey = uuidv4();

        const payload = {
            ...data,
            idempotencyKey,
            subject,
            body,
            selectedAccountIds,
            mappedLeads: leads,
        } as unknown as CampaignPayload;

        try {
            const response = await fetch("/api/campaign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(result?.error || `PROTOCOL_ERROR: ${response.statusText}`);
            }

            toast.success("ORCHESTRATION_COMMITTED", {
                description: result?.data?.dispatched ? "Workflow dispatched to execution engine." : "Sequence initialized and stored.",
            });

            setTimeout(() => {
                window.location.href = "/campaigns";
            }, 1500);
        } catch (error: unknown) {
            toast.error("DEPLOYMENT_FAILURE", {
                description: error instanceof Error ? error.message : "Internal system fault",
            });
        } finally {
            setIsScheduleSubmitting(false);
        }
    }

    async function handleInstantExecution() {
        setIsInstantSubmitting(true);
        const idempotencyKey = uuidv4();

        const instantData = form.getValues();

        const payload = {
            ...instantData,
            idempotencyKey,
            subject,
            body,
            selectedAccountIds,
            mappedLeads: leads,
        } as CampaignPayload;

        try {
            const response = await fetch("/api/campaign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(result?.error || `INSTANT_DEPLOY_FAULT: ${response.statusText}`);
            }

            toast.success("INSTANT_TRANSMISSION_ACTIVE", {
                description: "Primary vector launch sequence initiated.",
            });

            setTimeout(() => {
                window.location.href = "/campaigns";
            }, 1500);
        } catch (error: unknown) {
            toast.error("INSTANT_LAUNCH_ABORTED", {
                description: error instanceof Error ? error.message : "Unknown vector collision",
            });
        } finally {
            setIsInstantSubmitting(false);
        }
    }

    return (
        <div className="grid gap-12 lg:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Control Matrix */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Settings className="w-4 h-4 shadow-[0_0_8px_#3b82f6]" />
                    </div>
                    <h2 className="text-3xl font-black font-outfit text-white tracking-tighter uppercase">Campaign Orchestration</h2>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Technical Meta */}
                            <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-20">
                                    <Activity className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">Target_Vector_Size</label>
                                    <p className="text-lg font-black text-white tracking-widest">{totalLeads.toLocaleString()} <span className="text-[10px] text-zinc-600 font-bold ml-1 tracking-normal">UNITS</span></p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">Available_Nodes</label>
                                    <p className="text-lg font-black text-blue-500 tracking-widest">{activeAccounts} <span className="text-[10px] text-zinc-600 font-bold ml-1 tracking-normal">ACTIVE</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Launch_Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" className="glass-card h-14 border-white/5 text-xs font-black tracking-widest uppercase" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[9px] font-black uppercase tracking-widest" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dailyLimitPerAccount"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Node_Limit (DAILY)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} className="glass-card h-14 border-white/5 text-xs font-black tracking-widest uppercase" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                                            </FormControl>
                                            <FormMessage className="text-[9px] font-black uppercase tracking-widest" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-3">
                                <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Temporal_Zone</FormLabel>
                                <FormField
                                    control={form.control}
                                    name="timezone"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="glass-card h-14 border-white/5 text-xs font-black tracking-widest uppercase">
                                                    <SelectValue placeholder="MAP_SOURCE" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-zinc-950 border-white/10 text-[10px] font-black uppercase">
                                                {TIMEZONES.map((tz) => (
                                                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Window_Open</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="glass-card h-14 border-white/5 text-center font-black tracking-tighter text-xl text-blue-500" {...field} onChange={e => { field.onChange(e); form.trigger("endTime"); }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endTime"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Window_Close</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="glass-card h-14 border-white/5 text-center font-black tracking-tighter text-xl text-emerald-500" {...field} onChange={e => { field.onChange(e); form.trigger("startTime"); }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="minDelay"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Min_Delay (M)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} className="glass-card h-14 border-white/5 text-xs font-black tracking-widest uppercase" {...field} onChange={e => { field.onChange(parseInt(e.target.value, 10) || 0); form.trigger("maxDelay"); }} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxDelay"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Max_Delay (M)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} className="glass-card h-14 border-white/5 text-xs font-black tracking-widest uppercase" {...field} onChange={e => { field.onChange(parseInt(e.target.value, 10) || 0); form.trigger("minDelay"); }} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Tactics Switcher */}
                            <FormField
                                control={form.control}
                                name="sendingMode"
                                render={({ field }) => (
                                    <div className="space-y-4">
                                        <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Transmission_Tactic</FormLabel>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => field.onChange("round-robin")}
                                                className={`p-6 rounded-[1.5rem] border transition-all flex flex-col items-center text-center gap-3 ${field.value === "round-robin" ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                            >
                                                <Shuffle className={`w-5 h-5 ${field.value === "round-robin" ? 'text-blue-500' : 'text-zinc-600'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${field.value === "round-robin" ? 'text-white' : 'text-zinc-500'}`}>Round_Robin</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => field.onChange("sequential")}
                                                className={`p-6 rounded-[1.5rem] border transition-all flex flex-col items-center text-center gap-3 ${field.value === "sequential" ? 'bg-amber-600/10 border-amber-500/50' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                            >
                                                <ListOrdered className={`w-5 h-5 ${field.value === "sequential" ? 'text-amber-500' : 'text-zinc-600'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${field.value === "sequential" ? 'text-white' : 'text-zinc-500'}`}>Sequential</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="skipWeekends"
                                render={({ field }) => (
                                    <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-white/5 border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Temporal_Guard</p>
                                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-tight">Omit Saturday & Sunday</p>
                                        </div>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </div>
                                )}
                            />

                            {windowWarning && (
                                <div className="p-6 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 flex gap-4">
                                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Temporal_Collision_Risk</p>
                                        <p className="text-[9px] font-medium text-red-200/70 leading-relaxed uppercase">High Limit + Long Delay detected. Window may close before payload completes. Sequence will defer.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <Button
                                    type="button"
                                    onClick={handleInstantExecution}
                                    disabled={isInstantSubmitting || isScheduleSubmitting}
                                    className="h-16 rounded-[1.5rem] bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
                                >
                                    {isInstantSubmitting ? "INITIATING..." : "INSTANT_LAUNCH"}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isScheduleSubmitting || isInstantSubmitting}
                                    className="h-16 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 border border-blue-400 text-[10px] font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(37,99,235,0.2)]"
                                >
                                    {isScheduleSubmitting ? "BUFFERING..." : "COMMIT_SEQUENCE"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>

            {/* Live Telemetry */}
            <div className="flex flex-col gap-6">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Telemetrics // Real_Time</span>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-black/20 border border-white/5 rounded-[2rem] p-8 space-y-4">
                        <Radio className="w-4 h-4 text-blue-500" />
                        <div>
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Peak_Throughput</p>
                            <p className="text-3xl font-black text-white tracking-widest uppercase">{capacity.toLocaleString()}</p>
                            <p className="text-[8px] font-black text-zinc-600 uppercase mt-1 tracking-widest">TRANSMISSIONS / DAY</p>
                        </div>
                    </div>
                    <div className="bg-black/20 border border-white/5 rounded-[2rem] p-8 space-y-4">
                        <CalendarDays className="w-4 h-4 text-emerald-500" />
                        <div>
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Payload_Duration</p>
                            <p className="text-3xl font-black text-white tracking-widest uppercase">{daysInt}</p>
                            <p className="text-[8px] font-black text-zinc-600 uppercase mt-1 tracking-widest">ACTIVE_CYCLES</p>
                        </div>
                    </div>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-10 flex-1 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl" />

                    <div className="flex items-center gap-4 border-b border-white/5 pb-8 relative z-10">
                        <Clock className="w-6 h-6 text-zinc-600" />
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Final_Projected_State</h3>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-tight">Post-Orchestration Completion</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-12 relative z-10 py-12">
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Estimated_Terminal_Date</span>
                            <div className="text-6xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                {estimate.estimatedEndDate || "---"}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Terminal_Time_UTC</span>
                                <span className="text-xl font-black text-blue-500 uppercase tracking-widest">{estimate.estimatedEndTime || "---"}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total_Calendar_span</span>
                                <span className="text-xl font-black text-white uppercase tracking-widest">{estimate.totalCalendarDaysScheduled} <span className="text-[10px] text-zinc-600 ml-1">DAYS</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 relative z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">System_Model: PREDICTIVE_RECURSION_V4</p>
                    </div>
                </div>
            </div>

            <div className="col-span-full flex items-center justify-between pt-8 border-t mt-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> PREV_SEQUENCE
                </button>
                <div className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">
                    ORCHESTRATOR // READY
                </div>
            </div>
        </div>
    );
}
