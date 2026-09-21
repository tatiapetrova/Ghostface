import {
SlashCommandBuilder,
PermissionFlagsBits,
EmbedBuilder
} from 'discord.js';

// Stores the last spin time for each user.
// Resets if the bot restarts.
const lastSpins = new Map();

const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

export default {
data: new SlashCommandBuilder()
.setName('spin-the-knife')
.setDescription('Spin the knife and see what Ghostface leaves you with.'),

async execute(interaction) {
const user = interaction.user;
const member = interaction.member;
const guild = interaction.guild;

if (!guild) {
return interaction.reply({
content: '🔪 You can only spin the knife inside the server.',
ephemeral: true
});
}

// ==========================================
// DAILY COOLDOWN
// ==========================================

const now = Date.now();
const lastSpin = lastSpins.get(user.id);

if (lastSpin) {
const timePassed = now - lastSpin;

if (timePassed < COOLDOWN) {
const remaining = COOLDOWN - timePassed;

const hours = Math.floor(remaining / (1000 * 60 * 60));
const minutes = Math.floor(
(remaining % (1000 * 60 * 60)) / (1000 * 60)
);

const embed = new EmbedBuilder()
.setColor('#090909')
.setTitle('🔪 NOT SO FAST...')
.setDescription(
`**${user}**, you've already spun the knife today.\n\n` +
`Ghostface doesn't give out second chances that easily.\n\n` +
`⏳ **Try again in:** ${hours}h ${minutes}m`
)
.setFooter({
text: 'One spin. One chance. Every 24 hours.'
});

return interaction.reply({
embeds: [embed],
ephemeral: true
});
}
}

// ==========================================
// RECORD SPIN
// ==========================================

lastSpins.set(user.id, now);

// ==========================================
// REWARD CHANCES
// ==========================================

const rewards = [
{
name: 'Level Up',
chance: 60
},
{
name: 'Emoji Reactor',
chance: 20
},
{
name: 'Custom Role + Color',
chance: 15
},
{
name: 'Autoresponder',
chance: 5
}
];

const roll = Math.random() * 100;

let current = 0;
let reward;

for (const item of rewards) {
current += item.chance;

if (roll <= current) {
reward = item;
break;
}
}

// ==========================================
// SPINNING MESSAGE
// ==========================================

const spinningEmbed = new EmbedBuilder()
.setColor('#080808')
.setTitle('🔪 SPIN THE KNIFE')
.setDescription(
`**${user.displayName}** is spinning the knife...\n\n` +
`*Who knows where the blade will land?*`
)
.setFooter({
text: 'Ghostface is watching.'
});

await interaction.reply({
embeds: [spinningEmbed]
});

await new Promise(resolve => setTimeout(resolve, 2000));

// ==========================================
// LEVEL UP
// ==========================================

if (reward.name === 'Level Up') {
const amount = Math.floor(Math.random() * 3) + 1;

const embed = new EmbedBuilder()
.setColor('#8C1111')
.setTitle('🔪 THE KNIFE HAS SPOKEN')
.setDescription(
`**${user}** got away with a **Level Up**.\n\n` +
`You gained **+${amount} level${amount === 1 ? '' : 's'}**.\n\n` +
`*Not bad. Maybe you'll survive the next call.*`
)
.setFooter({
text: 'Come back tomorrow. If you survive.'
});

return interaction.editReply({
embeds: [embed]
});
}

// ==========================================
// EMOJI REACTOR
// ==========================================

if (reward.name === 'Emoji Reactor') {
const emojis = guild.emojis.cache.filter(e => !e.managed);

if (!emojis.size) {
return interaction.editReply({
embeds: [
new EmbedBuilder()
.setColor('#8C1111')
.setTitle('🔪 THE KNIFE HAS SPOKEN')
.setDescription(
`**${user}** landed on **Emoji Reactor**.\n\n` +
`But there aren't any usable custom emojis available.\n\n` +
`*Looks like Ghostface needs more toys.*`
)
]
});
}

const emoji = emojis.random();

const embed = new EmbedBuilder()
.setColor('#6E1010')
.setTitle('🔪 THE KNIFE HAS SPOKEN')
.setDescription(
`**${user}** won the **Emoji Reactor** reward.\n\n` +
`${emoji} **${emoji.name}**\n\n` +
`React with it. Don't ask questions.`
)
.setFooter({
text: 'Ghostface has chosen.'
});

const message = await interaction.editReply({
embeds: [embed]
});

try {
await message.react(emoji);
} catch {
// Ignore reaction errors
}

return;
}

// ==========================================
// CUSTOM ROLE + COLOR
// ==========================================

if (reward.name === 'Custom Role + Color') {
if (
!guild.members.me.permissions.has(
PermissionFlagsBits.ManageRoles
)
) {
return interaction.editReply({
embeds: [
new EmbedBuilder()
.setColor('#8C1111')
.setTitle('🔪 THE KNIFE HAS SPOKEN')
.setDescription(
`**${user}** won a **Custom Role + Color**...\n\n` +
`But Ghostface doesn't have permission to create it.`
)
]
});
}

const colors = [
'#090909',
'#8C1111',
'#6E1010',
'#A3131A',
'#B51620',
'#4D080E',
'#25272D',
'#343238'
];

const color =
colors[Math.floor(Math.random() * colors.length)];

try {
const role = await guild.roles.create({
name: `Ghostface's Choice`,
color,
reason: `Spin the Knife reward for ${user.tag}`
});

await member.roles.add(role);

const embed = new EmbedBuilder()
.setColor(color)
.setTitle('🔪 THE KNIFE HAS SPOKEN')
.setDescription(
`**${user}** survived the spin.\n\n` +
`You won a **Custom Role + Color**.\n\n` +
`**Role:** ${role}\n` +
`**Color:** \`${color}\`\n\n` +
`*Wear it proudly. Ghostface picked it.*`
)
.setFooter({
text: 'Don't lose the role.'
});

return interaction.editReply({
embeds: [embed]
});
} catch (error) {
console.error(
'Spin the Knife role reward error:',
error
);

return interaction.editReply({
content:
'🔪 The knife landed on a custom role, but Ghostface couldn’t create it.'
});
}
}

// ==========================================
// AUTORESPONDER — 5%
// ==========================================

if (reward.name === 'Autoresponder') {
const embed = new EmbedBuilder()
.setColor('#A3131A')
.setTitle('🔪 THE KNIFE HAS SPOKEN')
.setDescription(
`**${user}** hit the rarest reward.\n\n` +
`📞 **AUTORESPONDER**\n\n` +
`Ghostface has decided to leave you a message of his own.\n\n` +
`*Five percent. You actually got it.*`
)
.setFooter({
text: 'The call is coming from inside the server.'
});

return interaction.editReply({
embeds: [embed]
});
}
}
};
