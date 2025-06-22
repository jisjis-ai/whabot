const config = require('../config/settings');
const Helpers = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

class AdminHandler {
    constructor(client) {
        this.client = client;
    }

    async handleAdminMessage(msg) {
        const userNumber = msg.from;
        const messageBody = msg.body.trim();
        const chat = await msg.getChat();

        // Verificar se é o dono (acesso direto)
        if (userNumber === config.admin.owner + '@c.us') {
            await this.processOwnerCommand(msg, chat, messageBody);
        } else {
            // Outros usuários não têm acesso admin
            return false;
        }
    }

    async processOwnerCommand(msg, chat, messageBody) {
        const command = messageBody.toLowerCase().split(' ')[0];

        try {
            switch (command) {
                case '/admin':
                    await this.showAdminMenu(msg, chat);
                    break;
                
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
                
                case '/entrar':
                    await this.joinGroup(msg, chat, messageBody);
                    break;
                
                case '/grupos':
                    await this.listGroups(msg, chat);
                    break;
                
                case '/capturar':
                    await this.captureContacts(msg, chat, messageBody);
                    break;
                
                default:
                    if (messageBody.startsWith('/')) {
                        await msg.reply('❌ Comando não reconhecido. Digite /admin para ver os comandos disponíveis.');
                    }
            }
        } catch (error) {
            await msg.reply(`❌ Erro ao executar comando: ${error.message}`);
            Helpers.log(`Erro no comando admin: ${error.message}`, 'ERROR');
        }
    }

    async showAdminMenu(msg, chat) {
        const menuText = `🎛️ *PAINEL ADMINISTRATIVO*

👋 Olá, Dono! Comandos disponíveis:

📊 *INFORMAÇÕES:*
• \`/stats\` - Estatísticas do bot
• \`/contacts\` - Baixar contatos
• \`/config\` - Ver configurações
• \`/grupos\` - Listar grupos

📝 *CONFIGURAR:*
• \`/setmessage [tipo] [msg]\` - Alterar mensagens
• \`/setlink [casa] [link]\` - Alterar links

📢 *ENVIO MASSA:*
• \`/broadcast [msg]\` - Enviar para todos
• \`/sendaudio\` - Enviar áudio
• \`/sendmedia\` - Enviar mídia

👥 *GRUPOS:*
• \`/entrar [link]\` - Entrar em grupo
• \`/capturar [grupo/todos]\` - Capturar contatos

⚠️ *Delays: 2-10 min entre envios*`;

        await msg.reply(menuText);
        Helpers.log(`Menu admin mostrado para dono ${msg.from}`, 'ADMIN');
    }

    async showAdminHelp(msg, chat) {
        const helpText = `🎛️ *COMANDOS DETALHADOS*

📊 *INFORMAÇÕES:*
• \`/stats\` - Usuários por estado
• \`/contacts\` - Lista completa (TXT)
• \`/config\` - Links e configurações
• \`/grupos\` - Grupos onde bot está

📝 *CONFIGURAR:*
• \`/setmessage welcome [nova msg]\`
• \`/setmessage deposit [nova msg]\`
• \`/setlink casa1 [novo link]\`

📢 *ENVIO MASSA:*
• \`/broadcast Sua mensagem aqui\`
• Responda áudio + \`/sendaudio\`
• Responda mídia + \`/sendmedia\`

👥 *GRUPOS:*
• \`/entrar https://chat.whatsapp.com/xxx\`
• \`/capturar NomeDoGrupo\` - Contatos específicos
• \`/capturar todos\` - Todos os grupos

⏰ *Delays Anti-Ban: 2-10 minutos*`;

        await msg.reply(helpText);
    }

    async joinGroup(msg, chat, messageBody) {
        const parts = messageBody.split(' ');
        if (parts.length < 2) {
            await msg.reply('❌ Formato: /entrar https://chat.whatsapp.com/CODIGO');
            return;
        }

        const groupLink = parts[1];
        
        try {
            // Extrair código do grupo do link
            const groupCode = groupLink.split('/').pop();
            
            await msg.reply('🔄 Tentando entrar no grupo...');
            
            // Entrar no grupo
            const result = await this.client.acceptInvite(groupCode);
            
            await msg.reply(`✅ *ENTREI NO GRUPO!*

📱 ID: ${result}
🔗 Link: ${groupLink}

Agora posso capturar contatos deste grupo!`);
            
            Helpers.log(`Bot entrou no grupo: ${groupLink}`, 'GROUP');
            
        } catch (error) {
            await msg.reply(`❌ *ERRO AO ENTRAR NO GRUPO*

Possíveis causas:
• Link inválido ou expirado
• Grupo privado/restrito
• Bot já está no grupo
• Limite de participantes

Erro: ${error.message}`);
            
            Helpers.log(`Erro ao entrar no grupo ${groupLink}: ${error.message}`, 'ERROR');
        }
    }

