const config = require('../config/settings');
const Helpers = require('../utils/helpers');

class GroupHandler {
    constructor(client) {
        this.client = client;
        this.captureInProgress = false;
        this.joinInProgress = false;
    }

    // Auto responder em grupos
    async handleGroupMessage(msg) {
        if (!config.groupSettings.autoResponder) return;
        
        const chat = await msg.getChat();
        const groupId = chat.id._serialized;
        
        // Verificar cooldown
        const lastResponse = config.groupSettings.lastResponse.get(groupId);
        const now = Date.now();
        
        if (lastResponse && (now - lastResponse) < config.groupSettings.cooldownTime) {
            return; // Ainda em cooldown
        }

        // Delay aleatório para parecer natural
        const delay = Math.floor(Math.random() * 
            (config.groupSettings.responseDelay.max - config.groupSettings.responseDelay.min)) + 
            config.groupSettings.responseDelay.min;

        setTimeout(async () => {
            try {
                const randomMessage = this.getRandomGroupMessage();
                await chat.sendMessage(randomMessage);
                
                // Atualizar último envio
                config.groupSettings.lastResponse.set(groupId, Date.now());
                
                Helpers.log(`Auto-resposta enviada para grupo ${chat.name}`, 'GROUP');
            } catch (error) {
                Helpers.log(`Erro ao enviar auto-resposta: ${error.message}`, 'ERROR');
            }
        }, delay);
    }

    // Obter mensagem aleatória para grupos
    getRandomGroupMessage() {
        const messages = config.messages.groupMessages;
        const randomIndex = Math.floor(Math.random() * messages.length);
        return Helpers.generateMessageVariation(messages[randomIndex]);
    }

    // Capturar contatos de todos os grupos
    async captureAllGroupContacts() {
        if (this.captureInProgress) {
            return { success: false, message: 'Captura já em andamento!' };
        }

        this.captureInProgress = true;
        const allContacts = new Set();
        let processedGroups = 0;
        let totalGroups = 0;

        try {
            const chats = await this.client.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            totalGroups = groups.length;

            Helpers.log(`Iniciando captura de ${totalGroups} grupos`, 'CAPTURE');

            for (const group of groups) {
                try {
                    // Delay de 5 segundos entre grupos
                    if (processedGroups > 0) {
                        await Helpers.delay(5000);
                    }

                    const participants = group.participants || [];
                    
                    for (const participant of participants) {
                        const number = participant.id.user;
                        if (number && number.length >= 10) {
                            allContacts.add(number);
                        }
                    }

                    processedGroups++;
                    Helpers.log(`Grupo ${processedGroups}/${totalGroups} processado: ${group.name} (${participants.length} contatos)`, 'CAPTURE');

                } catch (groupError) {
                    Helpers.log(`Erro ao processar grupo ${group.name}: ${groupError.message}`, 'ERROR');
                    continue;
                }
            }

            // Salvar contatos capturados
            const contactsList = Array.from(allContacts).join('\n');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `group_contacts_${timestamp}.txt`;
            
            Helpers.saveGroupContacts(contactsList, filename);

            this.captureInProgress = false;
            
            return {
                success: true,
                message: `✅ Captura concluída!\n📊 ${allContacts.size} contatos únicos de ${processedGroups} grupos`,
                filename: filename,
                contacts: contactsList
            };

        } catch (error) {
            this.captureInProgress = false;
            Helpers.log(`Erro na captura geral: ${error.message}`, 'ERROR');
            return {
                success: false,
                message: `❌ Erro na captura: ${error.message}`
            };
        }
    }

    // Enviar mensagem para todos os grupos marcando todos
    async broadcastToGroups(message) {
        try {
            const chats = await this.client.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            
            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < groups.length; i++) {
                try {
                    const group = groups[i];
                    
                    // Criar lista de menções (sem mostrar números)
                    const participants = group.participants || [];
                    const mentions = participants.map(p => p.id._serialized);
                    
                    // Enviar mensagem com menções invisíveis
                    await group.sendMessage(message, {
                        mentions: mentions
                    });
                    
                    successCount++;
                    
                    // Delay aleatório entre 10-30 segundos
                    const randomDelay = Math.floor(Math.random() * 20000) + 10000;
                    await Helpers.delay(randomDelay);
                    
                    Helpers.log(`Mensagem enviada para grupo ${group.name}`, 'BROADCAST');
                    
                } catch (error) {
                    errorCount++;
                    Helpers.log(`Erro ao enviar para grupo: ${error.message}`, 'ERROR');
                }
            }

            return {
                success: true,
                total: groups.length,
                sent: successCount,
                errors: errorCount
            };

        } catch (error) {
            Helpers.log(`Erro no broadcast de grupos: ${error.message}`, 'ERROR');
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Entrar em grupos aleatórios
    async joinRandomGroups(targetCount) {
        if (this.joinInProgress) {
            return { success: false, message: 'Processo de entrada em grupos já em andamento!' };
        }

        this.joinInProgress = true;
        config.groupSettings.targetGroupCount = targetCount;
        config.groupSettings.joinedCount = 0;

        let attempts = 0;
        const maxAttempts = targetCount * 10; // Máximo 10 tentativas por grupo desejado

        try {
            while (config.groupSettings.joinedCount < targetCount && attempts < maxAttempts) {
                const groupLink = this.generateRandomGroupLink();
                
                try {
                    // Tentar entrar no grupo
                    const result = await this.client.acceptInvite(groupLink);
                    
                    if (result) {
                        config.groupSettings.joinedCount++;
                        Helpers.log(`Entrou no grupo ${config.groupSettings.joinedCount}/${targetCount}`, 'JOIN');
                        
                        // Delay entre entradas (30-60 segundos)
                        const delay = Math.floor(Math.random() * 30000) + 30000;
                        await Helpers.delay(delay);
                    }
                    
                } catch (joinError) {
                    // Link inválido ou grupo inexistente, continuar tentando
                    Helpers.log(`Link inválido tentativa ${attempts + 1}: ${groupLink}`, 'JOIN');
                }
                
                attempts++;
                
                // Delay pequeno entre tentativas
                await Helpers.delay(2000);
            }

            this.joinInProgress = false;
            
            return {
                success: true,
                joined: config.groupSettings.joinedCount,
                target: targetCount,
                attempts: attempts
            };

        } catch (error) {
            this.joinInProgress = false;
            Helpers.log(`Erro ao entrar em grupos: ${error.message}`, 'ERROR');
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Gerar link aleatório de grupo
    generateRandomGroupLink() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        // Links de grupo WhatsApp têm 22 caracteres após o último /
        for (let i = 0; i < 22; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    // Obter estatísticas de grupos
    async getGroupStats() {
        try {
            const chats = await this.client.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            
            const stats = {
                totalGroups: groups.length,
                adminGroups: 0,
                memberGroups: 0,
                totalParticipants: 0,
                autoResponder: config.groupSettings.autoResponder,
                joinTarget: config.groupSettings.targetGroupCount,
                joinedCount: config.groupSettings.joinedCount
            };

            for (const group of groups) {
                const participants = group.participants || [];
                stats.totalParticipants += participants.length;
                
                const botParticipant = participants.find(p => 
                    p.id._serialized === this.client.info.wid._serialized
                );
                
                if (botParticipant && botParticipant.isAdmin) {
                    stats.adminGroups++;
                } else {
                    stats.memberGroups++;
                }
            }

            return stats;
        } catch (error) {
            Helpers.log(`Erro ao obter stats de grupos: ${error.message}`, 'ERROR');
            return null;
        }
    }
}

module.exports = GroupHandler;