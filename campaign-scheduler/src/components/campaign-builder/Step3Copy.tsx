"use client";

import { useState, useEffect, useRef } from "react";
import { PenTool, KeySquare, HelpCircle, ArrowLeft, ArrowRight, UserCircle2, Cpu, Terminal, Layers, Globe, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast-provider";
import { Account } from "./Step1Accounts";
import { insforge } from "@/lib/insforge";
import { useUser } from "@insforge/nextjs";

interface Step3Props {
    onNext: (subject: string, body: string, selectedAccountIds: string[]) => void;
    onBack: () => void;
}

const PERSONALIZATION_OPTIONS = [
    { label: 'First Name', tag: '{{firstName}}' },
    { label: 'Last Name', tag: '{{lastName}}' },
    { label: 'Full Name', tag: '{{fullName}}' },
    { label: 'Business Name', tag: '{{businessName}}' },
    { label: 'Email', tag: '{{email}}' },
    { label: 'Website', tag: '{{website}}' },
];

export function Step3Copy({ onNext, onBack }: Step3Props) {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    // Popup state
    const [activePopup, setActivePopup] = useState<'subject' | 'body' | null>(null);
    const [slashIndex, setSlashIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const subjectContainerRef = useRef<HTMLDivElement>(null);
    const bodyContainerRef = useRef<HTMLDivElement>(null);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded && user) {
            fetchAccounts();
        }
    }, [isLoaded, user]);

    // Handle click outside for popup
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (activePopup === 'subject' && subjectContainerRef.current && !subjectContainerRef.current.contains(event.target as Node)) {
                setActivePopup(null);
            } else if (activePopup === 'body' && bodyContainerRef.current && !bodyContainerRef.current.contains(event.target as Node)) {
                setActivePopup(null);
            }
        }
        if (activePopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activePopup]);

    const fetchAccounts = async () => {
        if (!user) return;
        setIsLoadingAccounts(true);
        try {
            const { data, error } = await insforge.database
                .from("sender_accounts")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setAccounts(data || []);
            if (data && data.length > 0) {
                setSelectedAccountIds(data.map((a: Account) => a.id));
            }
        } catch {
            toast.error("DATA_FETCH_ERROR: ACCOUNTS_STREAM_OFFLINE");
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    const toggleAccount = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedAccountIds(prev => [...prev, id]);
        } else {
            setSelectedAccountIds(prev => prev.filter(accId => accId !== id));
        }
    };

    const handleNext = () => {
        if (!subject.trim()) {
            toast.error("PROTOCOL_ERROR: SUBJECT_NULL");
            return;
        }
        if (!body.trim()) {
            toast.error("PROTOCOL_ERROR: PAYLOAD_EMPTY");
            return;
        }
        if (selectedAccountIds.length === 0) {
            toast.error("AUTH_ERROR: NO_SENDER_THROUGHPUT");
            return;
        }
        onNext(subject, body, selectedAccountIds);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: 'subject' | 'body'
    ) => {
        const val = e.target.value;
        if (field === 'subject') setSubject(val);
        else setBody(val);

        const cursorPosition = e.target.selectionStart;
        if (cursorPosition && val.charAt(cursorPosition - 1) === '/') {
            setActivePopup(field);
            setSlashIndex(cursorPosition - 1);
            setSelectedIndex(0);
        } else if (activePopup === field && cursorPosition && val.charAt(cursorPosition - 1) !== '/') {
            setActivePopup(null);
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: 'subject' | 'body'
    ) => {
        if (activePopup === field) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % PERSONALIZATION_OPTIONS.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + PERSONALIZATION_OPTIONS.length) % PERSONALIZATION_OPTIONS.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleSelectOption(PERSONALIZATION_OPTIONS[selectedIndex], field);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setActivePopup(null);
            }
        }
    };

    const handleSelectOption = (option: { label: string, tag: string }, field: 'subject' | 'body') => {
        if (field === 'subject') {
            if (slashIndex !== null) {
                const before = subject.substring(0, slashIndex);
                const after = subject.substring(slashIndex + 1);
                setSubject(before + option.tag + after);
            } else {
                setSubject(prev => prev + option.tag);
            }
        } else {
            if (slashIndex !== null) {
                const before = body.substring(0, slashIndex);
                const after = body.substring(slashIndex + 1);
                setBody(before + option.tag + after);
            } else {
                setBody(prev => prev + option.tag);
            }
        }
        setActivePopup(null);
        setSlashIndex(null);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 relative">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Terminal className="w-4 h-4 shadow-[0_0_8px_#3b82f6]" />
                    </div>
                    <h2 className="text-3xl font-black font-outfit text-white tracking-tighter uppercase">Payload Configuration</h2>
                </div>
                <p className="text-zinc-500 font-medium text-[13px] tracking-tight">Construct the communication vector and assign transmission nodes.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-3">
                {/* Vector Editor */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Vector_Assembler // Editor</span>
                    <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-8 flex-1 min-h-[500px]">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Vector_Header (SUBJECT)</label>
                            <div className="relative" ref={subjectContainerRef}>
                                <Input
                                    id="subject"
                                    placeholder="e.g. TRANSMISSION_INIT // {{firstName}}..."
                                    value={subject}
                                    onChange={(e) => handleInputChange(e, 'subject')}
                                    onKeyDown={(e) => handleKeyDown(e, 'subject')}
                                    className="glass-card h-14 border-white/5 text-xs font-black tracking-widest uppercase placeholder:text-zinc-800"
                                    autoComplete="off"
                                />
                                {activePopup === 'subject' && (
                                    <div className="absolute top-full left-0 mt-4 w-64 rounded-2xl border border-white/10 glass-card z-50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-white/10 bg-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                            Personalization_Matrix
                                        </div>
                                        <div className="p-1 max-h-60 overflow-y-auto">
                                            {PERSONALIZATION_OPTIONS.map((option, idx) => (
                                                <button
                                                    key={option.tag}
                                                    onClick={() => handleSelectOption(option, 'subject')}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-between group ${idx === selectedIndex ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    <span>{option.label}</span>
                                                    <span className={`text-[9px] font-mono ${idx === selectedIndex ? 'text-white/70' : 'text-zinc-600'}`}>{option.tag}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 flex-1 flex flex-col">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Vector_Payload (BODY)</label>
                            <div className="relative flex-1 flex flex-col" ref={bodyContainerRef}>
                                <Textarea
                                    id="body"
                                    placeholder="Hi {{firstName}},&#10;&#10;I detected a structural weakness in your..."
                                    value={body}
                                    onChange={(e) => handleInputChange(e, 'body')}
                                    onKeyDown={(e) => handleKeyDown(e, 'body')}
                                    className="flex-1 min-h-[350px] glass-card border-white/5 text-[13px] font-medium leading-relaxed resize-none p-6 text-zinc-200 placeholder:text-zinc-800"
                                />
                                {activePopup === 'body' && (
                                    <div className="absolute top-full left-0 mt-4 w-64 rounded-2xl border border-white/10 glass-card z-50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-white/10 bg-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                            Personalization_Matrix
                                        </div>
                                        <div className="p-1 max-h-60 overflow-y-auto">
                                            {PERSONALIZATION_OPTIONS.map((option, idx) => (
                                                <button
                                                    key={option.tag}
                                                    onClick={() => handleSelectOption(option, 'body')}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-between group ${idx === selectedIndex ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    <span>{option.label}</span>
                                                    <span className={`text-[9px] font-mono ${idx === selectedIndex ? 'text-white/70' : 'text-zinc-600'}`}>{option.tag}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Selection */}
                <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Transmission_Nodes // Matrix</span>
                    <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 h-full">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global_Selector</span>
                            <Checkbox
                                checked={selectedAccountIds.length === accounts.length && accounts.length > 0}
                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                    if (checked) setSelectedAccountIds(accounts.map(a => a.id));
                                    else setSelectedAccountIds([]);
                                }}
                                className="border-white/20 data-[state=checked]:bg-blue-600"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {isLoadingAccounts ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                                    ))}
                                </div>
                            ) : accounts.length === 0 ? (
                                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-center space-y-3">
                                    <ShieldCheck className="w-8 h-8 text-red-500/50 mx-auto" />
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">CRITICAL_ERROR: NO_NODES_FOUND</p>
                                </div>
                            ) : (
                                accounts.map(acc => (
                                    <div
                                        key={acc.id}
                                        onClick={() => toggleAccount(acc.id, !selectedAccountIds.includes(acc.id))}
                                        className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${selectedAccountIds.includes(acc.id)
                                                ? 'bg-blue-600/10 border-blue-500/30'
                                                : 'bg-white/5 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${selectedAccountIds.includes(acc.id) ? 'bg-blue-500/20 text-blue-500' : 'bg-zinc-900 text-zinc-600'}`}>
                                            <Globe className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{acc.email.split('@')[0]}</p>
                                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-tight truncate">{acc.email.split('@')[1]}</p>
                                        </div>
                                        <Checkbox
                                            id={`acc-${acc.id}`}
                                            checked={selectedAccountIds.includes(acc.id)}
                                            onCheckedChange={(c: boolean | 'indeterminate') => toggleAccount(acc.id, c as boolean)}
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                            className="border-white/20 data-[state=checked]:bg-blue-600"
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active_Cluster</span>
                                <span className="text-[10px] font-black text-blue-500">{selectedAccountIds.length}/{accounts.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-8 mt-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> PREV_SEQUENCE
                </button>
                <button
                    onClick={handleNext}
                    disabled={!subject.trim() || !body.trim() || selectedAccountIds.length === 0}
                    className={`px-12 py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 ${!subject.trim() || !body.trim() || selectedAccountIds.length === 0
                            ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5 opacity-50'
                            : 'bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.2)] border border-blue-400'
                        }`}
                >
                    COMMIT_PAYLOAD
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 shadow-[0_0_8px_#fbbf24]" />
                </button>
            </div>
        </div>
    );
}
