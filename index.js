const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Configurações
const OWNER_NUMBER = '258876219853';

// Estados do usuário
const userStates = new Map();

// Dados
let userData = {};
let groupData = {};

// Carregar dados
function loadData() {
    try {
        if (fs.existsSync('data/users.json')) {
            userData = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
        }
        if (fs.existsSync('data/groups.json')) {
            groupData = JSON.parse(fs.readFileSync('data/groups.json', 'utf8'));
        }
    } catch (error) {
        console.log('Erro ao carregar dados:', error);
    }
}

// Salvar dados
function saveData() {
    try {
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data');
        }
        fs.writeFileSync('data/users.json', JSON.stringify(userData, null, 2));
        fs.writeFileSync('data/groups.json', JSON.stringify(groupData, null, 2));
    } catch (error) {
        console.log('Erro ao salvar dados:', error);
    }
}

// Delay humanizado - 1 a 5 minutos
function humanDelay() {
    const minDelay = 60000; // 1 minuto
    const maxDelay = 300000; // 5 minutos
    return Math.random() * (maxDelay - minDelay) + minDelay;
}

// Delay rápido para admin (30s a 2min)
function adminDelay() {
    const minDelay = 30000; // 30 segundos
    const maxDelay = 120000; // 2 minutos
    return Math.random() * (maxDelay - minDelay) + minDelay;
}

// Função para log
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);
    
    try {
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data');
        }
        fs.appendFileSync('data/bot.log', logMessage + '\n');
    } catch (error) {
        console.log('Erro ao escrever log:', error);
    }
}

