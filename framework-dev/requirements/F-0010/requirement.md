# Requirement - F-0010

Title: Establish script-backed skill architecture and enforcement.

## Problem

The shipped skills were mostly prose instructions. Static and repeatable work such as context collection, surface inspection, evidence hashing, outline extraction, and memory graph conversion should be handled by deterministic scripts so agents do not spend tokens rediscovering or manually producing repeatable outputs.

## Requirement

Implement an automation-first skill structure where each shipped skill includes concise routing instructions and at least one deterministic script. Add repository validation so future skills must follow the contract, and ensure generated projects receive the same structure.
