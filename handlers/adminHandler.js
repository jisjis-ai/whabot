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
        await Helpers.simulateTyping(chat, 2000);
        await msg.reply(`🔐 *ÁREA ADMINISTRATIVA*

Digite a senha:`);

        // Marcar como aguardando senha
        this.adminSessions.set(msg.from, { status: 'awaiting_password' });
        
        Helpers.log(`Tentativa de login admin de ${msg.from}`, 'ADMIN');
    }

    async processAdminCommand(msg, chat, messageBody) {
        const session = this.adminSessions.get(msg.from);
        
        if (session.status === 'awaiting_password') {
            await this.validatePassword(msg, chat, messageBody);
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

    async validatePassword(msg, chat, messageBody) {
        const password = messageBody.trim();

        if (password === config.admin.password) {
            // Login bem-sucedido
            this.adminSessions.set(msg.from, { 
                status: 'authenticated', 
                loginTime: new Date() 
            });
            
            // Adicionar número aos admins autorizados
            if (!config.admin.numbers.includes(msg.from)) {
                config.admin.numbers.push(msg.from);
            }

            await Helpers.simulateTyping(chat, 1500);
            await msg.reply(`✅ *LOGIN REALIZADO!*

🎛️ *PAINEL ATIVO*

Digite /help para comandos.`);

            Helpers.log(`Admin logado: ${msg.from}`, 'ADMIN');
        } else {
            await msg.reply(`❌ *SENHA INCORRETA!*

Tente novamente.`);
            
            // Remover sessão
            this.adminSessions.delete(msg.from);
            
            Helpers.log(`Login falhado: ${msg.from}`, 'ADMIN');
        }
    }

    async showAdminHelp(msg, chat) {
        const helpText = `🎛️ *COMANDOS ADMIN*

📊 *INFORMAÇÕES:*
• \`/stats\` - Estatísticas
• \`/contacts\` - Lista contatos
• \`/config\` - Configurações

📝 *CONFIGURAR:*
• \`/setmessage [tipo] [msg]\` - Alterar mensagens
• \`/setlink [casa] [link]\` - Alterar links

📢 *ENVIO MASSA:*
• \`/broadcast [msg]\` - Enviar para todos
• \`/sendaudio\` - Enviar áudio
• \`/sendmedia\` - Enviar mídia

⚠️ *Cuidado com spam!*`;

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
        await chat.sendMessage(media, { caption: '📋 Lista de contatos' });
        
        // Limpar arquivo temporário
        fs.unlinkSync(tempFile);
        
        Helpers.log(`Contatos enviados para admin ${msg.from}`, 'ADMIN');
    }

    async handleBroadcast(msg, chat, messageBody) {
        const broadcastMessage = messageBody.replace('/broadcast', '').trim();
        
        if (!broadcastMessage) {
            await msg.reply('❌ Digite a mensagem após /broadcast');
            return;
        }

        const contacts = Array.from(config.userStates.keys());
        let successCount = 0;
        let errorCount = 0;

        await msg.reply(`📢 Enviando para ${contacts.length} contatos...`);

        for (let i = 0; i < contacts.length; i++) {
            try {
                const contact = contacts[i];
                const variation = Helpers.generateMessageVariation(broadcastMessage);
                
                await this.client.sendMessage(contact, variation);
                successCount++;
                
                // Delay aleatório entre envios (8-15 segundos)
                const randomDelay = Math.floor(Math.random() * 7000) + 8000;
                await Helpers.delay(randomDelay);
                
                // Atualizar progresso a cada 5 envios
                if ((i + 1) % 5 === 0) {
                    await msg.reply(`📊 ${i + 1}/${contacts.length} enviados`);
                }
                
            } catch (error) {
                errorCount++;
                Helpers.log(`Erro ao enviar para ${contacts[i]}: ${error.message}`, 'ERROR');
            }
        }

        const report = `📊 *RELATÓRIO*

✅ Sucessos: ${successCount}
❌ Erros: ${errorCount}
📱 Total: ${contacts.length}

⏰ ${new Date().toLocaleString('pt-BR')}`;

        await msg.reply(report);
        Helpers.log(`Broadcast: ${successCount} sucessos, ${errorCount} erros`, 'ADMIN');
    }

    async showStats(msg, chat) {
        const totalUsers = config.userStates.size;
        const usersByState = {};
        
        for (const [user, state] of config.userStates.entries()) {
            usersByState[state] = (usersByState[state] || 0) + 1;
        }

        const statsText = `📊 *ESTATÍSTICAS*

👥 *Total:* ${totalUsers}

📈 *Estados:*
• Inicial: ${usersByState.initial || 0}
• Aguardando: ${usersByState.waiting_screenshot || 0}
• Concluído: ${usersByState.completed || 0}
• Pagos: ${usersByState.paid || 0}

🕐 ${new Date().toLocaleString('pt-BR')}`;

        await msg.reply(statsText);
    }

    async setMessage(msg, chat, messageBody) {
        const parts = messageBody.split(' ');
        if (parts.length < 3) {
            await msg.reply('❌ Formato: /setmessage [tipo] [nova mensagem]');
            return;
        }

        const messageType = parts[1];
        const newMessage = parts.slice(2).join(' ');

        if (config.messages[messageType]) {
            config.messages[messageType] = newMessage;
            await msg.reply(`✅ Mensagem "${messageType}" atualizada!`);
            Helpers.log(`Mensagem ${messageType} alterada por ${msg.from}`, 'ADMIN');
        } else {
            await msg.reply('❌ Tipo inválido!');
        }
    }

    async setLink(msg, chat, messageBody) {
        const parts = messageBody.split(' ');
        if (parts.length < 3) {
            await msg.reply('❌ Formato: /setlink [casa] [novo link]');
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
            await msg.reply('❌ Tipo inválido!');
        }

        Helpers.log(`Link ${linkType} alterado por ${msg.from}`, 'ADMIN');
    }

    async showConfig(msg, chat) {
        const configText = `⚙️ *CONFIGURAÇÕES*

🏠 *Casas:*
• Casa 1: ${config.houses.casa1}
• Casa 2: ${config.houses.casa2}
• Casa 3: ${config.houses.casa3}
• Casa 4: ${config.houses.casa4}

👥 *Grupo:* ${config.groupLink}
🎛️ *Admins:* ${config.admin.numbers.length}
📞 *Suporte:* ${config.admin.humanSupport}`;

        await msg.reply(configText);
    }

    async handleAudioBroadcast(msg, chat) {
        if (!msg.hasQuotedMsg) {
            await msg.reply('❌ Responda um áudio com /sendaudio');
            return;
        }

        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.type !== 'ptt' && quotedMsg.type !== 'audio') {
            await msg.reply('❌ Deve ser um áudio');
            return;
        }

        const media = await quotedMsg.downloadMedia();
        const contacts = Array.from(config.userStates.keys());
        
        await msg.reply(`🎵 Enviando áudio para ${contacts.length} contatos...`);

        let successCount = 0;
        for (const contact of contacts) {
            try {
                await this.client.sendMessage(contact, media);
                successCount++;
                // Delay maior para áudios (10-18 segundos)
                await Helpers.delay(Math.floor(Math.random() * 8000) + 10000);
            } catch (error) {
                Helpers.log(`Erro ao enviar áudio para ${contact}: ${error.message}`, 'ERROR');
            }
        }

        await msg.reply(`✅ Áudio enviado para ${successCount} contatos!`);
    }

    async handleMediaBroadcast(msg, chat) {
        if (!msg.hasQuotedMsg) {
            await msg.reply('❌ Responda uma mídia com /sendmedia');
            return;
        }

        const quotedMsg = await msg.getQuotedMessage();
        if (!quotedMsg.hasMedia) {
            await msg.reply('❌ Deve conter mídia');
            return;
        }

        const media = await quotedMsg.downloadMedia();
        const contacts = Array.from(config.userStates.keys());
        
        await msg.reply(`📎 Enviando mídia para ${contacts.length} contatos...`);

        let successCount = 0;
        for (const contact of contacts) {
            try {
                await this.client.sendMessage(contact, media);
                successCount++;
                // Delay maior para mídias (10-18 segundos)
                await Helpers.delay(Math.floor(Math.random() * 8000) + 10000);
            } catch (error) {
                Helpers.log(`Erro ao enviar mídia para ${contact}: ${error.message}`, 'ERROR');
            }
        }

        await msg.reply(`✅ Mídia enviada para ${successCount} contatos!`);
    }
}

module.exports = AdminHandler;