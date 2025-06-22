const config = require('../config/settings');
const Helpers = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

class AdminHandler {
    constructor(client) {
        this.client = client;
        this.adminSessions = new Map(); // Sessões de admin logados
    }

    async handleAdminMessage(msg) {
        const userNumber = msg.from;
        const messageBody = msg.body.trim();
        const chat = await msg.getChat();

        // Verificar se é comando de login
        if (messageBody === '/admin') {
            await this.handleAdminLogin(msg, chat);
            return;
        }

        // Verificar se está logado
        if (!this.adminSessions.has(userNumber)) {
            return; // Não é admin logado, ignorar
        }

        // Processar comandos de admin
        await this.processAdminCommand(msg, chat, messageBody);
    }

    async handleAdminLogin(msg, chat) {
        await Helpers.simulateTyping(chat, 1000);
        await msg.reply(`🔐 *ÁREA ADMINISTRATIVA*

Por favor, digite suas credenciais no formato:
\`\`\`
Email: seu@email.com
Senha: suasenha
\`\`\`

⚠️ *Atenção:* Use exatamente este formato!`);

        // Marcar como aguardando login
        this.adminSessions.set(msg.from, { status: 'awaiting_credentials' });
        
        Helpers.log(`Tentativa de login admin de ${msg.from}`, 'ADMIN');
    }

    async processAdminCommand(msg, chat, messageBody) {
        const session = this.adminSessions.get(msg.from);
        
        if (session.status === 'awaiting_credentials') {
            await this.validateCredentials(msg, chat, messageBody);
            return;
        }

        if (session.status !== 'authenticated') {
            return;
        }

        // Comandos disponíveis para admin autenticado
        const command = messageBody.toLowerCase().split(' ')[0];

        switch (command) {
            case '/help':
                await this.showAdminHelp(msg, chat);
                break;
            
            case '/contacts':
                await this.sendContacts(msg, chat);
                break;
            
            case '/broadcast':
                await this.handleBroadcast(msg, chat, messageBody);
                break;
            
            case '/config':
                await this.showConfig(msg, chat);
                break;
            
            case '/setmessage':
                await this.setMessage(msg, chat, messageBody);
                break;
            
            case '/setlink':
                await this.setLink(msg, chat, messageBody);
                break;
            
            case '/stats':
                await this.showStats(msg, chat);
                break;
            
            case '/sendaudio':
                await this.handleAudioBroadcast(msg, chat);
                break;
            
            case '/sendmedia':
                await this.handleMediaBroadcast(msg, chat);
                break;
            
            default:
                await msg.reply('❌ Comando não reconhecido. Digite /help para ver os comandos disponíveis.');
        }
    }

    async validateCredentials(msg, chat, messageBody) {
        const lines = messageBody.split('\n');
        let email = '';
        let password = '';

        for (const line of lines) {
            if (line.toLowerCase().includes('email:')) {
                email = line.split(':')[1]?.trim();
            }
            if (line.toLowerCase().includes('senha:')) {
                password = line.split(':')[1]?.trim();
            }
        }

        if (email === config.admin.email && password === config.admin.password) {
            // Login bem-sucedido
            this.adminSessions.set(msg.from, { 
                status: 'authenticated', 
                loginTime: new Date() 
            });
            
            // Adicionar número aos admins autorizados
            if (!config.admin.numbers.includes(msg.from)) {
                config.admin.numbers.push(msg.from);
            }

            await Helpers.simulateTyping(chat, 1000);
            await msg.reply(`✅ *LOGIN REALIZADO COM SUCESSO!*

🎛️ *PAINEL ADMINISTRATIVO ATIVADO*

Digite /help para ver todos os comandos disponíveis.

🔧 Você agora tem acesso total ao sistema!`);

            Helpers.log(`Admin logado com sucesso: ${msg.from}`, 'ADMIN');
        } else {
            await msg.reply(`❌ *CREDENCIAIS INVÁLIDAS!*

Tente novamente com o formato correto:
\`\`\`
Email: seu@email.com
Senha: suasenha
\`\`\``);
            
            // Remover sessão
            this.adminSessions.delete(msg.from);
            
            Helpers.log(`Tentativa de login falhada: ${msg.from}`, 'ADMIN');
        }
    }

