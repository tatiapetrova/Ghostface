mport {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unjail")
    .setDescription("Remove a member from jail.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The member to unjail.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);

    const jailRole = interaction.guild.roles.cache.find(
      role => role.name === "Jailed"
    );

    if (!jailRole) {
      return interaction.reply({
        content: "The `Jailed` role doesn't exist.",
        ephemeral: true,
      });
    }

    if (!member.roles.cache.has(jailRole.id)) {
      return interaction.reply({
        content: `${user} isn't in custody. Wrong call.`,
        ephemeral: true,
      });
    }

    await member.roles.remove(jailRole);

    await interaction.reply(`${user} is free again. I guess the cell couldn't hold them.`);
  },
};
