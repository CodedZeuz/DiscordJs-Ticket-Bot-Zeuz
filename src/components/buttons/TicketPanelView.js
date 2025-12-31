const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../../utils/config');
const { getNextTicketNumber, saveNextTicketNumber } = require('../../utils/ticketCounter');

async function openTicket(interaction) {
    const staffRoleId = String(getConfig('staff_role_id'));
    const categoryOpenId = String(getConfig('category_open_id'));
    const categoryClaimedId = getConfig('category_claimed_id') ? String(getConfig('category_claimed_id')) : null;

    if (!staffRoleId || !categoryOpenId || staffRoleId === 'undefined' || categoryOpenId === 'undefined') {
        return await interaction.reply({ content: "Sistema não configurado!", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    // Verificar se o usuário já tem um ticket aberto
    const guild = interaction.guild;
    const user = interaction.user;

    const findTicket = (category) => {
        if (!category) return null;
        return category.children.cache.find(c => c.topic && c.topic.includes(`Aberto por: ${user.id}`));
    };

    const catOpen = guild.channels.cache.get(categoryOpenId);
    const catClaimed = categoryClaimedId ? guild.channels.cache.get(categoryClaimedId) : null;

    const existingChannel = findTicket(catOpen) || findTicket(catClaimed);

    if (existingChannel) {
        const embed = new EmbedBuilder()
            .setTitle("❌ Ticket já Aberto")
            .setDescription(`Você já possui um ticket aberto em ${existingChannel}!`)
            .setColor("#242429");
        return await interaction.editReply({ embeds: [embed] });
    }

    const tnum = getNextTicketNumber();
    saveNextTicketNumber(tnum);

    const staffRole = guild.roles.cache.get(staffRoleId);
    
    const channel = await guild.channels.create({
        name: `ticket-${user.username}`,
        parent: categoryOpenId,
        topic: `Ticket ID: #${tnum} | Aberto por: ${user.id}`,
        permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
        ]
    });

    const welcomeEmbed = new EmbedBuilder()
        .setTitle("Atendimento Iniciado")
        .setDescription(`Olá ${user}, este é o seu canal de suporte.\n\n> Por favor, descreva o seu problema ou dúvida com o máximo de detalhes.\n> Um membro da nossa equipe irá te atender em breve.`)
        .setColor("#242429")
        .setFooter({ text: "Aguarde o atendimento." });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('close_btn').setLabel('Fechar').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('claim_btn').setLabel('Assumir').setStyle(ButtonStyle.Success)
        );

    const staffMention = staffRole ? staffRole.toString() : "@Staff";
    await channel.send({ content: `Bem-vindo ${user}! ${staffMention}`, embeds: [welcomeEmbed], components: [row] });
    
    await interaction.editReply(`Ticket criado: ${channel}`);
}

module.exports = { openTicket };

