import { Module } from './Module'
import {
  ApplicationCommandOptionData,
  ApplicationCommandType,
  Awaitable,
  BaseApplicationCommandData,
  BitFieldResolvable,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  CommandInteraction,
  LocalizationMap,
  Message,
  MessageApplicationCommandData,
  MessageContextMenuCommandInteraction,
  PermissionsString,
  User,
  UserApplicationCommandData,
  UserContextMenuCommandInteraction
} from 'discord.js'
import { Preconditions } from '../preconditions'

/** Represents a base command */
export abstract class BaseCommand extends Module implements BaseApplicationCommandData {
  type = ApplicationCommandType.ChatInput
  nameLocalizations?: LocalizationMap
  dmPermission?: boolean
  defaultMemberPermissions?: BitFieldResolvable<PermissionsString, bigint>

  preconditions: Array<keyof Preconditions> = []
  clientPermissions?: Preconditions['ClientPermissions']['clientPermissions']
  cooldown?: Preconditions['Cooldown']['cooldown']

  /**
   * Command callback
   * @param interaction Interaction that triggered the command
   * @param options Options that were provided when calling the command
   */
  abstract run(interaction: CommandInteraction, ...options: unknown[]): Awaitable<void>
}

export abstract class ChatInputCommand
  extends BaseCommand
  implements ChatInputApplicationCommandData
{
  override type = ApplicationCommandType.ChatInput as const
  abstract description: string
  descriptionLocalizations?: LocalizationMap
  options: ApplicationCommandOptionData[] = []

  /**
   * Command callback
   * @param interaction Interaction that triggered the command
   * @param options Options that were provided when calling the command
   */
  abstract override run(
    interaction: ChatInputCommandInteraction,
    ...options: unknown[]
  ): Awaitable<void>
}

export abstract class UserContextMenuCommand
  extends BaseCommand
  implements UserApplicationCommandData
{
  override type = ApplicationCommandType.User as const

  /**
   * Command callback
   * @param interaction Interaction that triggered the command
   * @param user User that this command was used on
   */
  abstract override run(interaction: UserContextMenuCommandInteraction, user: User): Awaitable<void>
}

export abstract class MessageContextMenuCommand
  extends BaseCommand
  implements MessageApplicationCommandData
{
  override type = ApplicationCommandType.Message as const

  /**
   * Command callback
   * @param interaction Interaction that triggered the command
   * @param message Message that this command was used on
   */
  abstract override run(
    interaction: MessageContextMenuCommandInteraction,
    message: Message
  ): Awaitable<void>
}

export type Command = ChatInputCommand | UserContextMenuCommand | MessageContextMenuCommand
