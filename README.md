# AICommander

<p align="center">
    <img src="images/wizard_controlling_the_elements.jpg" alt="A wizard controlling the elements - Leonardo AI" width="600">
</p>

AICommander is an AI-powered command line tool that leverages OpenAI's models to
generate command line instructions based on user queries. It is designed to work
with various OpenAI models and provides a helpful assistant specializing in
command line operations for different operating systems.

[![asciicast](https://asciinema.org/a/KGEejCmg0Q7ygnc1xMRHmS9Y0.svg)](https://asciinema.org/a/KGEejCmg0Q7ygnc1xMRHmS9Y0)

## Features

- Supports multiple OpenAI models including GPT-4 and GPT-3.5.
- Generates command line instructions tailored to the user's operating system
  and current directory.
- Provides reasoning for each generated command.
- Interactive prompt to execute the suggested command.

## Requirements

- Deno runtime
- OpenAI API key

## Installation

1. Ensure you have Deno installed on your system. You can install it from
   https://deno.com/.
2. Clone the repository or download the `main.ts` file.
3. Set your OpenAI API key as an environment variable `OPENAI_API_KEY`.

## Usage

Run the tool using the Deno CLI:

```sh
deno run -A main.ts
```

You can specify the model to use with the `-m` or `--model` option:

```sh
deno run -A main.ts -m gpt-4-turbo-preview "What is the command to list all files?"
```

Follow the interactive prompt to execute the command if you agree with the
suggestion.
