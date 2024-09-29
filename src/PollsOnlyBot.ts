import { GatewayIntentBits, Message, SlashCommandBuilder } from "discord.js";
import { BaseBotWithConfig } from "../../../interfaces/BaseBotWithConfig.js";
import { EventHandlerDict } from "../../../interfaces/IBot.js";
import { ShouldIgnoreEvent } from "../../../utils/DiscordUtils.js";

export type PollsOnlyConfig = {
    guildId: string;
    channelId: string;
};

export class PollsOnlyBot extends BaseBotWithConfig {
    private readonly intents: GatewayIntentBits[];
    private readonly commands: SlashCommandBuilder[];
    private readonly guildId: string;
    private readonly channelId: string;

    constructor() {
        super("PollsOnlyBot", import.meta);
        this.intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessagePolls];
        this.commands = [];
        const config = this.readYamlConfig<PollsOnlyConfig>("config.yaml");
        this.guildId = config.guildId;
        this.channelId = config.channelId;
    }

    getEventHandlers(): EventHandlerDict {
        const eventHandlers: EventHandlerDict = {
            messageCreate: this.processMessage.bind(this)
        };

        return eventHandlers;
    }

    async processMessage(message: Message): Promise<void> {
        if (ShouldIgnoreEvent(message) ||
            message.system ||
            message.channel.isDMBased() ||
            message.guildId !== this.guildId ||
            message.channelId !== this.channelId ||
            message.poll !== null ||
            message.member?.permissionsIn(message.channel).has("Administrator")) {
            return;
        }

        try {
            this.logger.info(`Non-poll message from ${message.author.id}`);
            const replyMsg = await message.reply("Please only send polls in this channel.");
            await message.delete();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await replyMsg.delete();
        } catch (error) {
            this.logger.error(`Exception in processMessage(): ${error}`);
        }
    }

    getIntents(): GatewayIntentBits[] {
        return this.intents;
    }

    getSlashCommands(): SlashCommandBuilder[] {
        return this.commands;
    }
}

