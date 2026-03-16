"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, 
  FolderOpen, 
  Inbox, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ChevronRight,
  X,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useSlashCommand } from "@/hooks/useSlashCommand";

const PERSONALIZATION_OPTIONS = [
  { label: 'First Name', tag: '{{firstName}}' },
  { label: 'Last Name', tag: '{{lastName}}' },
  { label: 'Full Name', tag: '{{fullName}}' },
  { label: 'Business Name', tag: '{{businessName}}' },
  { label: 'Email', tag: '{{email}}' },
  { label: 'Website', tag: '{{website}}' },
];

type Folder = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

type Draft = {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  folder_id: string | null;
};

type Location = 
  | { type: "all" }
  | { type: "uncategorized" }
  | { type: "folder"; folder: Folder };

const FOLDER_COLORS = [
  { name: "amber", value: "#F59E0B" },
  { name: "blue", value: "#3B82F6" },
  { name: "green", value: "#22C55E" },
  { name: "purple", value: "#A855F7" },
  { name: "red", value: "#EF4444" },
  { name: "muted", value: "#888888" },
];

export default function DraftsPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [location, setLocation] = useState<Location>({ type: "all" });
  const [loading, setLoading] = useState(true);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#F59E0B");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [editingFolderColor, setEditingFolderColor] = useState("#F59E0B");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [moveMenuOpenDraftId, setMoveMenuOpenDraftId] = useState<string | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [draftForm, setDraftForm] = useState({ name: "", subject: "", body: "" });
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "folder" | "draft" | null;
    id: string | null;
    name: string;
  }>({ open: false, type: null, id: null, name: "" });

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const subjectSlash = useSlashCommand({
    options: PERSONALIZATION_OPTIONS,
    value: draftForm.subject,
    onChange: (val) => setDraftForm(prev => ({ ...prev, subject: val })),
  });

  const bodySlash = useSlashCommand({
    options: PERSONALIZATION_OPTIONS,
    value: draftForm.body,
    onChange: (val) => setDraftForm(prev => ({ ...prev, body: val })),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [foldersRes, draftsRes] = await Promise.all([
        fetch("/api/folders"),
        fetch("/api/drafts"),
      ]);
      const foldersData = await foldersRes.json();
      const draftsData = await draftsRes.json();
      setFolders(foldersData.data || []);
      setDrafts(draftsData.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredDrafts = location.type === "all"
    ? drafts
    : location.type === "uncategorized"
      ? drafts.filter(d => !d.folder_id)
      : drafts.filter(d => d.folder_id === location.folder.id);

  const folderDraftCounts = folders.reduce((acc, folder) => {
    acc[folder.id] = drafts.filter(d => d.folder_id === folder.id).length;
    return acc;
  }, {} as Record<string, number>);

  const uncategorizedCount = drafts.filter(d => !d.folder_id).length;
  const allDraftsCount = drafts.length;

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), color: newFolderColor }),
      });
      const data = await res.json();
      if (data.data) {
        setFolders(prev => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)));
        setLocation({ type: "folder", folder: data.data });
        setNewFolderName("");
        setNewFolderColor("#F59E0B");
        setShowNewFolderInput(false);
      }
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  const handleUpdateFolder = async (id: string) => {
    if (!editingFolderName.trim()) return;
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingFolderName.trim(), color: editingFolderColor }),
      });
      const data = await res.json();
      if (data.data) {
        setFolders(prev => prev.map(f => f.id === id ? data.data : f).sort((a, b) => a.name.localeCompare(b.name)));
        if (location.type === "folder" && location.folder.id === id) {
          setLocation({ type: "folder", folder: data.data });
        }
      }
    } catch (err) {
      console.error("Failed to update folder:", err);
    }
    setEditingFolderId(null);
  };

  const handleDeleteFolder = async () => {
    if (!confirmModal.id) return;
    try {
      await fetch(`/api/folders/${confirmModal.id}`, { method: "DELETE" });
      setFolders(prev => prev.filter(f => f.id !== confirmModal.id));
      if (location.type === "folder" && location.folder.id === confirmModal.id) {
        setLocation({ type: "uncategorized" });
      }
      setConfirmModal({ open: false, type: null, id: null, name: "" });
    } catch (err) {
      console.error("Failed to delete folder:", err);
    }
  };

  const openDeleteFolderModal = (id: string, name: string) => {
    setConfirmModal({ open: true, type: "folder", id, name });
  };

  const handleMoveDraft = async (draftId: string, folderId: string | null) => {
    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderId }),
      });
      const data = await res.json();
      if (data.data) {
        setDrafts(prev => prev.map(d => d.id === draftId ? data.data : d));
      }
    } catch (err) {
      console.error("Failed to move draft:", err);
    }
    setMoveMenuOpenDraftId(null);
  };

  const handleDeleteDraft = async () => {
    if (!confirmModal.id) return;
    try {
      await fetch(`/api/drafts/${confirmModal.id}`, { method: "DELETE" });
      setDrafts(prev => prev.filter(d => d.id !== confirmModal.id));
      setConfirmModal({ open: false, type: null, id: null, name: "" });
    } catch (err) {
      console.error("Failed to delete draft:", err);
    }
  };

  const openDeleteDraftModal = (id: string, name: string) => {
    setConfirmModal({ open: true, type: "draft", id, name });
  };

  const handleCreateDraft = async () => {
    const currentFolderId = location.type === "folder" ? location.folder.id : null;
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: draftForm.name || "Untitled Draft", 
          subject: draftForm.subject, 
          body: draftForm.body,
          folder_id: currentFolderId,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setDrafts(prev => [data.data, ...prev]);
        setEditingDraftId(null);
        setDraftForm({ name: "", subject: "", body: "" });
      }
    } catch (err) {
      console.error("Failed to create draft:", err);
    }
  };

  const getLocationName = () => {
    if (location.type === "all") return "All Drafts";
    if (location.type === "uncategorized") return "Uncategorized";
    return location.folder.name;
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* LEFT PANEL */}
      <div className="w-60 shrink-0 border-r flex flex-col" style={{ backgroundColor: "#0f0f0f", borderColor: "#222222" }}>
        <div className="p-4">
          <h1 className="text-white font-bold text-base">Drafts</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          {/* All Drafts */}
          <button
            onClick={() => setLocation({ type: "all" })}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              location.type === "all" ? "border-l-4" : ""
            }`}
            style={{
              backgroundColor: location.type === "all" ? "#141414" : "transparent",
              borderColor: location.type === "all" ? "#F59E0B" : "transparent",
            }}
          >
            {location.type === "all" ? (
              <FolderOpen className="w-4 h-4" style={{ color: "#F59E0B" }} />
            ) : (
              <Folder className="w-4 h-4 text-[#888888]" />
            )}
            <span className="text-white text-sm flex-1">All Drafts</span>
            <span className="text-xs text-[#888888]">{allDraftsCount}</span>
          </button>

          {/* Uncategorized */}
          <button
            onClick={() => setLocation({ type: "uncategorized" })}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              location.type === "uncategorized" ? "border-l-4" : ""
            }`}
            style={{
              backgroundColor: location.type === "uncategorized" ? "#141414" : "transparent",
              borderColor: location.type === "uncategorized" ? "#F59E0B" : "transparent",
            }}
          >
            <Inbox className="w-4 h-4 text-[#888888]" />
            <span className="text-white text-sm flex-1">Uncategorized</span>
            <span className="text-xs text-[#888888]">{uncategorizedCount}</span>
          </button>

          <div className="my-3 border-t" style={{ borderColor: "#222222" }} />

          {/* Folders Section */}
          <div className="px-3 py-1">
            <span className="text-[#888888] text-xs uppercase tracking-wider">Folders</span>
          </div>

          <AnimatePresence>
            {folders.map(folder => (
              <motion.div
                key={folder.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                {editingFolderId === folder.id ? (
                  <div className="px-2 py-2 space-y-2">
                    <Input
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateFolder(folder.id);
                        if (e.key === "Escape") setEditingFolderId(null);
                      }}
                      autoFocus
                      className="h-9 text-sm"
                      style={{ backgroundColor: "#141414", borderColor: "#222222", color: "white" }}
                      placeholder="Folder name..."
                    />
                    <div className="flex gap-1">
                      {FOLDER_COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => setEditingFolderColor(c.value)}
                          className={`w-5 h-5 rounded-full ${editingFolderColor === c.value ? "ring-2 ring-white" : ""}`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setLocation({ type: "folder", folder })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMenuOpenId(menuOpenId === folder.id ? null : folder.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      location.type === "folder" && location.folder.id === folder.id ? "border-l-4" : ""
                    }`}
                    style={{
                      backgroundColor: location.type === "folder" && location.folder.id === folder.id ? "#141414" : "transparent",
                      borderColor: location.type === "folder" && location.folder.id === folder.id ? "#F59E0B" : "transparent",
                    }}
                  >
                    <Folder className="w-4 h-4" style={{ color: folder.color }} />
                    <span className="text-white text-sm flex-1 truncate">{folder.name}</span>
                    <span className="text-xs text-[#888888]">{folderDraftCounts[folder.id] || 0}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === folder.id ? null : folder.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5"
                    >
                      <MoreHorizontal className="w-3 h-3 text-[#888888]" />
                    </button>
                  </button>
                )}

                {/* Folder Actions Menu */}
                <AnimatePresence>
                  {menuOpenId === folder.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute left-full top-0 ml-1 z-50 py-1 rounded-lg shadow-xl min-w-[140px]"
                      style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingFolderId(folder.id);
                          setEditingFolderName(folder.name);
                          setEditingFolderColor(folder.color);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Rename
                      </button>
                      <button
                        onClick={() => {
                          setEditingFolderId(folder.id);
                          setEditingFolderName(folder.name);
                          setEditingFolderColor(folder.color);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                      >
                        <Folder className="w-3.5 h-3.5" /> Change Color
                      </button>
                      <button
                        onClick={() => openDeleteFolderModal(folder.id, folder.name)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* New Folder */}
          {showNewFolderInput ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-2 py-2 space-y-2"
            >
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") {
                    setShowNewFolderInput(false);
                    setNewFolderName("");
                  }
                }}
                autoFocus
                className="h-9 text-sm"
                style={{ backgroundColor: "#141414", borderColor: "#222222", color: "white" }}
                placeholder="Folder name..."
              />
              <div className="flex gap-1">
                {FOLDER_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setNewFolderColor(c.value)}
                    className={`w-5 h-5 rounded-full ${newFolderColor === c.value ? "ring-2 ring-white" : ""}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#F59E0B] hover:bg-white/5 rounded-lg w-full"
            >
              <Plus className="w-4 h-4" /> New Folder
            </button>
          )}
        </nav>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#0f0f0f" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#222222" }}>
          <div>
            <h2 className="text-white font-bold text-xl">{getLocationName()}</h2>
            {location.type === "folder" && (
              <p className="text-xs text-[#888888] mt-0.5">Saving to: {location.folder.name}</p>
            )}
            <p className="text-sm text-[#888888]">{filteredDrafts.length} drafts</p>
          </div>
          <Button
            onClick={() => setEditingDraftId("new")}
            className="font-semibold"
            style={{ backgroundColor: "#F59E0B", color: "#0f0f0f" }}
          >
            <Plus className="w-4 h-4 mr-2" /> New Draft
          </Button>
        </div>

        {/* Drafts Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 rounded-xl skeleton-shimmer" style={{ backgroundColor: "#141414" }} />
              ))}
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Mail className="w-12 h-12 text-[#888888] mb-3" />
              <p className="text-white font-medium">No drafts yet</p>
              <p className="text-sm text-[#888888]">Create a new draft to get started</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredDrafts.map(draft => (
                  <motion.div
                    key={draft.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group relative p-4 rounded-xl border cursor-pointer hover:border-[#F59E0B]/50 transition-colors"
                    style={{ backgroundColor: "#141414", borderColor: "#222222" }}
                  >
                    {/* Actions Menu */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMoveMenuOpenDraftId(moveMenuOpenDraftId === draft.id ? null : draft.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10"
                      >
                        <MoreHorizontal className="w-4 h-4 text-[#888888]" />
                      </button>
                      
                      <AnimatePresence>
                        {moveMenuOpenDraftId === draft.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-xl min-w-[160px] z-50"
                            style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
                          >
                            <div className="px-2 py-1 text-xs text-[#888888] uppercase">Move to</div>
                            {folders.map(f => (
                              <button
                                key={f.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveDraft(draft.id, f.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                              >
                                <Folder className="w-3.5 h-3.5" style={{ color: f.color }} />
                                {f.name}
                              </button>
                            ))}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveDraft(draft.id, null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                            >
                              <Inbox className="w-3.5 h-3.5 text-[#888888]" />
                              Uncategorized
                            </button>
                            <div className="my-1 border-t" style={{ borderColor: "#222222" }} />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDraftId(draft.id);
                                setDraftForm({ name: draft.name, subject: draft.subject, body: draft.body });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDraftModal(draft.id, draft.name);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <h3 className="text-white font-semibold mb-1 pr-6 truncate">{draft.name}</h3>
                    <p className="text-sm text-[#888888] mb-2 line-clamp-2">{draft.subject || "(No subject)"}</p>
                    <p className="text-xs text-[#666666]">
                      {new Date(draft.created_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* New/Edit Draft Modal */}
      <AnimatePresence>
        {editingDraftId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
            onClick={() => setEditingDraftId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-xl p-6"
              style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-bold text-lg mb-4">
                {editingDraftId === "new" ? "New Draft" : "Edit Draft"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#888888] mb-1 block">Name</label>
                  <Input
                    value={draftForm.name}
                    onChange={(e) => setDraftForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Draft name..."
                    className="w-full"
                    style={{ backgroundColor: "#0f0f0f", borderColor: "#222222", color: "white" }}
                  />
                </div>
                <div className="relative" ref={subjectSlash.popupRef}>
                  <label className="text-sm text-[#888888] mb-1 block">Subject</label>
                  <Input
                    ref={subjectInputRef}
                    value={draftForm.subject}
                    onChange={(e) => subjectSlash.handleInputChange(e.target.value, e.target.selectionStart ?? undefined)}
                    onKeyDown={subjectSlash.handleKeyDown}
                    placeholder="Email subject..."
                    className="w-full"
                    style={{ backgroundColor: "#0f0f0f", borderColor: "#222222", color: "white" }}
                  />
                  {subjectSlash.activePopup && (
                    <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border shadow-xl z-[60] overflow-hidden" style={{ backgroundColor: "#141414", borderColor: "#222" }}>
                      <div className="px-3 py-2 border-b text-xs font-semibold text-[#888888] uppercase" style={{ borderColor: "#222" }}>
                        Insert Personalization
                      </div>
                      <div className="p-1 max-h-60 overflow-y-auto">
                        {PERSONALIZATION_OPTIONS.map((option, idx) => (
                          <button
                            key={option.tag}
                            onClick={() => subjectSlash.handleSelectOption(option)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${idx === subjectSlash.selectedIndex ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'text-zinc-300 hover:bg-zinc-800'}`}
                          >
                            <span>{option.label}</span>
                            <span className={`text-xs font-mono opacity-50 ${idx === subjectSlash.selectedIndex ? 'text-[#F59E0B]' : ''}`}>{option.tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={bodySlash.popupRef}>
                  <label className="text-sm text-[#888888] mb-1 block">Body</label>
                  <textarea
                    ref={bodyTextareaRef}
                    value={draftForm.body}
                    onChange={(e) => bodySlash.handleInputChange(e.target.value, e.target.selectionStart ?? undefined)}
                    onKeyDown={bodySlash.handleKeyDown}
                    placeholder="Email body..."
                    rows={6}
                    className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                    style={{ backgroundColor: "#0f0f0f", borderColor: "#222222", color: "white" }}
                  />
                  {bodySlash.activePopup && (
                    <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border shadow-xl z-[60] overflow-hidden" style={{ backgroundColor: "#141414", borderColor: "#222" }}>
                      <div className="px-3 py-2 border-b text-xs font-semibold text-[#888888] uppercase" style={{ borderColor: "#222" }}>
                        Insert Personalization
                      </div>
                      <div className="p-1 max-h-60 overflow-y-auto">
                        {PERSONALIZATION_OPTIONS.map((option, idx) => (
                          <button
                            key={option.tag}
                            onClick={() => bodySlash.handleSelectOption(option)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${idx === bodySlash.selectedIndex ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'text-zinc-300 hover:bg-zinc-800'}`}
                          >
                            <span>{option.label}</span>
                            <span className={`text-xs font-mono opacity-50 ${idx === bodySlash.selectedIndex ? 'text-[#F59E0B]' : ''}`}>{option.tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setEditingDraftId(null)}
                  className="text-[#888888]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDraft}
                  className="font-semibold"
                  style={{ backgroundColor: "#F59E0B", color: "#0f0f0f" }}
                >
                  {editingDraftId === "new" ? "Create" : "Save"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.type === "folder" ? "Delete Folder" : "Delete Draft"}
        message={
          confirmModal.type === "folder"
            ? "Deleting this folder will move all drafts inside to Uncategorized."
            : `This draft "${confirmModal.name}" will be permanently deleted.`
        }
        confirmText={confirmModal.type === "folder" ? "Delete Folder" : "Delete Draft"}
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmModal.type === "folder" ? handleDeleteFolder : handleDeleteDraft}
        onCancel={() => setConfirmModal({ open: false, type: null, id: null, name: "" })}
      />
    </div>
  );
}
