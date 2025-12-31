const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { getConfig } = require('../utils/config');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket_panel')
        .setDescription('Envia o painel de atendimento para o canal atual.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const title = getConfig('panel_title') || "Central de Atendimento";
        const desc = getConfig('panel_description') || "Clique no botão abaixo para iniciar seu atendimento.";
        const colorHex = getConfig('panel_color') || "#242429";
        const imageUrl = getConfig('panel_image');
        const buttonText = getConfig('panel_button_text') || "Abrir Ticket";

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(colorHex.startsWith('#') ? colorHex : `#${colorHex}`)
            .setFooter({ 
                text: `© ${interaction.guild.name}. All rights reserved.`, 
                iconURL: interaction.guild.iconURL() 
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_open_btn')
                    .setLabel(buttonText)
                    .setStyle(ButtonStyle.Secondary)
            );

        const files = [];
        if (imageUrl && imageUrl.toLowerCase() !== 'none') {
            embed.setImage(imageUrl);
        } else {
            const bannerPath = path.join(__dirname, '../../emojis/banner-ticket.png');
            if (fs.existsSync(bannerPath)) {
                const attachment = new AttachmentBuilder(bannerPath, { name: 'banner-ticket.png' });
                embed.setImage('attachment://banner-ticket.png');
                files.push(attachment);
            }
        }

        await interaction.channel.send({ embeds: [embed], components: [row], files: files });
        await interaction.editReply("✅ Painel enviado com sucesso!");
    }
};

