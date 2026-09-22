import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('compulsion')
    .setDescription('Compel someone to surrender their blood.')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The person you want to compel.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('The amount of 🩸 to compel from them.')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {

    // ─────────────────────────────────────────
    // VAMPIRE-ONLY CHECK
    // ─────────────────────────────────────────

    const isVampire = interaction.member.roles.cache.some(role =>
      role.name.toLowerCase().includes('vampire')
    );

    if (!isVampire) {
      return interaction.reply({
        content: 'You do not possess the gift of compulsion.',
        ephemeral: true
      });
    }

    // ─────────────────────────────────────────
    // GET OPTIONS
    // ─────────────────────────────────────────

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    // ─────────────────────────────────────────
    // BASIC CHECKS
    // ─────────────────────────────────────────

    if (target.id === interaction.user.id) {
      return interaction.reply({
        content: 'You cannot compel yourself.',
        ephemeral: true
      });
    }

    if (target.bot) {
      return interaction.reply({
        content: 'You cannot compel a bot.',
        ephemeral: true
      });
    }

    // ─────────────────────────────────────────
    // ECONOMY
    // ─────────────────────────────────────────
    //
    // Replace getBalance / setBalance with the
    // functions used by your existing economy.
    //

    const targetBalance = await getBalance(target.id);
    const userBalance = await getBalance(interaction.user.id);

    if (targetBalance < amount) {
      return interaction.reply({
        content:
          `**${target.username}** doesn't have enough 🩸 to be compelled.\n` +
          `They only have **${targetBalance.toLocaleString()} 🩸**.`,
        ephemeral: true
      });
    }

    // Remove blood from the target
    await setBalance(
      target.id,
      targetBalance - amount
    );

    // Give blood to the vampire
    await setBalance(
      interaction.user.id,
      userBalance + amount
    );

    // ─────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────

    const embed = new EmbedBuilder()
      .setTitle('🩸 COMPULSION')
      .setDescription(
        `**${interaction.user.username}** has compelled ` +
        `**${target.username}**.\n\n` +
        `**${amount.toLocaleString()} 🩸** has been taken from them ` +
        `and added to your blood supply.`
      )
      .setColor('#8C1111')
      .setFooter({
        text: 'The compulsion has been made.'
      });

    return interaction.reply({
      embeds: [embed]
    });
  }
};