// Inicializar cliente
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Eventos do cliente
client.on('qr', (qr) => {
    console.log('\n============================================================');
    console.log('⏰ QR Code válido por 20 segundos');
    console.log('🔄 Se expirar, reinicie o bot');
    console.log('============================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    log('Bot conectado com sucesso!', 'SYSTEM');
    loadData();
});

client.on('disconnected', (reason) => {
    log(`Bot desconectado: ${reason}`, 'SYSTEM');
});

// Função para enviar mensagem com delay humanizado
async function sendMessage(chatId, message, isOwner = false) {
    try {
        const delay = isOwner ? adminDelay() : humanDelay();
        const delayMinutes = Math.round(delay / 60000);
        
        log(`Aguardando ${delayMinutes} minuto(s) para responder...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await client.sendMessage(chatId, message);
        return true;
    } catch (error) {
        log(`Erro ao enviar mensagem: ${error.message}`, 'ERROR');
        return false;
    }
}

// Função para capturar contatos de grupo
async function captureGroupContacts(groupId) {
    try {
        const chat = await client.getChatById(groupId);
        if (!chat.isGroup) return null;

        const participants = [];
        for (let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            participants.push({
                number: participant.id.user,
                name: contact.pushname || contact.name || 'Sem nome',
                isAdmin: participant.isAdmin,
                group: chat.name
            });
        }

        return {
            groupName: chat.name,
            participants: participants,
            total: participants.length
        };
    } catch (error) {
        log(`Erro ao capturar contatos: ${error.message}`, 'ERROR');
        return null;
    }
}

// Função para salvar contatos em arquivos
async function saveContactsToFiles(contactsData, chatId) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const txtFile = `data/contatos_${timestamp}.txt`;
        const csvFile = `data/contatos_${timestamp}.csv`;

        // Arquivo TXT
        let txtContent = `CONTATOS CAPTURADOS - ${new Date().toLocaleString()}\n`;
        txtContent += `=================================================\n\n`;

        for (let group of contactsData) {
            txtContent += `GRUPO: ${group.groupName} (${group.total} membros)\n`;
            txtContent += `-`.repeat(50) + '\n';
            
            for (let contact of group.participants) {
                txtContent += `📱 ${contact.number}\n`;
                txtContent += `👤 ${contact.name}\n`;
                txtContent += `${contact.isAdmin ? '👑 Admin' : '👥 Membro'}\n\n`;
            }
            txtContent += '\n';
        }

        fs.writeFileSync(txtFile, txtContent);

        // Arquivo CSV
        let csvContent = 'Numero,Nome,Grupo,Admin\n';
        for (let group of contactsData) {
            for (let contact of group.participants) {
                csvContent += `${contact.number},"${contact.name}","${group.groupName}",${contact.isAdmin ? 'Sim' : 'Não'}\n`;
            }
        }

        fs.writeFileSync(csvFile, csvContent);

        // Enviar arquivos
        const txtMedia = MessageMedia.fromFilePath(txtFile);
        const csvMedia = MessageMedia.fromFilePath(csvFile);

        await client.sendMessage(chatId, txtMedia, { caption: '📋 Lista de contatos (TXT)' });
        await new Promise(resolve => setTimeout(resolve, 5000));
        await client.sendMessage(chatId, csvMedia, { caption: '📊 Lista de contatos (CSV/Excel)' });

        // Limpar arquivos temporários
        setTimeout(() => {
            try {
                fs.unlinkSync(txtFile);
                fs.unlinkSync(csvFile);
            } catch (e) {}
        }, 60000);

        return true;
    } catch (error) {
        log(`Erro ao salvar arquivos: ${error.message}`, 'ERROR');
        return false;
    }
}

// Handler principal de mensagens
client.on('message', async (message) => {
    try {
        const chatId = message.from;
        const userId = message.author || message.from;
        const messageBody = message.body.trim();
        const isOwner = userId.includes(OWNER_NUMBER);

        // Ignorar mensagens de grupos e status
        if (message.from.includes('@g.us') || message.from.includes('status@broadcast')) {
            return;
        }

        log(`Mensagem de ${userId}: ${messageBody}`);

        // Comandos do dono
        if (isOwner) {
            if (messageBody === '/admin') {
                await sendMessage(chatId, `🔐 *PAINEL ADMINISTRATIVO*\n\n📊 /stats - Estatísticas\n📢 /broadcast - Enviar para todos\n👥 /grupos - Listar grupos\n🔗 /entrar [link] - Entrar em grupo\n📋 /capturar [número] - Capturar contatos\n📋 /capturar todos - Capturar todos`, true);
                return;
            }

            // Comando para entrar em grupo
            if (messageBody.startsWith('/entrar ')) {
                const groupLink = messageBody.replace('/entrar ', '').trim();
                try {
                    const inviteCode = groupLink.split('/').pop();
                    await client.acceptInvite(inviteCode);
                    await sendMessage(chatId, '✅ Entrei no grupo com sucesso!', true);
                } catch (error) {
                    await sendMessage(chatId, '❌ Erro ao entrar no grupo. Verifique o link.', true);
                }
                return;
            }

            // Listar grupos
            if (messageBody === '/grupos') {
                const chats = await client.getChats();
                const groups = chats.filter(chat => chat.isGroup);
                
                if (groups.length === 0) {
                    await sendMessage(chatId, '📭 Nenhum grupo encontrado.', true);
                    return;
                }

                let groupList = '👥 *GRUPOS DISPONÍVEIS*\n\n';
                groups.forEach((group, index) => {
                    groupList += `${index + 1}. ${group.name}\n`;
                    groupList += `   👤 ${group.participants.length} membros\n\n`;
                });

                await sendMessage(chatId, groupList, true);
                return;
            }

            // Capturar contatos
            if (messageBody.startsWith('/capturar ')) {
                const param = messageBody.replace('/capturar ', '').trim();
                const chats = await client.getChats();
                const groups = chats.filter(chat => chat.isGroup);

                if (groups.length === 0) {
                    await sendMessage(chatId, '📭 Nenhum grupo encontrado.', true);
                    return;
                }

                await sendMessage(chatId, '⏳ Capturando contatos...', true);

                let contactsData = [];

                if (param === 'todos') {
                    // Capturar de todos os grupos
                    for (let group of groups) {
                        const contacts = await captureGroupContacts(group.id._serialized);
                        if (contacts) {
                            contactsData.push(contacts);
                        }
                    }
                } else {
                    // Capturar de grupo específico
                    const groupIndex = parseInt(param) - 1;
                    if (groupIndex >= 0 && groupIndex < groups.length) {
                        const contacts = await captureGroupContacts(groups[groupIndex].id._serialized);
                        if (contacts) {
                            contactsData.push(contacts);
                        }
                    } else {
                        await sendMessage(chatId, '❌ Número do grupo inválido.', true);
                        return;
                    }
                }

                if (contactsData.length > 0) {
                    const success = await saveContactsToFiles(contactsData, chatId);
                    if (success) {
                        let totalContacts = contactsData.reduce((sum, group) => sum + group.total, 0);
                        await sendMessage(chatId, `✅ Capturados ${totalContacts} contatos de ${contactsData.length} grupo(s)!`, true);
                    } else {
                        await sendMessage(chatId, '❌ Erro ao salvar arquivos.', true);
                    }
                } else {
                    await sendMessage(chatId, '❌ Nenhum contato capturado.', true);
                }
                return;
            }

            // Estatísticas
            if (messageBody === '/stats') {
                const totalUsers = Object.keys(userData).length;
                const chats = await client.getChats();
                const groups = chats.filter(chat => chat.isGroup);
                
                await sendMessage(chatId, `📊 *ESTATÍSTICAS*\n\n👥 Usuários: ${totalUsers}\n🏠 Grupos: ${groups.length}\n🤖 Status: Online`, true);
                return;
            }

            // Broadcast
            if (messageBody.startsWith('/broadcast ')) {
                const broadcastMessage = messageBody.replace('/broadcast ', '');
                let sent = 0;
                
                for (let user in userData) {
                    try {
                        await sendMessage(user, broadcastMessage);
                        sent++;
                        // Delay de 5-10 minutos entre broadcasts
                        await new Promise(resolve => setTimeout(resolve, Math.random() * 300000 + 300000));
                    } catch (error) {
                        log(`Erro ao enviar broadcast para ${user}: ${error.message}`, 'ERROR');
                    }
                }
                
                await sendMessage(chatId, `📢 Broadcast enviado para ${sent} usuários.`, true);
                return;
            }

            return; // Dono não recebe mensagens de usuário comum
        }

        // Sistema de usuários normais
        const currentState = userStates.get(userId) || 'welcome';

        // Verificar se é comprovativo de pagamento
        if (messageBody.includes('COMPROVATIVO DE PAGAMENTO') && messageBody.includes('HACKERBETS')) {
            await sendMessage(chatId, '✅ *Pagamento recebido!*\n\n⏳ Verificando...\n\n💬 Precisa falar com humano?');
            
            // Notificar o dono
            await sendMessage(`${OWNER_NUMBER}@c.us`, `🔔 *NOVO PAGAMENTO*\n\n👤 Cliente: ${userId}\n📄 Comprovativo recebido\n\n💬 Mensagem:\n${messageBody}`, true);
            return;
        }

        // Estados do usuário
        switch (currentState) {
            case 'welcome':
                if (!userData[userId]) {
                    userData[userId] = {
                        phone: userId,
                        joinDate: new Date().toISOString(),
                        interactions: 0
                    };
                    saveData();
                }

                userData[userId].interactions++;
                saveData();

                await sendMessage(chatId, `🎯 *HACKERBETS - Casas VIP*\n\n💎 *3 Casas disponíveis:*\n🏠 Casa 1 - 85% Win\n🏠 Casa 2 - 90% Win  \n🏠 Casa 3 - 95% Win\n\n💰 *Apenas 1000 MZN*\n⚡ *Ativação rápida*\n\n📱 Interessado?`);
                
                userStates.set(userId, 'interested');
                break;

            case 'interested':
                if (messageBody.toLowerCase().includes('sim') || messageBody.toLowerCase().includes('cadastr') || messageBody.toLowerCase().includes('quero')) {
                    await sendMessage(chatId, `💳 *PAGAMENTO - 1000 MZN*\n\n📱 *M-Pesa:* 258876219853\n💰 *Valor:* 1000.00 MZN\n\n📸 *Envie o print após pagar!*`);
                    userStates.set(userId, 'payment');
                } else {
                    await sendMessage(chatId, `🤔 *Ainda em dúvida?*\n\n✅ *Garantia total*\n💰 *Lucro garantido*\n🎯 *Suporte 24h*\n\n💬 Falar com humano?`);
                }
                break;

            case 'payment':
                if (message.hasMedia) {
                    await sendMessage(chatId, `✅ *Print recebido!*\n\n⏳ *Verificando...*\n⚡ *Ativação em breve*`);
                    
                    // Notificar o dono
                    await sendMessage(`${OWNER_NUMBER}@c.us`, `💰 *NOVO PAGAMENTO*\n\n👤 Cliente: ${userId}\n📸 Print recebido\n⏰ ${new Date().toLocaleString()}`, true);
                    
                    userStates.set(userId, 'paid');
                } else {
                    await sendMessage(chatId, `📸 *Envie o print do pagamento*\n\n💳 M-Pesa: 258876219853\n💰 1000 MZN`);
                }
                break;

            case 'paid':
                await sendMessage(chatId, `⏳ *Verificando pagamento...*\n\n✅ *Ativação em breve*\n\n💬 Falar com humano?`);
                break;

            default:
                await sendMessage(chatId, `🎰 *HACKERBETS*\n\n💎 *Casas VIP disponíveis*\n💰 *1000 MZN*\n\n📱 Interessado?`);
                userStates.set(userId, 'interested');
        }

        // Resposta para "falar com humano"
        if (messageBody.toLowerCase().includes('humano') || messageBody.toLowerCase().includes('ajuda') || messageBody.toLowerCase().includes('suporte')) {
            await sendMessage(chatId, `👨‍💼 *Atendimento humano*\n\n📱 *WhatsApp:* wa.me/258876219853\n⏰ *24h disponível*`);
            
            // Notificar o dono
            await sendMessage(`${OWNER_NUMBER}@c.us`, `🔔 *ATENDIMENTO SOLICITADO*\n\n👤 Cliente: ${userId}\n⏰ ${new Date().toLocaleString()}\n\n💬 Mensagem: ${messageBody}`, true);
        }

    } catch (error) {
        log(`Erro no handler de mensagem: ${error.message}`, 'ERROR');
    }
});

// Inicializar bot
client.initialize().catch(error => {
    log(`Erro ao inicializar: ${error.message}`, 'ERROR');
});

// Servidor web simples
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ 
        status: 'Bot ativo',
        timestamp: new Date().toISOString(),
        users: Object.keys(userData).length
    });
});

app.listen(PORT, () => {
    log(`Servidor web iniciado na porta ${PORT}`, 'SYSTEM');
});

// Tratamento de erros
process.on('unhandledRejection', (error) => {
    log(`Unhandled Rejection: ${error.message}`, 'ERROR');
});

process.on('uncaughtException', (error) => {
    log(`Uncaught Exception: ${error.message}`, 'ERROR');
});