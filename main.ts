import { OpenAI } from "https://deno.land/x/openai@v4.67.0/mod.ts";
import { green } from "jsr:@std/fmt/colors";
import { oraPromise } from "npm:ora";
import { parseArgs } from "jsr:@std/cli/parse-args";

const DEFAULT_MODEL = "gpt-4o-mini-2024-07-18";

const COMMAND_SCHEMA = {
  type: "object",
  properties: {
    command: {
      type: "string",
      description:
        "Suggested command, remember to add quotes around items, if needed especially if there's newline characters",
    },
    reasoning: {
      type: "string",
      description:
        "The reasoning for the suggested command, and explanation of what the command does",
    },
  },
  additionalProperties: false,
  required: ["command", "reasoning"],
};

const client: OpenAI = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
});

/**
 * Executes the command constructed from the AI response.
 * The command is executed in a shell environment using Deno's Command API.
 * The output of the command is streamed to the console.
 *
 * @param response - The grouped command response from the AI model, containing one or more commands and reasoning.
 */
async function run(command: string): Promise<void> {
  const cmd = new Deno.Command("sh", {
    args: ["-c", command],
    stdout: "piped",
  }).spawn();

  // Stream the command output to the console
  await cmd.stdout.pipeTo(Deno.stdout.writable);
}

async function main(question: string, autoRun = false): Promise<void> {
  const os = Deno.build.os;
  const path = Deno.cwd();
  const files = [...Deno.readDirSync(path)].map((file) => file.name).join(" ");

  const systemPrompt =
    `You are helpful assistant specializing in the command line for ${os}.
  You are also working in the directory ${path}, with files named ${files}.`;

  const completion = await oraPromise(
    client.beta.chat.completions.parse({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          strict: true,
          name: "command",
          schema: COMMAND_SCHEMA,
        },
      },
    }),
    "Answering",
  );

  const response = completion.choices[0].message.parsed;
  if (!response) {
    console.error("Error communicating with OpenAI");
    Deno.exit(1);
  }

  const { command, reasoning } = response;

  console.log("Command:", green(command));
  console.log(`\n${reasoning}\n`);

  if (autoRun) {
    await run(command);
  } else {
    const input = prompt("Do you want to run this command? (y/n) ");
    if (input?.toLowerCase().startsWith("y")) {
      console.log("Executing command:", `${green(command)}\n`);
      await run(command);
    }
  }

  Deno.exit(0);
}

if (import.meta.main) {
  const args = parseArgs(Deno.args, {
    boolean: ["r"],
    alias: { r: ["auto-run"] },
    default: { r: false },
  });

  const {
    _: [question = ""],
    r,
  } = args as unknown as { _: [string]; r: boolean };

  await main(question, r);
}
