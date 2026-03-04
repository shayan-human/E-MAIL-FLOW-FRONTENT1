"use client";

import { useState, useEffect } from "react";
import { PenTool, KeySquare, HelpCircle, ArrowLeft, ArrowRight, UserCircle2 } from "lucide-react";
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

export function Step3Copy({ onNext, onBack }: Step3Props) {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded && user) {
            fetchAccounts();
        }
    }, [isLoaded, user]);

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
            toast.error("Failed to fetch accounts");
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
            toast.error("Please enter an email subject");
            return;
        }
        if (!body.trim()) {
            toast.error("Please enter the email body");
            return;
        }
        if (selectedAccountIds.length === 0) {
            toast.error("Please select at least one sender account");
            return;
        }
        onNext(subject, body, selectedAccountIds);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-heading font-bold text-foreground">Campaign Details</h2>
                <p className="text-muted-foreground">Draft your email and select which Google accounts to disperse the sends across.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Email Copy Editor (Spans 2 cols) */}
                <Card className="border-0 shadow-md ring-1 ring-black/5 lg:col-span-2 flex flex-col h-full">
                    <CardHeader className="bg-primary/5 border-b pb-4">
                        <CardTitle className="text-xl font-heading flex items-center gap-2">
                            <PenTool className="h-5 w-5 text-primary" />
                            Email Copy
                        </CardTitle>
                        <CardDescription>
                            Use <code className="bg-white dark:bg-zinc-800 px-1 py-0.5 rounded text-primary">{"{{firstName}}"}</code> to insert the leads mapped first name.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6 flex-1 flex flex-col">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-base font-semibold">Subject Line</Label>
                            <Input
                                id="subject"
                                placeholder="e.g. Quick question about {{firstName}}..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="text-base py-6"
                            />
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col">
                            <Label htmlFor="body" className="text-base font-semibold">Email Body</Label>
                            <Textarea
                                id="body"
                                placeholder="Hi {{firstName}},&#10;&#10;I noticed you..."
                                value={body}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                                className="flex-1 min-h-[300px] text-base leading-relaxed resize-none font-sans"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Account Selection */}
                <Card className="border-0 shadow-md ring-1 ring-black/5 bg-muted/20 flex flex-col h-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-heading flex items-center gap-2">
                            <KeySquare className="h-5 w-5 text-primary" />
                            Sender Accounts
                        </CardTitle>
                        <CardDescription>
                            Select accounts to rotate sending.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {isLoadingAccounts ? (
                            <p className="text-sm text-muted-foreground animate-pulse">Loading accounts...</p>
                        ) : accounts.length === 0 ? (
                            <div className="bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/20 text-sm flex gap-2">
                                <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>No sender accounts found. Please go back to Step 1 and connect an account.</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b">
                                    <span className="text-sm font-medium text-muted-foreground">Select All</span>
                                    <Checkbox
                                        checked={selectedAccountIds.length === accounts.length}
                                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                                            if (checked) setSelectedAccountIds(accounts.map(a => a.id));
                                            else setSelectedAccountIds([]);
                                        }}
                                    />
                                </div>
                                {accounts.map(acc => (
                                    <div
                                        key={acc.id}
                                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedAccountIds.includes(acc.id) ? 'bg-primary/5 border-primary/30' : 'bg-card hover:bg-muted/50'}`}
                                        onClick={() => toggleAccount(acc.id, !selectedAccountIds.includes(acc.id))}
                                    >
                                        <Checkbox
                                            id={`acc-${acc.id}`}
                                            checked={selectedAccountIds.includes(acc.id)}
                                            onCheckedChange={(c: boolean | 'indeterminate') => toggleAccount(acc.id, c as boolean)}
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()} // prevent double toggle
                                        />
                                        <div className="grid gap-1.5 leading-none flex-1">
                                            <label htmlFor={`acc-${acc.id}`} className="text-sm font-medium leading-none cursor-pointer truncate">
                                                {acc.email}
                                            </label>
                                        </div>
                                        <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between pt-4 border-t mt-8">
                <Button variant="ghost" size="lg" onClick={onBack} className="font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={!subject.trim() || !body.trim() || selectedAccountIds.length === 0}
                    className="px-8 font-bold"
                >
                    Finalize Schedule <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
