# Requirement - F-0011

Title: Add skill manifests and machine-readable memory folder indexes.

## Problem

The skill architecture had scripts, but it lacked concise machine-readable manifests for routing each skill's scripts, references, and evaluation signals. Agent memory also required agents to read broad Markdown sets when a machine-readable lookup layer could route them faster.

## Requirement

Add per-skill manifests and reference docs, enforce them with validation, and introduce script-generated folder-level `index.json` files under `docs/agent-memory/` with references from the root memory index.
