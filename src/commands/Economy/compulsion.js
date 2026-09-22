import { SlashCommandBuilder } from "discord.js";
import { createEmbed, errorEmbed } from "../../utils/embeds.js";
import { getEconomyData, setEconomyData } from "../../utils/economy.js";
import { withErrorHandling } from "../../utils/errorHandler.js";
import logger from "../../utils/logger.js";
import interactionHelper from "../../utils/interactionHelper.js";
import botConfig from "../../config/bot.js";

export default {
data: new SlashCommandBuilder()
.setName("compulsion")
.setDescription("Compel another user to give you money.")
.addUserOption(option =>
option
.setName("user")
.setDescription("The user you want to compel.")
.setRequired(true)
)
.addIntegerOption(option =>
option
.setName("amount")
.setDescription("The amount to take.")
.setRequired(true)
.setMinValue(1)
),

async execute(interaction) {
await withErrorHandling(interaction, async () => {
const target = interaction.options.getUser("user");
const amount = interaction.options.getInteger("amount");

if (target.id === interaction.user.id) {
const embed = errorEmbed(
"Compulsion Failed",
"You cannot compel yourself."
);

return interactionHelper.safeReply(interaction, {
embeds: [embed]
});
}

// Must have a role containing "vampire"
const isVampire = interaction.member.roles.cache.some(role =>
role.name.toLowerCase().includes("vampire")
);

if (!isVampire) {
const embed = errorEmbed(
"Compulsion Failed",
"Only vampires can use compulsion."
);

return interactionHelper.safeReply(interaction, {
embeds: [embed]
});
}

const guildId = interaction.guild.id;

const userData = await getEconomyData(
guildId,
interaction.user.id
);

const targetData = await getEconomyData(
guildId,
target.id
);

const targetWallet = targetData.wallet || 0;

if (targetWallet < amount) {
const embed = errorEmbed(
"Compulsion Failed",
`${target} does not have enough money to be compelled.`
);

return interactionHelper.safeReply(interaction, {
embeds: [embed]
});
}

// Take money from target
targetData.wallet = targetWallet - amount;

// Give money to vampire
userData.wallet = (userData.wallet || 0) + amount;

await setEconomyData(
guildId,
target.id,
targetData
);

await setEconomyData(
guildId,
interaction.user.id,
userData
);

logger.info(
`[ECONOMY_TRANSACTION] Compulsion completed: ${interaction.user.tag} took ${amount} from ${target.tag}`
);

const embed = createEmbed(
"Compulsion",
`You compelled ${target} to give you **$${amount.toLocaleString()}**.`
)
.addFields(
{
name: "Amount Taken",
value: `$${amount.toLocaleString()}`,
inline: true
},
{
name: "Your New Balance",
value: `$${userData.wallet.toLocaleString()}`,
inline: true
},
{
name: "Their New Balance",
value: `$${targetData.wallet.toLocaleString()}`,
inline: true
}
)
.setFooter({
text: `Requested by ${interaction.user.tag}`
})
.setTimestamp();

return interactionHelper.safeReply(interaction, {
embeds: [embed]
});
});
}
};
