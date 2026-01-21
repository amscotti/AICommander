# AICommander

<p align="center">
    <img src="images/wizard_controlling_the_elements.jpg" alt="A wizard controlling the elements - Leonardo AI" width="600">
</p>

AICommander is an AI-powered command line tool that generates command line
instructions based on user queries. It supports multiple AI providers
(Anthropic, xAI, OpenAI) and provides a helpful assistant specializing in
command line operations for different operating systems.

[![asciicast](https://asciinema.org/a/KGEejCmg0Q7ygnc1xMRHmS9Y0.svg)](https://asciinema.org/a/KGEejCmg0Q7ygnc1xMRHmS9Y0)

## Features

- Generates command line instructions tailored to the user's operating system
  and current directory.
- Supports multiple AI providers: Anthropic (Claude), xAI (Grok), and OpenAI
  (GPT).
- Provides reasoning for each generated command.
- Interactive prompt to execute the suggested command.
- Auto-run mode with `-r` flag to skip confirmation.

## Requirements

- Deno runtime
- API key for at least one supported provider:
  - `ANTHROPIC_API_KEY` for Anthropic (Claude)
  - `XAI_API_KEY` for xAI (Grok)
  - `OPENAI_API_KEY` for OpenAI (GPT)

## Installation

1. Ensure you have Deno installed on your system. You can install it from
   https://deno.com/.
2. Clone the repository or download the source files.
3. Copy `.env.example` to `.env` and add your API key(s).

## Usage

Run the tool using the Deno CLI:

```sh
deno task dev "What is the command to list all files?"
```

Or run directly:

```sh
deno run -A main.ts "How do I find files larger than 100MB?"
```

Use the `-r` flag to auto-execute the command without confirmation:

```sh
deno run -A main.ts -r "List all running processes"
```

Follow the interactive prompt to execute the command if you agree with the
suggestion.

## Provider Priority

When multiple API keys are set, AICommander uses the first available provider in
this order:

1. Anthropic (Claude claude-haiku-4-5)
2. xAI (Grok grok-4-1-fast-non-reasoning)
3. OpenAI (GPT gpt-5-mini)
