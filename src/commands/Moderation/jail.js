import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("jail")
    .setDescription("Jail a member.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The member to jail.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the jail.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided. Not even a motive?";

    const member = await interaction.guild.members.fetch(user.id);

    const jailRole = interaction.guild.roles.cache.find(
      role => role.name === "Jailed"
    );

    if (!jailRole) {
      return interaction.reply({
        content: "The `Jailed` role doesn't exist. Did you really think I'd let that slide?",
        ephemeral: true,
      });
    }

    if (member.roles.cache.has(jailRole.id)) {
      return interaction.reply({
        content: `${user} is already behind bars. You can't jail them twice.`,
        ephemeral: true,
      });
    }

    await member.roles.add(jailRole, reason);

    await interaction.reply(
      `${user} just got locked up. Guess you should've watched your back.\n**Reason:** ${reason}`
    );
  },
};