    async listGroups(msg, chat) {
        try {
            const chats = await this.client.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            
            if (groups.length === 0) {
                await msg.reply('❌ Bot não está em nenhum grupo.');
                return;
            }

            let groupList = `👥 *GRUPOS (${groups.length})*\n\n`;
            
            for (let i = 0; i < Math.min(groups.length, 10); i++) { // Limitar a 10 grupos
                const group = groups[i];
                try {
                    groupList += `${i + 1}. *${group.name || 'Sem nome'}*\n`;
                    groupList += `   👤 ${group.participants ? group.participants.length : 'N/A'} membros\n`;
                    groupList += `   📱 ID: ${group.id._serialized}\n\n`;
                } catch (error) {
                    groupList += `${i + 1}. *Erro ao carregar grupo*\n\n`;
                }
            }

            if (groups.length > 10) {
                groupList += `... e mais ${groups.length - 10} grupos\n\n`;
            }

            groupList += `💡 *Para capturar contatos:*\n`;
            groupList += `• \`/capturar NomeDoGrupo\`\n`;
            groupList += `• \`/capturar todos\``;

            await msg.reply(groupList);
            
        } catch (error) {
            await msg.reply(`❌ Erro ao listar grupos: ${error.message}`);
            Helpers.log(`Erro ao listar grupos: ${error.message}`, 'ERROR');
        }
    }

    async captureContacts(msg, chat, messageBody) {
        const parts = messageBody.split(' ');
        if (parts.length < 2) {
            await msg.reply('❌ Formato: /capturar [nome do grupo] ou /capturar todos');
            return;
        }

        const target = parts.slice(1).join(' ').toLowerCase();
        
        try {
            await msg.reply('🔄 Iniciando captura de contatos...');
            
            const chats = await this.client.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            
            if (groups.length === 0) {
                await msg.reply('❌ Bot não está em nenhum grupo.');
                return;
            }

            let targetGroups = [];
            
            if (target === 'todos') {
                targetGroups = groups;
            } else {
                targetGroups = groups.filter(group => 
                    group.name && group.name.toLowerCase().includes(target)
                );
            }

            if (targetGroups.length === 0) {
                await msg.reply(`❌ Nenhum grupo encontrado com "${target}"`);
                return;
            }

            await msg.reply(`🔄 Capturando contatos de ${targetGroups.length} grupo(s)...`);

            let allContacts = [];
            let totalContacts = 0;

            for (const group of targetGroups) {
                try {
                    // Obter participantes do grupo de forma mais segura
                    const participants = group.participants || [];
                    
                    for (const participant of participants) {
                        try {
                            if (participant && participant.id && participant.id.user) {
                                const contact = {
                                    number: participant.id.user,
                                    name: participant.id.user,
                                    group: group.name || 'Sem nome',
                                    isAdmin: participant.isAdmin || false,
                                    isSuperAdmin: participant.isSuperAdmin || false
                                };
                                
                                // Tentar obter nome real de forma mais segura
                                try {
                                    const contactInfo = await this.client.getContactById(participant.id._serialized);
                                    if (contactInfo) {
                                        contact.name = contactInfo.pushname || contactInfo.name || participant.id.user;
                                    }
                                } catch (e) {
                                    // Manter nome como número se não conseguir obter
                                    Helpers.log(`Erro ao obter info do contato ${participant.id.user}: ${e.message}`, 'WARN');
                                }
                                
                                allContacts.push(contact);
                                totalContacts++;
                            }
                        } catch (participantError) {
                            Helpers.log(`Erro ao processar participante: ${participantError.message}`, 'WARN');
                        }
                    }
                } catch (groupError) {
                    Helpers.log(`Erro ao processar grupo ${group.name}: ${groupError.message}`, 'WARN');
                    await msg.reply(`⚠️ Erro ao processar grupo "${group.name}": ${groupError.message}`);
                }
            }

            if (allContacts.length === 0) {
                await msg.reply('❌ Nenhum contato foi capturado.');
                return;
            }

            // Criar arquivos TXT e CSV
            await this.createContactFiles(allContacts, targetGroups, msg);
            
            await msg.reply(`✅ *CAPTURA CONCLUÍDA!*

📊 *Resultados:*
• ${targetGroups.length} grupos processados
• ${totalContacts} contatos capturados
• Arquivos TXT e CSV enviados

📁 Arquivos enviados em anexo!`);

            Helpers.log(`Contatos capturados: ${totalContacts} de ${targetGroups.length} grupos`, 'ADMIN');
            
        } catch (error) {
            await msg.reply(`❌ Erro ao capturar contatos: ${error.message}`);
            Helpers.log(`Erro ao capturar contatos: ${error.message}`, 'ERROR');
        }
    }

