"use client";

import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type Draft = {
    id: string;
    name: string;
    subject: string | null;
    body: string | null;
    created_at: string;
};

function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: "#222222" }}>
            <div className="h-4 w-4 rounded skeleton-shimmer" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded skeleton-shimmer" />
                <div className="h-3 w-64 rounded skeleton-shimmer" />
            </div>
        </div>
    );
}

export function RotateDraftsSelector(props: {
    enabled: boolean;
    selectedDraftIds: string[];
    onSelectedDraftIdsChange: (ids: string[]) => void;
}) {
    const { enabled, selectedDraftIds, onSelectedDraftIdsChange } = props;
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const selectedSet = useMemo(() => new Set(selectedDraftIds), [selectedDraftIds]);

    useEffect(() => {
        if (!enabled || hasFetched) return;
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/drafts", { method: "GET" });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const json = await res.json().catch(() => ({}));
                const rows = Array.isArray(json?.data) ? (json.data as Draft[]) : [];
                if (!cancelled) {
                    setDrafts(rows);
                    setHasFetched(true);
                }
            } catch (e) {
                if (!cancelled) {
                    setError("Failed to load drafts. Please refresh.");
                    setDrafts([]);
                    setHasFetched(true);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [enabled, hasFetched]);

    const toggleDraft = (id: string, checked: boolean) => {
        if (checked) {
            onSelectedDraftIdsChange([...selectedDraftIds, id]);
        } else {
            onSelectedDraftIdsChange(selectedDraftIds.filter((d) => d !== id));
        }
    };

    if (!enabled) return null;

    return (
        <div className="space-y-3">
            <div className="rounded-[10px] p-5 border" style={{ backgroundColor: "#0f0f0f", borderColor: "#222222" }}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white">Select Drafts to Rotate</span>
                    <span className="text-xs text-[#6b7280]">Round robin order</span>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-[#6b7280]">{error}</p>
                    </div>
                ) : drafts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-[#6b7280] mb-3">No drafts found. Open Drafts Library to create one.</p>
                        <a
                            href="/drafts"
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                            style={{ backgroundColor: "#F59E0B", color: "#0f0f0f" }}
                            rel="noreferrer"
                        >
                            Open Drafts Library
                        </a>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {drafts.map((d) => {
                            const checked = selectedSet.has(d.id);
                            const subj = (d.subject || "").trim();
                            return (
                                <div
                                    key={d.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? "bg-white/5" : "hover:bg-white/3"}`}
                                    style={{ borderColor: checked ? "rgba(245, 158, 11, 0.35)" : "#222222" }}
                                    onClick={() => toggleDraft(d.id, !checked)}
                                >
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={(c: boolean | "indeterminate") => toggleDraft(d.id, c as boolean)}
                                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-white truncate">{d.name}</div>
                                        <div className="text-xs text-[#9ca3af] truncate">{subj || "(No subject)"}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
