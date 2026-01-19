import { green } from "@std/fmt/colors";
import { parseArgs } from "@std/cli/parse-args";
import { Spinner } from "@std/cli/unstable-spinner";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getAvailableProvider } from "./provider/models.ts";

export const COMMAND_SCHEMA = z.object({
  command: z.string().describe(
    "Suggested command, remember to add quotes around items, if needed especially if there's newline characters",
  ),
  reasoning: z.string().describe(
    "The reasoning for the suggested command, and explanation of what the command does",
  ),
});

async function run(command: string): Promise<void> {
  const cmd = new Deno.Command("sh", {
    args: ["-c", command],
    stdout: "piped",
  }).spawn();

  await cmd.stdout.pipeTo(Deno.stdout.writable);
}

async function main(question: string, autoRun = false): Promise<void> {
  const provider = getAvailableProvider();
  const os = Deno.build.os;
  const path = Deno.cwd();
  const files = [...Deno.readDirSync(path)].map((file) => file.name).join(" ");

  const systemPrompt =
    `You are helpful assistant specializing in the command line for ${os}.
  You are working in the directory ${path}, with files named ${files}.`;

  const spinner = new Spinner({ message: "Thinking..." });
  spinner.start();

  const completion = await generateText({
    model: provider.model,
    system: systemPrompt,
    prompt: question,
    output: Output.object({
      schema: COMMAND_SCHEMA,
    }),
  });

  spinner.stop();

  const response = completion.output;
  const { command, reasoning } = response;

  console.log("Command:", green(command));
  console.log(`\n${reasoning}\n`);

  if (autoRun || confirm("Do you want to run this command?")) {
    console.log("Executing command:", `${green(command)}\n`);
    await run(command);
  }

  Deno.exit(0);
}

if (import.meta.main) {
  const args = parseArgs(Deno.args, {
    boolean: ["r"] as const,
    alias: { r: "auto-run" } as const,
    default: { r: false } as const,
  });

  const question = args._[0]?.toString() ?? "";
  const autoRun = args.r;

  if (!question) {
    console.log("Please provide a command or question to execute.");
    Deno.exit(1);
  }

  await main(question, autoRun);
}
