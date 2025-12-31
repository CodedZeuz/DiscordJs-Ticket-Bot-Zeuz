# 🎫 DiscordJs Ticket Bot - Zeuz

Um sistema de tickets profissional e automatizado, convertido de Python para **Discord.js v14**.

---

## 🚀 Funcionalidades

- **Configuração via Wizard**: Configure todo o bot com um único comando slash.
- **Painel Interativo**: Botões customizáveis para abertura de tickets.
- **Sistema de Staff**: Controle total de quem pode assumir ou fechar tickets.
- **Transcripts Automáticos**: Gera um arquivo `.txt` com todo o histórico do ticket ao fechar.
- **Sistema de Avaliação**: Coleta feedback dos usuários (1-5 estrelas + comentário).
- **Console Interativo**: Gerencie o bot diretamente pelo terminal.

---

## 🛠️ Instalação e Configuração

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) v16.11.0 ou superior.
- Um Bot no [Discord Developer Portal](https://discord.com/developers/applications).

### 2. Passo a Passo
1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/CodedZeuz/DiscordJs-Ticket-Bot-Zeuz.git
    cd DiscordJs-Ticket-Bot-Zeuz
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Token:**
    Crie um arquivo chamado `.env` na raiz do projeto e adicione seu token:
    ```env
    DISCORD_TOKEN=seu_token_aqui
    ```

4.  **Inicie o Bot:**
    ```bash
    npm start
    ```

---

## ⚙️ Como Configurar no Discord

1.  Use o comando `/setup_emojis` para que o bot instale os emojis necessários no seu servidor.
2.  Use o comando `/config_ticket` para abrir o assistente de configuração. Siga os 7 passos para definir cargos, categorias e canais.
3.  Use o comando `/ticket_panel` no canal onde deseja que os usuários abram tickets.

---

## ⌨️ Comandos do Console

Você pode gerenciar o bot diretamente pelo terminal:
- `help`: Mostra os comandos disponíveis.
- `reload all`: Recarrega todos os comandos slash sem precisar reiniciar o bot.
- `clear`: Limpa a tela do terminal.
- `stop`: Desliga o bot com segurança.
