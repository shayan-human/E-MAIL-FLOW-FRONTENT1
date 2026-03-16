"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "default";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen && cancelButtonRef.current) {
            cancelButtonRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            
            if (e.key === "Escape") {
                onCancel();
            } else if (e.key === "Enter") {
                onConfirm();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onCancel, onConfirm]);

    const getVariantStyles = () => {
        switch (variant) {
            case "danger":
                return {
                    iconBg: "rgba(239,68,68,0.15)",
                    iconColor: "#EF4444",
                    buttonBg: "#EF4444",
                    buttonText: "#FFFFFF",
                    buttonHover: "brightness-110%",
                };
            case "warning":
                return {
                    iconBg: "rgba(245,158,11,0.15)",
                    iconColor: "#F59E0B",
                    buttonBg: "#F59E0B",
                    buttonText: "#0f0f0f",
                    buttonHover: "brightness-110%",
                };
            default:
                return {
                    iconBg: "rgba(255,255,255,0.08)",
                    iconColor: "#FFFFFF",
                    buttonBg: "#F59E0B",
                    buttonText: "#0f0f0f",
                    buttonHover: "brightness-110%",
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                        style={{
                            backgroundColor: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(8px)",
                        }}
                        onClick={onCancel}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                        }}
                        style={{
                            backgroundColor: "#141414",
                            border: "1px solid #222222",
                            borderRadius: "16px",
                            maxWidth: "480px",
                            width: "100%",
                            padding: "40px",
                        }}
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                delay: 0.1,
                                type: "spring",
                                stiffness: 400,
                                damping: 20,
                            }}
                            className="absolute left-1/2 -translate-x-1/2"
                            style={{ top: "-28px" }}
                        >
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: variantStyles.iconBg }}
                            >
                                {variant === "danger" ? (
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={variantStyles.iconColor}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        <line x1="10" y1="11" x2="10" y2="17" />
                                        <line x1="14" y1="11" x2="14" y2="17" />
                                    </svg>
                                ) : variant === "warning" ? (
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={variantStyles.iconColor}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                ) : (
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={variantStyles.iconColor}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="16" x2="12" y2="12" />
                                        <line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                )}
                            </div>
                        </motion.div>

                        {/* Title */}
                        <h2
                            className="text-xl font-bold text-white text-center mt-4"
                            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                        >
                            {title}
                        </h2>

                        {/* Message */}
                        <p
                            className="text-sm text-center mt-4 mx-auto"
                            style={{
                                color: "#888888",
                                lineHeight: 1.6,
                                maxWidth: "360px",
                            }}
                        >
                            {message}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3 mt-8">
                            <button
                                ref={cancelButtonRef}
                                onClick={onCancel}
                                className="flex-1 h-11 rounded-[10px] text-white font-medium transition-all duration-150"
                                style={{
                                    backgroundColor: "#1a1a1a",
                                    border: "1px solid #222222",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#222222")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
                            >
                                {cancelText}
                            </button>
                            <motion.button
                                onClick={onConfirm}
                                className="flex-1 h-11 rounded-[10px] font-medium"
                                style={{
                                    backgroundColor: variantStyles.buttonBg,
                                    color: variantStyles.buttonText,
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {confirmText}
                            </motion.button>
                        </div>

                        {/* Mobile responsive */}
                        <style jsx>{`
                            @media (max-width: 400px) {
                                .flex.gap-3 {
                                    flex-direction: column;
                                }
                            }
                        `}</style>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
