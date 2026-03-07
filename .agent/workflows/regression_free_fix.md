---
description: Regression-Free Fix Workflow (Antigravity Secure Fix)
---

# Workflow: The Antigravity Secure Fix

Use this workflow whenever you are asked to "fix" a bug or "implement" a change that could affect existing logic.

## 1. Impact Analysis
Before modifying any code:
- Search for all usages of the target class/function/variable using `grep_search`.
- Identify "High-Risk Dependents" (e.g., Auth middleware, shared utility functions, database schemas).
- Summarize these dependencies in your Implementation Plan.

## 2. Implementation Planning
Create an `implementation_plan.md` that MUST include:
- **Scope**: Exactly which files will change.
- **Potential Side Effects**: A list of features that *could* break if this change fails.
- **Verification Plan**: How you will prove that existing features still work (e.g., specific test commands).

// turbo
## 3. Guardrail Tests (TDD)
Before modifying the implementation:
1. Identify/Create a test file for the feature being fixed.
2. Write a failing test for the bug (The "Red" phase).
3. Identify existing tests for "High-Risk Dependents". Run them to ensure they are currenty green.
4. DO NOT proceed until you have a test suite that can catch a regression.

## 4. Execution
Implement the fix while staying within the planned scope.

## 5. Verification & Walkthrough
Final steps before completion:
1. Run `npm test` (or equivalent) for the entire module, not just the fix.
2. Check linting.
3. Create a `walkthrough.md` that includes:
   - Verification results (test logs).
   - A list of the "Side Effect" features checked and verified.
