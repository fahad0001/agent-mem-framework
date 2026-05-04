# Requirement: F-0009 - Fix Scaffold Validation, Capability Pruning, and Shipped Agent Skills

## Problem

Generated projects initialized by the CLI must validate cleanly and must not ship unselected capability agents by default. The framework also needs reusable skills for PR review, e2e test writing, UI/UX work, presentations, AHC evidence handling, and memory transformation.

## Functional Requirements

- FR-1: `ai-sdlc init` and `ai-sdlc create` outputs include `docs/agent-logs/README.md` so the guard-required log root exists in packaged templates.
- FR-2: Copied agent prompts in generated projects include the full Anti-Hallucination Operating Rules block, not only marker placeholders.
- FR-3: `ai-sdlc adopt` applies the same capability filtering model as `init`: default diagnostics only, with `--capabilities` supporting categories, ids, and `all`.
- FR-4: Scaffolded projects include workspace skills for PR review, e2e testing, UI/UX, presentations, AHC evidence, and memory transforms.
- FR-5: Agent operating instructions require clarification before silent defaults when missing input can affect scope, risk, architecture, data handling, or user-visible behavior.
