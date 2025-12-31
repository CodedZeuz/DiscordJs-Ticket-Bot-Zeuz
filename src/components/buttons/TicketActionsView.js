const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { getConfig } = require('../../utils/config');
const { getEmoji } = require('../../utils/emojis');

async function closeTicket(interaction) {
    const staffRoleId = String(getConfig('staff_role_id'));
    const member = interaction.member;
    const guild = interaction.guild;

    if (!member.roles.cache.has(staffRoleId)) {
        return await interaction.reply({ content: "❌ Apenas Staff.", ephemeral: true });
    }

    await interaction.deferUpdate();

    try {
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcriptLines = [
            "=== TRANSCRIPT DO TICKET ===",
            `Canal: #${interaction.channel.name}`,
            `Data: ${new Date().toLocaleString('pt-BR')}`,
            `Total de mensagens: ${messages.size}`,
            "=".repeat(50),
            ""
        ];

        const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        sortedMessages.forEach(msg => {
            const time = new Date(msg.createdTimestamp).toLocaleString('pt-BR');
            const content = msg.content || "[Mídia/Embed]";
            transcriptLines.push(`[${time}] ${msg.author.tag}: ${content}`);
        });

        const transcriptText = transcriptLines.join('\n');
        const buffer = Buffer.from(transcriptText, 'utf-8');
        const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` });

        const topic = interaction.channel.topic || "";
        let userId = "Desconhecido";
        if (topic.includes("Aberto por:")) {
            userId = topic.split("Aberto por:")[1].trim();
        }

        const abertoEm = new Date(interaction.channel.createdTimestamp).toLocaleString('pt-BR');
        const fechadoEm = new Date().toLocaleString('pt-BR');

        let assumidoPor = "Ninguém";
        const claimMsg = sortedMessages.find(m => m.content.includes("Ticket assumido por"));
        if (claimMsg) {
            assumidoPor = claimMsg.author.toString();
        }

        const embed = new EmbedBuilder()
            .setTitle("Ticket Fechado")
            .setColor("#242429")
            .addFields(
                { name: "Aberto por", value: `<@${userId}> (${userId})`, inline: true },
                { name: "Categoria", value: interaction.channel.parent ? interaction.channel.parent.name : "Nenhuma", inline: true },
                { name: "Assumido por", value: assumidoPor, inline: true },
                { name: "Fechado por", value: `${interaction.user} (${interaction.user.id})`, inline: true },
                { name: "Aberto em", value: abertoEm, inline: true },
                { name: "Fechado em", value: fechadoEm, inline: true }
            )
            .setFooter({ text: new Date().toLocaleString('pt-BR') });

        const transcriptChannelId = String(getConfig('transcript_channel_id'));
        const tChannel = guild.channels.cache.get(transcriptChannelId);
        if (tChannel) {
            await tChannel.send({ embeds: [embed], files: [attachment] });
        }

        try {
            const user = await interaction.client.users.fetch(userId);
            const userEmbed = EmbedBuilder.from(embed);
            userEmbed.setDescription("## `⭐` `Avalie nosso atendimento`\n\n> Sua opinião é muito importante para nós. Por favor, deixe uma nota clicando nas estrelas abaixo!");
            
            const { getFeedbackRow } = require('./FeedbackView');
            await user.send({ 
                content: "Seu ticket foi fechado. Confira o resumo abaixo:", 
                embeds: [userEmbed], 
                files: [new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` })],
                components: [getFeedbackRow(1, interaction.channel.name, interaction.user.username)]
            });
        } catch (e) {}

    } catch (e) {
        console.error("Erro ao fechar ticket:", e);
    }

    const closeEmbed = new EmbedBuilder()
        .setTitle("❌ Fechando Ticket...")
        .setDescription("O canal será deletado em **5 segundos**.")
        .setColor("#242429");

    await interaction.followUp({ embeds: [closeEmbed] });
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
}

async function claimTicket(interaction) {
    const staffRoleId = String(getConfig('staff_role_id'));
    if (!interaction.member.roles.cache.has(staffRoleId)) {
        return await interaction.reply({ content: "❌ Apenas Staff.", ephemeral: true });
    }

    const messages = await interaction.channel.messages.fetch({ limit: 50 });
    const welcomeMsg = messages.find(m => m.author.id === interaction.client.user.id && m.embeds.length > 0);

    if (welcomeMsg) {
        const embed = EmbedBuilder.from(welcomeMsg.embeds[0]);
        if (embed.data.fields && embed.data.fields.some(f => f.name === "Staff Responsável")) {
            return await interaction.reply({ content: "Este ticket já foi assumido!", ephemeral: true });
        }
        embed.addFields({ name: "Staff Responsável", value: interaction.user.toString(), inline: false });
        await welcomeMsg.edit({ embeds: [embed] });
    }

    const categoryClaimedId = getConfig('category_claimed_id') ? String(getConfig('category_claimed_id')) : null;
    if (categoryClaimedId) {
        await interaction.channel.setParent(categoryClaimedId).catch(() => {});
    }

    const claimEmbed = new EmbedBuilder()
        .setTitle("✅ Ticket Assumido")
        .setDescription(`O staff ${interaction.user} agora é o responsável por este atendimento.`)
        .setColor("#242429");

    const row = ActionRowBuilder.from(interaction.message.components[0]);
    row.components[1].setDisabled(true); // Desativa o botão de assumir

    await interaction.update({ components: [row] });
    const msg = await interaction.followUp({ embeds: [claimEmbed] });
    setTimeout(() => msg.delete().catch(() => {}), 5000);
}

module.exports = { closeTicket, claimTicket };

