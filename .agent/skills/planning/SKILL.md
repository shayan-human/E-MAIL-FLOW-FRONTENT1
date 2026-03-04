---
name: planning
description: Creates comprehensive implementation plans broken down into bite-sized, test-driven tasks. Use when the user has approved a design and needs a step-by-step execution plan before writing code.
---

# Feature Implementation Planning

## When to use this skill
- After a design doc has been approved by the user.
- Before starting any code execution on a new feature or complex bug.
- When tasked with writing an implementation plan.

## Workflow
- [ ] Understand the approved design and architecture in the current work tree.
- [ ] Break the feature down into bite-sized tasks (2-5 minutes of work each).
- [ ] For each task, define exact file paths, test commands, and minimal implementation code following TDD.
- [ ] Save the completed plan to `docs/plans/YYYY-MM-DD-<feature-name>.md`.
- [ ] Ask the user how they want to execute the plan.

## Instructions
Write comprehensive plans assuming the engineer has zero context for the codebase and questionable taste in system design. Emphasize DRY (Don't Repeat Yourself), YAGNI (You Aren't Gonna Need It), TDD (Test-Driven Development), and frequent commits.

### Plan Header Template
Every plan MUST start with this exact header layout:

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]
**Architecture:** [2-3 sentences about approach]
**Tech Stack:** [Key technologies/libraries]

---
```

### Task Structure Template
Every isolated task step MUST follow this layout strictly:

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Step 1: Write the failing test**
```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**Step 2: Run test to verify it fails**
Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**
```python
def function(input):
    return expected
```

**Step 4: Run test to verify it passes**
Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

**Step 5: Commit**
```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## Execution Handoff
After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/plans/<filename>.md`. Two execution options:**
1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration.
2. **Parallel Session (separate)** - Open new session with `executing-plans`, batch execution with checkpoints.
**Which approach?"**