    async showAdminHelp(msg, chat) {
        const helpText = `🎛️ *COMANDOS ADMINISTRATIVOS*

📊 *INFORMAÇÕES:*
• \`/stats\` - Estatísticas do bot
• \`/contacts\` - Baixar lista de contatos
• \`/config\` - Ver configurações atuais

📝 *CONFIGURAÇÕES:*
• \`/setmessage [tipo] [mensagem]\` - Alterar mensagens
• \`/setlink [casa] [link]\` - Alterar links das casas

📢 *ENVIOS EM MASSA:*
• \`/broadcast [mensagem]\` - Enviar mensagem para todos
• \`/sendaudio\` - Enviar áudio (responda um áudio)
• \`/sendmedia\` - Enviar mídia (responda uma mídia)

💡 *EXEMPLOS:*
\`/setmessage welcome Nova mensagem de boas-vindas\`
\`/setlink casa1 https://novolink.com\`
\`/broadcast Promoção especial hoje!\`

⚠️ *Cuidado com envios em massa para evitar banimento!*`;

        await msg.reply(helpText);
    }

    async sendContacts(msg, chat) {
        const contacts = Helpers.getContacts();
        
        // Criar arquivo temporário
        const tempFile = path.join(__dirname, '../temp/contacts.txt');
        const dir = path.dirname(tempFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(tempFile, contacts);
        
        // Enviar arquivo
        const media = require('whatsapp-web.js').MessageMedia.fromFilePath(tempFile);
        await chat.sendMessage(media, { caption: '📋 Lista de contatos capturados pelo bot' });
        
        // Limpar arquivo temporário
        fs.unlinkSync(tempFile);
        
        Helpers.log(`Contatos enviados para admin ${msg.from}`, 'ADMIN');
    }

    async handleBroadcast(msg, chat, messageBody) {
        const broadcastMessage = messageBody.replace('/broadcast', '').trim();
        
        if (!broadcastMessage) {
            await msg.reply('❌ Digite a mensagem após o comando /broadcast');
            return;
        }

        const contacts = Array.from(config.userStates.keys());
        let successCount = 0;
        let errorCount = 0;

        await msg.reply(`📢 Iniciando envio em massa para ${contacts.length} contatos...`);

        for (let i = 0; i < contacts.length; i++) {
            try {
                const contact = contacts[i];
                const variation = Helpers.generateMessageVariation(broadcastMessage);
                
                await this.client.sendMessage(contact, variation);
                successCount++;
                
                // Delay aleatório entre envios (3-8 segundos)
                const randomDelay = Math.floor(Math.random() * 5000) + 3000;
                await Helpers.delay(randomDelay);
                
                // Atualizar progresso a cada 10 envios
                if ((i + 1) % 10 === 0) {
                    await msg.reply(`📊 Progresso: ${i + 1}/${contacts.length} enviados`);
                }
                
            } catch (error) {
                errorCount++;
                Helpers.log(`Erro ao enviar para ${contacts[i]}: ${error.message}`, 'ERROR');
            }
        }

        const report = `📊 *RELATÓRIO DE ENVIO EM MASSA*

✅ Enviados com sucesso: ${successCount}
❌ Erros: ${errorCount}
📱 Total de contatos: ${contacts.length}

⏰ Concluído em: ${new Date().toLocaleString('pt-BR')}`;

        await msg.reply(report);
        Helpers.log(`Broadcast concluído: ${successCount} sucessos, ${errorCount} erros`, 'ADMIN');
    }

    async showStats(msg, chat) {
        const totalUsers = config.userStates.size;
        const usersByState = {};
        
        for (const [user, state] of config.userStates.entries()) {
            usersByState[state] = (usersByState[state] || 0) + 1;
        }

        const statsText = `📊 *ESTATÍSTICAS DO BOT*

👥 *Total de usuários:* ${totalUsers}

📈 *Por estado:*
• Inicial: ${usersByState.initial || 0}
• Aguardando depósito: ${usersByState.waiting_deposit || 0}
• Aguardando screenshot: ${usersByState.waiting_screenshot || 0}
• Concluído: ${usersByState.completed || 0}

🕐 *Última atualização:* ${new Date().toLocaleString('pt-BR')}`;

        await msg.reply(statsText);
    }

    async setMessage(msg, chat, messageBody) {
        const parts = messageBody.split(' ');
        if (parts.length < 3) {
            await msg.reply('❌ Formato: /setmessage [tipo] [nova mensagem]\n\nTipos: welcome, depositRequest, needPhoto, groupAccess, additionalHouses');
            return;
        }

        const messageType = parts[1];
        const newMessage = parts.slice(2).join(' ');

        if (config.messages[messageType]) {
            config.messages[messageType] = newMessage;
            await msg.reply(`✅ Mensagem "${messageType}" atualizada com sucesso!`);
            Helpers.log(`Mensagem ${messageType} alterada por admin ${msg.from}`, 'ADMIN');
        } else {
            await msg.reply('❌ Tipo de mensagem inválido!');
        }
    }

    async setLink(msg, chat, messageBody) {
        const parts = messageBody.split(' ');
        if (parts.length < 3) {
            await msg.reply('❌ Formato: /setlink [casa] [novo link]\n\nCasas: casa1, casa2, casa3, casa4, group');
            return;
        }

        const linkType = parts[1];
        const newLink = parts[2];

        if (linkType === 'group') {
            config.groupLink = newLink;
            await msg.reply('✅ Link do grupo atualizado!');
        } else if (config.houses[linkType]) {
            config.houses[linkType] = newLink;
            await msg.reply(`✅ Link da ${linkType} atualizado!`);
        } else {
            await msg.reply('❌ Tipo de link inválido!');
        }

        Helpers.log(`Link ${linkType} alterado por admin ${msg.from}`, 'ADMIN');
    }

    async showConfig(msg, chat) {
        const configText = `⚙️ *CONFIGURAÇÕES ATUAIS*

🏠 *Links das Casas:*
• Casa 1: ${config.houses.casa1}
• Casa 2: ${config.houses.casa2}
• Casa 3: ${config.houses.casa3}
• Casa 4: ${config.houses.casa4}

👥 *Grupo VIP:*
${config.groupLink}

🎛️ *Admins ativos:* ${config.admin.numbers.length}`;

        await msg.reply(configText);
    }

    async handleAudioBroadcast(msg, chat) {
        if (!msg.hasQuotedMsg) {
            await msg.reply('❌ Responda um áudio com /sendaudio para enviar em massa');
            return;
        }

        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.type !== 'ptt' && quotedMsg.type !== 'audio') {
            await msg.reply('❌ A mensagem respondida deve ser um áudio');
            return;
        }

        const media = await quotedMsg.downloadMedia();
        const contacts = Array.from(config.userStates.keys());
        
        await msg.reply(`🎵 Iniciando envio de áudio para ${contacts.length} contatos...`);

        let successCount = 0;
        for (const contact of contacts) {
            try {
                await this.client.sendMessage(contact, media);
                successCount++;
                await Helpers.delay(Math.floor(Math.random() * 5000) + 3000);
            } catch (error) {
                Helpers.log(`Erro ao enviar áudio para ${contact}: ${error.message}`, 'ERROR');
            }
        }

        await msg.reply(`✅ Áudio enviado para ${successCount} contatos!`);
    }

    async handleMediaBroadcast(msg, chat) {
        if (!msg.hasQuotedMsg) {
            await msg.reply('❌ Responda uma mídia (foto/vídeo/documento) com /sendmedia para enviar em massa');
            return;
        }

        const quotedMsg = await msg.getQuotedMessage();
        if (!quotedMsg.hasMedia) {
            await msg.reply('❌ A mensagem respondida deve conter mídia');
            return;
        }

        const media = await quotedMsg.downloadMedia();
        const contacts = Array.from(config.userStates.keys());
        
        await msg.reply(`📎 Iniciando envio de mídia para ${contacts.length} contatos...`);

        let successCount = 0;
        for (const contact of contacts) {
            try {
                await this.client.sendMessage(contact, media);
                successCount++;
                await Helpers.delay(Math.floor(Math.random() * 5000) + 3000);
            } catch (error) {
                Helpers.log(`Erro ao enviar mídia para ${contact}: ${error.message}`, 'ERROR');
            }
        }

        await msg.reply(`✅ Mídia enviada para ${successCount} contatos!`);
    }
}

module.exports = AdminHandler;