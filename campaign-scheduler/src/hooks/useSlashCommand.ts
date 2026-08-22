import { useState, useCallback, useRef, useEffect, useMemo } from "react";

export interface SlashCommandOption {
  label: string;
  tag: string;
}

export interface UseSlashCommandOptions {
  options: SlashCommandOption[];
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}

export function useSlashCommand({ options, value, onChange, inputRef }: UseSlashCommandOptions) {
  const [activePopup, setActivePopup] = useState<boolean>(false);
  const [slashIndex, setSlashIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      opt => opt.label.toLowerCase().includes(q) || opt.tag.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  const handleInputChange = useCallback((newValue: string, cursorPosition?: number) => {
    onChange(newValue);

    if (cursorPosition !== undefined) {
      const charJustTyped = newValue.charAt(cursorPosition - 1);
      
      // Check if user just typed '/'
      if (charJustTyped === "/") {
        const charBeforeSlash = cursorPosition - 2 >= 0 ? newValue.charAt(cursorPosition - 2) : "";
        // Trigger slash command if at start of string or preceded by whitespace / boundary
        if (!charBeforeSlash || /\s|[({[<]/.test(charBeforeSlash)) {
          setActivePopup(true);
          setSlashIndex(cursorPosition - 1);
          setSearchQuery("");
          setSelectedIndex(0);
          return;
        }
      }

      if (activePopup && slashIndex !== null) {
        // If cursor moved before or at slash position, or slash character was removed
        if (cursorPosition <= slashIndex || newValue.charAt(slashIndex) !== "/") {
          setActivePopup(false);
          setSlashIndex(null);
          setSearchQuery("");
        } else {
          const query = newValue.slice(slashIndex + 1, cursorPosition);
          // If user typed space or newline after slash, close popup
          if (/\s/.test(query)) {
            setActivePopup(false);
            setSlashIndex(null);
            setSearchQuery("");
          } else {
            setSearchQuery(query);
            setSelectedIndex(0);
          }
        }
      }
    }
  }, [onChange, activePopup, slashIndex]);

  const handleSelectOption = useCallback((option: SlashCommandOption) => {
    if (slashIndex === null) return;

    const before = value.substring(0, slashIndex);
    const queryLen = searchQuery.length;
    const after = value.substring(slashIndex + 1 + queryLen);
    const newValue = before + option.tag + after;
    const newCursorPos = before.length + option.tag.length;

    onChange(newValue);

    setActivePopup(false);
    setSlashIndex(null);
    setSearchQuery("");

    if (inputRef && inputRef.current) {
      const el = inputRef.current;
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }, [slashIndex, searchQuery, value, onChange, inputRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!activePopup || filteredOptions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectOption(filteredOptions[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setActivePopup(false);
      setSlashIndex(null);
      setSearchQuery("");
    }
  }, [activePopup, filteredOptions, selectedIndex, handleSelectOption]);

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activePopup) return;

    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePopup(false);
        setSlashIndex(null);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePopup]);

  return {
    activePopup: activePopup && filteredOptions.length > 0,
    selectedIndex,
    filteredOptions,
    popupRef,
    handleInputChange,
    handleKeyDown,
    handleSelectOption,
  };
}

