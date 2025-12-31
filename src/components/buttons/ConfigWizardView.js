const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { saveConfig, loadConfig } = require('../../utils/config');

function getEmbed(step) {
    const embed = new EmbedBuilder().setColor("#0000FF");
    const stepsInfo = {
        1: ["👋 Bem-vindo", "Clique em **Continuar** para iniciar a configuração."],
        2: ["🛠️ Cargo Staff", "Selecione o cargo que atenderá os tickets."],
        3: ["📂 Categoria Abertos", "Onde novos tickets serão criados."],
        4: ["🗂️ Categoria Assumidos", "Para onde os tickets vão ao serem assumidos."],
        5: ["📜 Canal Transcripts", "Onde os logs serão enviados."],
        6: ["⭐ Canal Avaliações", "Onde os feedbacks serão postados."],
        7: ["🎨 Visual do Painel", "Você pode personalizar o título, cores e imagens agora ou clicar em **Finalizar** para usar o padrão."],
        8: ["✅ Configuração Concluída!", "O sistema foi configurado com sucesso.\n\n> Use `/ticket_panel` para enviar o painel."]
    };

    const [title, desc] = stepsInfo[step] || ["Configuração", ""];
    embed.setTitle(step <= 7 ? `Passo ${step}/7 - ${title}` : title);
    embed.setDescription(`> ${desc}`);
    if (step === 8) embed.setColor("#00FF00");
    return embed;
}

function getComponents(step) {
    const row = new ActionRowBuilder();
    
    if (step === 1) {
        row.addComponents(new ButtonBuilder().setCustomId('config_wizard_continue').setLabel('Continuar').setStyle(ButtonStyle.Primary).setEmoji('🚀'));
    } else if (step === 2) {
        row.addComponents(new RoleSelectMenuBuilder().setCustomId('config_role_select').setPlaceholder('Selecione o cargo da Staff...'));
    } else if (step === 3) {
        row.addComponents(new ChannelSelectMenuBuilder().setCustomId('config_cat_open').setPlaceholder('Categoria de Abertos...').addChannelTypes(ChannelType.GuildCategory));
    } else if (step === 4) {
        row.addComponents(new ChannelSelectMenuBuilder().setCustomId('config_cat_claimed').setPlaceholder('Categoria de Assumidos...').addChannelTypes(ChannelType.GuildCategory));
    } else if (step === 5) {
        row.addComponents(new ChannelSelectMenuBuilder().setCustomId('config_chan_transcript').setPlaceholder('Canal de Transcripts...').addChannelTypes(ChannelType.GuildText));
    } else if (step === 6) {
        row.addComponents(new ChannelSelectMenuBuilder().setCustomId('config_chan_feedback').setPlaceholder('Canal de Avaliações...').addChannelTypes(ChannelType.GuildText));
    } else if (step === 7) {
        row.addComponents(
            new ButtonBuilder().setCustomId('config_visual_btn').setLabel('🎨 Personalizar Visual').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('config_finish_btn').setLabel('⏩ Finalizar / Usar Padrão').setStyle(ButtonStyle.Success)
        );
    }

    return row.components.length > 0 ? [row] : [];
}

async function handleWizard(interaction, forceStep = null) {
    const customId = interaction.customId;
    let nextStep = forceStep;

    if (!nextStep) {
        if (customId === 'config_wizard_continue') nextStep = 2;
        else if (customId === 'config_role_select') {
            saveConfig({ staff_role_id: interaction.values[0] });
            nextStep = 3;
        } else if (customId === 'config_cat_open') {
            saveConfig({ category_open_id: interaction.values[0] });
            nextStep = 4;
        } else if (customId === 'config_cat_claimed') {
            saveConfig({ category_claimed_id: interaction.values[0] });
            nextStep = 5;
        } else if (customId === 'config_chan_transcript') {
            saveConfig({ transcript_channel_id: interaction.values[0] });
            nextStep = 6;
        } else if (customId === 'config_chan_feedback') {
            saveConfig({ feedback_channel_id: interaction.values[0] });
            nextStep = 7;
        } else if (customId === 'config_visual_btn') {
            const config = loadConfig();
            const modal = new ModalBuilder().setCustomId('panel_config_modal').setTitle('Configuração Visual do Painel');
            
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title_input').setLabel("Título").setValue(config.panel_title || "").setRequired(false).setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc_input').setLabel("Descrição").setValue(config.panel_description || "").setRequired(false).setStyle(TextInputStyle.Paragraph)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('color_input').setLabel("Cor (Hex)").setValue(config.panel_color || "").setRequired(false).setMaxLength(7).setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('image_input').setLabel("Imagem (URL)").setValue(config.panel_image || "").setRequired(false).setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('button_input').setLabel("Texto do Botão").setValue(config.panel_button_text || "").setRequired(false).setStyle(TextInputStyle.Short))
            );
            return await interaction.showModal(modal);
        } else if (customId === 'config_finish_btn') nextStep = 8;
    }

    if (nextStep) {
        const embed = getEmbed(nextStep);
        const components = getComponents(nextStep);
        if (interaction.isModalSubmit() || interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [embed], components: components });
        } else {
            await interaction.update({ embeds: [embed], components: components });
        }
    }
}

module.exports = { getEmbed, getComponents, handleWizard };

