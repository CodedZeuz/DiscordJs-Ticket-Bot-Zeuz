require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

// Banner ASCII
function printBanner() {
    console.log(chalk.yellow("ZEUZ - Ticket Bot Solutions v1.0"));
    console.log(chalk.cyan("Desenvolvido por Zeuz"));
    console.log("-".repeat(40));
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

client.commands = new Collection();

// Carregamento de comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commandsJSON = [];
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsJSON.push(command.data.toJSON());
    }
}

// Handler de Interações
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
        }
    } else if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isRoleSelectMenu() || interaction.isChannelSelectMenu() || interaction.isModalSubmit()) {
        // Os componentes serão lidados dentro dos seus próprios módulos ou via handlers dinâmicos
        // Para manter a simplicidade e modularidade, podemos emitir eventos customizados ou requerer um handler central
        try {
            const handleInteraction = require('./utils/interactionHandler');
            await handleInteraction(interaction, client);
        } catch (error) {
            console.error("Erro no handler de interação:", error);
        }
    }
});

client.once(Events.ClientReady, async () => {
    console.clear();
    printBanner();
    console.log(chalk.green(`Bot conectado como: ${client.user.tag}`));

    // Sincronizar Comandos Slash
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log(chalk.cyan('Iniciando sincronização de comandos slash...'));
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commandsJSON },
        );
        console.log(chalk.green(`Comandos Slash sincronizados com sucesso!`));
    } catch (error) {
        console.error(error);
    }

    startConsole();
});

// Console Interativo
function startConsole() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.yellow('Zeuz Console > ')
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const args = line.trim().split(/\\s+/);
        const command = args[0]?.toLowerCase();

        if (command === 'reload') {
            const target = args[1];
            if (!target) {
                console.log(chalk.red("Uso: reload <nome_do_comando> OU reload all"));
            } else if (target === 'all') {
                console.log(chalk.cyan("Recarregando todos os comandos..."));
                // Implementar recarregamento (limpar cache do require)
                client.commands.clear();
                const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
                for (const f of files) {
                    delete require.cache[require.resolve(path.join(commandsPath, f))];
                    const cmd = require(path.join(commandsPath, f));
                    client.commands.set(cmd.data.name, cmd);
                }
                console.log(chalk.green("Todos os comandos recarregados."));
            } else {
                try {
                    const filePath = path.join(commandsPath, `${target}.js`);
                    if (fs.existsSync(filePath)) {
                        delete require.cache[require.resolve(filePath)];
                        const cmd = require(filePath);
                        client.commands.set(cmd.data.name, cmd);
                        console.log(chalk.green(`Comando '${target}' recarregado.`));
                    } else {
                        console.log(chalk.red(`Comando '${target}' não encontrado.`));
                    }
                } catch (e) {
                    console.error(chalk.red(`Erro ao recarregar: ${e.message}`));
                }
            }
        } else if (command === 'stop' || command === 'exit') {
            console.log(chalk.red("Desligando o bot via console..."));
            rl.close();
            process.exit(0);
        } else if (command === 'help') {
            console.log(chalk.cyan("\\n--- Comandos do Console ---"));
            console.log(`${chalk.yellow('reload all')}         : Recarrega todos os comandos.`);
            console.log(`${chalk.yellow('reload <nome>')}      : Recarrega um comando específico.`);
            console.log(`${chalk.yellow('stop')}               : Desliga o bot.`);
            console.log(`${chalk.yellow('clear')}              : Limpa o terminal.\\n`);
        } else if (command === 'clear') {
            console.clear();
            printBanner();
        } else if (line.trim() !== "") {
            console.log("Comando desconhecido. Digite 'help'.");
        }
        rl.prompt();
    });
}

client.login(process.env.DISCORD_TOKEN);

