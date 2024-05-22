import OpenAI from "npm:openai";
import { green } from "https://deno.land/std@0.219.0/fmt/colors.ts";
import Instructor from "npm:@instructor-ai/instructor";
import { z } from "npm:zod";
import { oraPromise } from "npm:ora";
import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";

const DEFAULT_MODEL = "gpt-4o";

const modelType = new EnumType([
  "gpt-4o",
  "gpt-4-turbo",
  "gpt-3.5-turbo",
]);

const CommandSchema = z.object({
  command: z
    .string()
    .describe(
      "Suggested command, remember to add quotes around items, if needed especially if there's newline characters",
    ),
  reasoning: z
    .string()
    .describe(
      "The reasoning for the suggested command, and explanation of what the command does",
    ),
});

type CommandResponse = z.infer<typeof CommandSchema>;

const openai: OpenAI = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
});

const client = Instructor({
  client: openai,
  mode: "FUNCTIONS",
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

async function main(
  { model = DEFAULT_MODEL },
  question: string,
): Promise<void> {
  const os = Deno.build.os;
  const path = Deno.cwd();
  const files = [...Deno.readDirSync(path)].map((file) => file.name).join(" ");

  const systemPrompt =
    `You are helpful assistant specializing in the command line for ${os}.
  You are also working in the directory ${path}, with files named ${files}.`;

  const response: CommandResponse = await oraPromise(
    client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      model,
      response_model: { schema: CommandSchema, name: "ExtractName" },
    }),
    "Answering",
  );

  console.log("Command:", green(response.command));
  console.log(`\n${response.reasoning}\n`);

  const input = prompt("Do you want to run this command? (y/n) ");
  if (input?.toLowerCase().startsWith("y")) {
    console.log("Executing command:", `${green(response.command)}\n`);
    await run(response.command);
  }

  Deno.exit(0);
}

await new Command()
  .name("AICommander")
  .description("AI powered command line tool")
  .type("model", modelType)
  .option("-m, --model <name:model>", "The OpenAI model name", {
    default: DEFAULT_MODEL,
  })
  .arguments("<question:string>")
  .action(main)
  .parse(Deno.args);
