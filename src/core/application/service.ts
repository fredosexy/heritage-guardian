import type { CommandEnvelope, CommandResult } from "./contracts";

export interface ApplicationService<
  TPayload = unknown,
  TResult extends CommandResult = CommandResult,
> {
  execute(command: CommandEnvelope<TPayload>): Promise<TResult>;
}

export type CommandHandler<
  TPayload = unknown,
  TResult extends CommandResult = CommandResult,
> = (command: CommandEnvelope<TPayload>) => Promise<TResult>;

export interface CommandRegistryEntry {
  command_name: string;
  command_version: number;
  target_domain: string;
  retryable: boolean;
  requires_idempotency: boolean;
  requires_expected_version: boolean;
}

/**
 * Registry metadata only. It does not authorize or execute commands.
 * Domain/Application Services remain responsible for server-side authorization and invariants.
 */
export class CommandRegistry {
  private readonly entries = new Map<string, CommandRegistryEntry>();

  register(entry: CommandRegistryEntry): void {
    const key = `${entry.command_name}@v${entry.command_version}`;
    if (this.entries.has(key)) {
      throw new Error(`command_contract_already_registered:${key}`);
    }
    this.entries.set(key, entry);
  }

  get(commandName: string, commandVersion: number): CommandRegistryEntry | undefined {
    return this.entries.get(`${commandName}@v${commandVersion}`);
  }

  list(): CommandRegistryEntry[] {
    return [...this.entries.values()];
  }
}
