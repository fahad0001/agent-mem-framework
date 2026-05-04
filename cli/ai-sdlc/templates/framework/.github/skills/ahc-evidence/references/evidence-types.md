# Evidence Types Reference

Every factual claim in an agent-memory artifact must be backed by one of these evidence kinds. The schema for evidence records is defined in `docs/agent-memory/evidence.schema.json`.

---

## `file` — File Content Evidence

Use when: citing file contents, code, configuration, or documentation.

Required fields:

- `path` — workspace-relative path to the file
- `sha256` — SHA-256 hash of the file at time of reading
- `lineRange` — `[startLine, endLine]` if citing a specific section (optional)

Example:

```json
{
  "kind": "file",
  "path": "docs/agent-memory/index.json",
  "sha256": "a3f1c2...",
  "lineRange": [10, 25]
}
```

Collect with:

```bash
node <SKILL_DIR>/scripts/collect-evidence.mjs --files=<path,path>
```

---

## `command` — Command Execution Evidence

Use when: stating that a test passed, a build succeeded, a validation ran, or a script produced specific output.

Required fields:

- `command` — exact command string including all flags
- `cwd` — working directory
- `exitCode` — numeric exit code
- `stdoutHash` — SHA-256 of the captured stdout (use `""` if stdout is irrelevant)

Example:

```json
{
  "kind": "command",
  "command": "npm run validate:schema",
  "cwd": "d:/dev/ai-hardening-utilities/new",
  "exitCode": 0,
  "stdoutHash": "b7e4a1..."
}
```

---

## `test` — Test Result Evidence

Use when: claiming a test suite passes or specific tests cover a requirement.

Required fields:

- `testId` — test name or ID as reported by the runner
- `framework` — test framework (vitest, jest, playwright, etc.)
- `result` — `"pass"` or `"fail"`
- `runId` — timestamp or CI run identifier

---

## `web` — Web Resource Evidence

Use when: citing external documentation, specifications, or public content.

Required fields:

- `url` — exact URL
- `retrievedAt` — ISO-8601 timestamp
- `contentHash` — SHA-256 of the retrieved content

Note: web evidence is weakest (content may change). Prefer `file` or `command` evidence where possible.

---

## `human` — Human Confirmation Evidence

Use when: a user decision, approval, or clarification resolves an open question that cannot be verified programmatically.

Required fields:

- `prompt` — exact question posed to the user
- `answer` — user's response, verbatim or summarized
- `confirmedAt` — ISO-8601 timestamp

---

## `prior-artifact` — Previously Produced Artifact Evidence

Use when: an evaluation or report cites an artifact produced in an earlier phase of the same pipeline run.

Required fields:

- `path` — workspace-relative path to the artifact
- `sha256` — SHA-256 of the artifact at time of citation

---

## When Evidence Cannot Be Produced

If none of the above can be produced for a claim:

1. Set the field value to `"UNKNOWN"`
2. Set `"confidence": "unknown"` on the surrounding record
3. Add an entry to `openQuestions` explaining what is missing and how it could be resolved
4. **Never invent a plausible value**