    async createContactFiles(contacts, groups, msg) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const tempDir = path.join(__dirname, '../temp');
        
        // Criar diretório temp se não existir
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        try {
            // Arquivo TXT
            const txtFile = path.join(tempDir, `contatos-${timestamp}.txt`);
            let txtContent = `CONTATOS CAPTURADOS - ${new Date().toLocaleString('pt-BR')}\n`;
            txtContent += `=`.repeat(60) + '\n\n';
            
            for (const group of groups) {
                txtContent += `GRUPO: ${group.name || 'Sem nome'}\n`;
                txtContent += `MEMBROS: ${group.participants ? group.participants.length : 'N/A'}\n`;
                txtContent += `-`.repeat(40) + '\n';
                
                const groupContacts = contacts.filter(c => c.group === (group.name || 'Sem nome'));
                for (const contact of groupContacts) {
                    txtContent += `${contact.number} - ${contact.name}`;
                    if (contact.isAdmin) txtContent += ' (ADMIN)';
                    if (contact.isSuperAdmin) txtContent += ' (SUPER ADMIN)';
                    txtContent += '\n';
                }
                txtContent += '\n';
            }

            fs.writeFileSync(txtFile, txtContent);

            // Arquivo CSV (Excel)
            const csvFile = path.join(tempDir, `contatos-${timestamp}.csv`);
            let csvContent = 'Numero,Nome,Grupo,Admin,SuperAdmin\n';
            
            for (const contact of contacts) {
                csvContent += `${contact.number},"${contact.name}","${contact.group}",${contact.isAdmin},${contact.isSuperAdmin}\n`;
            }

            fs.writeFileSync(csvFile, csvContent);

            // Enviar arquivos
            const { MessageMedia } = require('whatsapp-web.js');
            
            // Enviar TXT
            const txtMedia = MessageMedia.fromFilePath(txtFile);
            await this.client.sendMessage(msg.from, txtMedia, { 
                caption: `📄 *CONTATOS TXT*\n\n📊 ${contacts.length} contatos de ${groups.length} grupos` 
            });

            // Aguardar antes de enviar o segundo arquivo
            await Helpers.delay(2000);

            // Enviar CSV
            const csvMedia = MessageMedia.fromFilePath(csvFile);
            await this.client.sendMessage(msg.from, csvMedia, { 
                caption: `📊 *CONTATOS EXCEL (CSV)*\n\n💡 Abra no Excel ou Google Sheets` 
            });

            // Limpar arquivos temporários
            setTimeout(() => {
                try {
                    if (fs.existsSync(txtFile)) fs.unlinkSync(txtFile);
                    if (fs.existsSync(csvFile)) fs.unlinkSync(csvFile);
                } catch (cleanupError) {
                    Helpers.log(`Erro ao limpar arquivos: ${cleanupError.message}`, 'WARN');
                }
            }, 10000); // Limpar após 10 segundos
            
        } catch (error) {
            Helpers.log(`Erro ao criar/enviar arquivos: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async sendContacts(msg, chat) {
        try {
            const contacts = Helpers.getContacts();
            
            // Criar arquivo temporário
            const tempFile = path.join(__dirname, '../temp/contacts.txt');
            const dir = path.dirname(tempFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(tempFile, contacts);
            
            // Enviar arquivo
            const { MessageMedia } = require('whatsapp-web.js');
            const media = MessageMedia.fromFilePath(tempFile);
            await this.client.sendMessage(msg.from, media, { caption: '📋 Lista de contatos do bot' });
            
            // Limpar arquivo temporário
            setTimeout(() => {
                try {
                    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                } catch (cleanupError) {
                    Helpers.log(`Erro ao limpar arquivo: ${cleanupError.message}`, 'WARN');
                }
            }, 5000);
            
            Helpers.log(`Contatos enviados para dono ${msg.from}`, 'ADMIN');
        } catch (error) {
            await msg.reply(`❌ Erro ao enviar contatos: ${error.message}`);
            Helpers.log(`Erro ao enviar contatos: ${error.message}`, 'ERROR');
        }
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

        if (contacts.length === 0) {
            await msg.reply('❌ Nenhum contato encontrado para envio.');
            return;
        }

        await msg.reply(`📢 *BROADCAST INICIADO*

👥 Enviando para: ${contacts.length} contatos
⏰ Delay: 2-10 minutos entre envios
🕐 Tempo estimado: ${Math.round(contacts.length * 6)} minutos

*Processo iniciado...*`);

        for (let i = 0; i < contacts.length; i++) {
            try {
                const contact = contacts[i];
                const variation = Helpers.generateMessageVariation(broadcastMessage);
                
                await this.client.sendMessage(contact, variation);
                successCount++;
                
                // Delay MUITO MAIOR (2-10 minutos)
                const randomDelay = Math.floor(Math.random() * (config.delays.broadcast.max - config.delays.broadcast.min + 1)) + config.delays.broadcast.min;
                
                // Atualizar progresso a cada 5 envios
                if ((i + 1) % 5 === 0) {
                    const nextDelay = Math.round(randomDelay / 60000);
                    await msg.reply(`📊 *PROGRESSO*

✅ Enviados: ${i + 1}/${contacts.length}
⏰ Próximo em: ${nextDelay} minutos
📈 Taxa sucesso: ${Math.round((successCount/(i+1))*100)}%`);
                }
                
                await Helpers.delay(randomDelay);
                
            } catch (error) {
                errorCount++;
                Helpers.log(`Erro ao enviar para ${contacts[i]}: ${error.message}`, 'ERROR');
            }
        }

        const report = `📊 *BROADCAST CONCLUÍDO*

✅ Sucessos: ${successCount}
❌ Erros: ${errorCount}
📱 Total: ${contacts.length}
📈 Taxa: ${Math.round((successCount/contacts.length)*100)}%

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

        const statsText = `📊 *ESTATÍSTICAS DO BOT*

👥 *Total de usuários:* ${totalUsers}

📈 *Por estado:*
• 🆕 Inicial: ${usersByState.initial || 0}
• ⏳ Aguardando foto: ${usersByState.waiting_screenshot || 0}
• ✅ Concluído: ${usersByState.completed || 0}
• 💰 Pagos: ${usersByState.paid || 0}

🕐 *Atualizado:* ${new Date().toLocaleString('pt-BR')}`;

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
            Helpers.log(`Mensagem ${messageType} alterada por dono`, 'ADMIN');
        } else {
            await msg.reply('❌ Tipo inválido! Tipos: welcome, depositRequest, needPhoto, groupAccess, additionalHouses');
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
            await msg.reply('❌ Tipo inválido! Tipos: casa1, casa2, casa3, casa4, group');
        }

        Helpers.log(`Link ${linkType} alterado por dono`, 'ADMIN');
    }

