"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { UploadCloud, FileSpreadsheet, CheckCircle2, ArrowRight, ArrowLeft, Target, Database, FileCode, ShieldCheck, Activity } from "lucide-react";
import { toast } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface MappedLead {
    email: string;
    firstName: string;
}

interface Step2Props {
    onNext: (mappedLeads: MappedLead[], totalCount: number) => void;
    onBack: () => void;
}

export function Step2Leads({ onNext, onBack }: Step2Props) {
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [totalRows, setTotalRows] = useState(0);

    // Column Mapping State
    const [emailCol, setEmailCol] = useState<string>("");
    const [firstNameCol, setFirstNameCol] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
            toast.error("INVALID_FILE_PROTOCOL");
            return;
        }

        setFile(selectedFile);
        parseCSV(selectedFile);
    };

    const parseCSV = (csvFile: File) => {
        setIsParsing(true);
        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setIsParsing(false);
                if (results.errors.length > 0 && results.data.length === 0) {
                    toast.error("PARSER_SIGNAL_LOSS");
                    return;
                }

                const cols = results.meta.fields || [];
                setHeaders(cols);
                setTotalRows(results.data.length);
                setPreviewData(results.data.slice(0, 3));

                // Auto-detect columns
                const eMatch = cols.find(c => c.toLowerCase().includes("email"));
                const fMatch = cols.find(c => c.toLowerCase().includes("first") || c.toLowerCase() === "name");

                if (eMatch) setEmailCol(eMatch);
                if (fMatch) setFirstNameCol(fMatch);
            },
            error: (error) => {
                setIsParsing(false);
                toast.error(`KERNEL_READ_FAULT: ${error.message}`);
            }
        });
    };

    const handleNext = () => {
        if (!emailCol) {
            toast.error("PRIMARY_KEY_MAP_MISSING");
            return;
        }

        if (!file) return;

        setIsParsing(true);
        const finalLeads: MappedLead[] = [];
        let validCount = 0;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            step: (row) => {
                const data: any = row.data;
                const e = data[emailCol]?.trim();
                if (e) {
                    finalLeads.push({
                        email: e,
                        firstName: firstNameCol ? (data[firstNameCol]?.trim() || "") : "",
                    });
                    validCount++;
                }
            },
            complete: () => {
                setIsParsing(false);
                toast.success(`BUFFER_LOADED: ${validCount} TARGETS`);
                onNext(finalLeads, validCount);
            }
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 relative">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Target className="w-4 h-4 shadow-[0_0_8px_#3b82f6]" />
                    </div>
                    <h2 className="text-3xl font-black font-outfit text-white tracking-tighter uppercase">Target Acquisition</h2>
                </div>
                <p className="text-zinc-500 font-medium text-[13px] tracking-tight">Ingest lead matrices via CSV and define structural entry points.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-2">
                {/* Data Ingestion Frame */}
                <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Matrix_Ingestion // Stream</span>
                    <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-8 min-h-[400px] flex flex-col relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {!file ? (
                            <div
                                className="flex-1 flex flex-col items-center justify-center cursor-pointer relative z-10 space-y-6"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".csv"
                                    className="hidden"
                                />
                                <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:border-blue-500/20 transition-all">
                                    <Database className="h-10 w-10 text-zinc-800 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em] group-hover:text-white transition-colors">Select_Target_Manifest</p>
                                    <p className="text-[9px] text-zinc-700 font-black mt-2 uppercase tracking-tighter">MAX_THROUGHPUT: 50.0K_ROWS</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col justify-center items-center relative z-10 space-y-8">
                                <div className="p-8 rounded-[2rem] bg-blue-500/5 border border-blue-500/20 w-full text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <FileCode className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                                    <h4 className="text-xl font-black text-white tracking-tight uppercase truncate mb-1">{file.name}</h4>
                                    <p className="text-[10px] text-zinc-500 font-black tracking-widest">{totalRows.toLocaleString()} ENTRIES_PARSED</p>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                >
                                    PURGE_BUFFER // RESET
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Structural Mapping */}
                <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Schema_Bridge // Definition</span>
                    <div className={`bg-black/20 border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-8 h-full transition-all ${!file ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Primary_Target_Key (EMAIL)</label>
                                <Select value={emailCol} onValueChange={setEmailCol}>
                                    <SelectTrigger className="glass-card h-14 border-white/5 text-xs font-black tracking-widest uppercase">
                                        <SelectValue placeholder="MAP_SOURCE" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-white/10 text-[10px] font-black uppercase">
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payload_Variable (NAME)</label>
                                <Select value={firstNameCol || "none"} onValueChange={(v) => setFirstNameCol(v === "none" ? "" : v)}>
                                    <SelectTrigger className="glass-card h-14 border-white/5 text-xs font-black tracking-widest uppercase">
                                        <SelectValue placeholder="MAP_SOURCE (OPTIONAL)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-white/10 text-[10px] font-black uppercase">
                                        <SelectItem value="none">-- NULL --</SelectItem>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {previewData.length > 0 && emailCol && (
                            <div className="mt-auto p-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-3 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
                                    <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">LIVE_PREVIEW</span>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">DATA_POINT_01</span>
                                        <span className="text-[11px] font-black text-blue-500 uppercase tracking-tighter">{previewData[0][emailCol] || "EMPTY"}</span>
                                    </div>
                                    {firstNameCol && (
                                        <div>
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">DATA_POINT_02</span>
                                            <span className="text-[11px] font-black text-white uppercase tracking-tighter">{previewData[0][firstNameCol] || "EMPTY"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
                    disabled={!file || !emailCol || isParsing}
                    className={`px-12 py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 ${!file || !emailCol || isParsing
                            ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5 opacity-50'
                            : 'bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.2)] border border-blue-400'
                        }`}
                >
                    {isParsing ? "BUFFERING..." : "PAYLOAD_CONFIG"}
                    <Target className="w-4 h-4 shadow-[0_0_8px_#3b82f6]" />
                </button>
            </div>
        </div>
    );
}
