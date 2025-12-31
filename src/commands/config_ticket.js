const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getEmbed } = require('../components/buttons/ConfigWizardView');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config_ticket')
        .setDescription('Inicia o assistente de configuração do bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Passo 1 do Wizard
        const embed = getEmbed(1);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('config_wizard_continue')
                    .setLabel('Continuar Instalação')
                    .setEmoji('🚀')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};

