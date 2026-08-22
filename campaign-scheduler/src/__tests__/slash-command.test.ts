import { describe, it, expect, vi } from "vitest";
import { useSlashCommand } from "@/hooks/useSlashCommand";

const OPTIONS = [
  { label: "First Name", tag: "{{firstName}}" },
  { label: "Last Name", tag: "{{lastName}}" },
  { label: "Email", tag: "{{email}}" },
];

describe("useSlashCommand logic", () => {
  it("options filter correctly by label or tag", () => {
    const q = "first";
    const filtered = OPTIONS.filter(
      opt => opt.label.toLowerCase().includes(q) || opt.tag.toLowerCase().includes(q)
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].label).toBe("First Name");
  });

  it("calculates string replacement correctly", () => {
    const value = "Hello /first";
    const slashIndex = 6;
    const searchQuery = "first";
    const tag = "{{firstName}}";

    const before = value.substring(0, slashIndex);
    const queryLen = searchQuery.length;
    const after = value.substring(slashIndex + 1 + queryLen);
    const newValue = before + tag + after;

    expect(newValue).toBe("Hello {{firstName}}");
  });
});