    async showConfig(msg, chat) {
        const configText = `⚙️ *CONFIGURAÇÕES ATUAIS*

🏠 *Casas de apostas:*
• Casa 1: ${config.houses.casa1}
• Casa 2: ${config.houses.casa2}
• Casa 3: ${config.houses.casa3}
• Casa 4: ${config.houses.casa4}

👥 *Grupo VIP:* ${config.groupLink}
👨‍💼 *Suporte humano:* ${config.admin.humanSupport}
🎛️ *Dono:* ${config.admin.owner}

⏰ *Delays anti-ban:*
• Digitação: ${config.delays.typing/1000}s
• Entre mensagens: ${config.delays.short/1000}-${config.delays.veryLong/1000}s
• Broadcast: ${config.delays.broadcast.min/60000}-${config.delays.broadcast.max/60000} min`;

        await msg.reply(configText);
    }

    async handleAudioBroadcast(msg, chat) {
        if (!msg.hasQuotedMsg) {
            await msg.reply('❌ Responda um áudio com /sendaudio');
            return;
        }

        try {
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.type !== 'ptt' && quotedMsg.type !== 'audio') {
                await msg.reply('❌ Deve ser um áudio');
                return;
            }

            const media = await quotedMsg.downloadMedia();
            const contacts = Array.from(config.userStates.keys());
            
            if (contacts.length === 0) {
                await msg.reply('❌ Nenhum contato encontrado para envio.');
                return;
            }
            
            await msg.reply(`🎵 *BROADCAST DE ÁUDIO*

👥 Enviando para: ${contacts.length} contatos
⏰ Delay: 2-10 minutos entre envios
🕐 Tempo estimado: ${Math.round(contacts.length * 6)} minutos

*Iniciando...*`);

            let successCount = 0;
            for (let i = 0; i < contacts.length; i++) {
                try {
                    const contact = contacts[i];
                    await this.client.sendMessage(contact, media);
                    successCount++;
                    
                    // Delay maior para áudios (2-10 minutos)
                    const randomDelay = Math.floor(Math.random() * (config.delays.broadcast.max - config.delays.broadcast.min + 1)) + config.delays.broadcast.min;
                    
                    if ((i + 1) % 3 === 0) {
                        await msg.reply(`🎵 Áudios enviados: ${i + 1}/${contacts.length}`);
                    }
                    
                    await Helpers.delay(randomDelay);
                } catch (error) {
                    Helpers.log(`Erro ao enviar áudio para ${contacts[i]}: ${error.message}`, 'ERROR');
                }
            }

            await msg.reply(`✅ *ÁUDIO BROADCAST CONCLUÍDO*

🎵 Enviados: ${successCount}/${contacts.length}
📈 Taxa: ${Math.round((successCount/contacts.length)*100)}%`);
        } catch (error) {
            await msg.reply(`❌ Erro no broadcast de áudio: ${error.message}`);
            Helpers.log(`Erro no broadcast de áudio: ${error.message}`, 'ERROR');
        }
    }

    async handleMediaBroadcast(msg, chat) {
        if (!msg.hasQuotedMsg) {
            await msg.reply('❌ Responda uma mídia com /sendmedia');
            return;
        }

        try {
            const quotedMsg = await msg.getQuotedMessage();
            if (!quotedMsg.hasMedia) {
                await msg.reply('❌ Deve conter mídia');
                return;
            }

            const media = await quotedMsg.downloadMedia();
            const contacts = Array.from(config.userStates.keys());
            
            if (contacts.length === 0) {
                await msg.reply('❌ Nenhum contato encontrado para envio.');
                return;
            }
            
            await msg.reply(`📎 *BROADCAST DE MÍDIA*

👥 Enviando para: ${contacts.length} contatos
⏰ Delay: 2-10 minutos entre envios
🕐 Tempo estimado: ${Math.round(contacts.length * 6)} minutos

*Iniciando...*`);

            let successCount = 0;
            for (let i = 0; i < contacts.length; i++) {
                try {
                    const contact = contacts[i];
                    await this.client.sendMessage(contact, media);
                    successCount++;
                    
                    // Delay maior para mídias (2-10 minutos)
                    const randomDelay = Math.floor(Math.random() * (config.delays.broadcast.max - config.delays.broadcast.min + 1)) + config.delays.broadcast.min;
                    
                    if ((i + 1) % 3 === 0) {
                        await msg.reply(`📎 Mídias enviadas: ${i + 1}/${contacts.length}`);
                    }
                    
                    await Helpers.delay(randomDelay);
                } catch (error) {
                    Helpers.log(`Erro ao enviar mídia para ${contacts[i]}: ${error.message}`, 'ERROR');
                }
            }

            await msg.reply(`✅ *MÍDIA BROADCAST CONCLUÍDO*

📎 Enviados: ${successCount}/${contacts.length}
📈 Taxa: ${Math.round((successCount/contacts.length)*100)}%`);
        } catch (error) {
            await msg.reply(`❌ Erro no broadcast de mídia: ${error.message}`);
            Helpers.log(`Erro no broadcast de mídia: ${error.message}`, 'ERROR');
        }
    }
}

module.exports = AdminHandler;