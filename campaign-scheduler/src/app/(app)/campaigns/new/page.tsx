"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft, Cpu, Binary, Zap, Plane, Shield, Terminal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Reuse existing step components
import { Step1Accounts } from "@/components/campaign-builder/Step1Accounts";
import { Step2Leads, MappedLead } from "@/components/campaign-builder/Step2Leads";
import { Step3Copy } from "@/components/campaign-builder/Step3Copy";
import { CampaignScheduler } from "@/components/campaign/CampaignScheduler";

const steps = [
    { number: 1, title: "CORE_LINK", icon: Cpu },
    { number: 2, title: "TARGET_LOAD", icon: TargetIcon },
    { number: 3, title: "PAYLOAD_CONFIG", icon: Binary },
    { number: 4, title: "EXEC_SEQUENCE", icon: Zap },
];

function TargetIcon(props: any) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    );
}

export default function NewCampaignPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    // Campaign state passed between steps
    const [leads, setLeads] = useState<MappedLead[]>([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

    const handleNextStep1 = () => setCurrentStep(2);

    const handleNextStep2 = (mappedLeads: MappedLead[]) => {
        setLeads(mappedLeads);
        setCurrentStep(3);
    };

    const handleNextStep3 = (subj: string, msg: string, acctIds: string[]) => {
        setSubject(subj);
        setBody(msg);
        setSelectedAccountIds(acctIds);
        setCurrentStep(4);
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Mission Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-black/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-6 relative z-10">
                    <button
                        onClick={() => router.push("/campaigns")}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all shadow-xl shadow-black/50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Terminal className="w-5 h-5 text-blue-500" />
                            <h1 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase italic">Unit Initialization</h1>
                        </div>
                        <p className="text-zinc-500 font-black text-[10px] tracking-[0.3em] uppercase opacity-60">Deployment Matrix // Step {currentStep} of 4</p>
                    </div>
                </div>

                {/* Step Visualizer */}
                <div className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-white/5 rounded-2xl backdrop-blur-xl relative z-10">
                    {steps.map((step, idx) => (
                        <div key={step.number} className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full transition-all duration-500 ${currentStep >= step.number ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-zinc-800'
                                    }`}
                            />
                            {idx < steps.length - 1 && <div className="w-4 h-[1px] bg-white/5" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sequence Control Matrix */}
            <div className="grid grid-cols-12 gap-10">
                {/* Sidebar Step Tracker */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.number;
                        const isCompleted = currentStep > step.number;

                        return (
                            <div
                                key={step.number}
                                className={`p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between ${isActive
                                        ? 'bg-blue-600 text-white border-blue-400 shadow-[0_20px_40px_rgba(37,99,235,0.2)] scale-105 z-10 relative'
                                        : isCompleted
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500/60 opacity-60'
                                            : 'bg-black/20 border-white/5 text-zinc-700 opacity-40 hover:opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isActive ? 'bg-white/20 border-white/30' : 'bg-black/40 border-white/5'
                                        }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-[8px] font-black tracking-[0.2em] uppercase ${isActive ? 'text-white/60' : 'text-zinc-500'}`}>Phase_0{step.number}</span>
                                        <span className="text-[11px] font-black tracking-widest">{step.title}</span>
                                    </div>
                                </div>
                                {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                                {isActive && <ArrowRight className="w-4 h-4 animate-pulse" />}
                            </div>
                        );
                    })}
                </div>

                {/* Main Assembly Frame */}
                <div className="col-span-12 lg:col-span-9">
                    <div className="glass-card min-h-[600px] relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />

                        <div className="flex-1 p-8 md:p-12">
                            {currentStep === 1 && <Step1Accounts onNext={handleNextStep1} />}
                            {currentStep === 2 && (
                                <Step2Leads onNext={handleNextStep2} onBack={() => setCurrentStep(1)} />
                            )}
                            {currentStep === 3 && (
                                <Step3Copy onNext={handleNextStep3} onBack={() => setCurrentStep(2)} />
                            )}
                            {currentStep === 4 && (
                                <CampaignScheduler
                                    leads={leads}
                                    subject={subject}
                                    body={body}
                                    selectedAccountIds={selectedAccountIds}
                                    onBack={() => setCurrentStep(3)}
                                />
                            )}
                        </div>

                        {/* Status Footer */}
                        <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                                    <span className="text-[9px] font-black text-zinc-500 tracking-[0.2em]">ASSEMBLY_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                    <span className="text-[9px] font-black text-zinc-500 tracking-[0.2em]">KERNEL_VER: 3.1.0_PRO</span>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-blue-500/60 tracking-[0.2em]">READY_FOR_DEPLOYMENT</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
