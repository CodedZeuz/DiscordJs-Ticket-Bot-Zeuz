const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { loadEmojis, saveEmojisToFile } = require('../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_emojis')
        .setDescription('Instala emojis na guilda.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const EMOJIS_DIR = path.join(__dirname, '../../emojis');
        if (!fs.existsSync(EMOJIS_DIR)) {
            return await interaction.editReply("Pasta emojis não encontrada.");
        }

        const current = loadEmojis();
        const files = fs.readdirSync(EMOJIS_DIR).filter(f => f.match(/\.(png|jpg|gif)$/));

        for (const filename of files) {
            let name = path.parse(filename).name.replace(/-/g, '_').replace(/\s/g, '_');
            if (name.length < 2) name = `emoji_${name}`;

            try {
                const filePath = path.join(EMOJIS_DIR, filename);
                const emoji = await interaction.guild.emojis.create({ attachment: filePath, name: name });
                current[name] = emoji.toString();
            } catch (e) {
                console.error(`Erro ao criar emoji ${name}:`, e);
            }
        }

        saveEmojisToFile(current);
        await interaction.editReply("Emojis instalados com sucesso!");
    }
};

