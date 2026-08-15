# Implement Prompt

You are implementing tasks from a single phase file.

## Instructions

1. Read `.speclet/context.md` and `.speclet/constitution.md` (if present).
2. Read `.speclet/tasks/index.md` to confirm the phase file location.
3. Load ONLY the requested phase file — do not load other phases.
4. Work through each unchecked task `- [ ]` in order:
   - Implement the task
   - Mark it done: `- [x]`
   - Move to the next

## Rules

- Follow the stack and conventions in context.md exactly
- Honour the quality rules, architecture principles, and DoD from constitution.md
- If a task is ambiguous, add a comment in the code and note it — do not guess
- Do not modify other phase files
- When all tasks in the phase are done, summarize what was built

## On Completion

Update the phase file header with:
```
Status: Complete
Completed: <date>
```
