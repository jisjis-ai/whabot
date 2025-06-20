const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Helpers {
    // Delay entre ações (MUITO AUMENTADO)
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Simular digitação (tempo MUITO maior)
    static async simulateTyping(chat, duration = 5000) {
        await chat.sendStateTyping();
        await this.delay(duration);
    }

    // Simular gravação de áudio
    static async simulateRecording(chat, duration = 8000) {
        await chat.sendStateRecording();
        await this.delay(duration);
    }

    // Gerar variações de mensagem mais diversas
    static generateMessageVariation(message) {
        const emojis = ['🔥', '💰', '⚡', '🚀', '💎', '🎯', '✨', '🌟', '💪', '🎊', '💸', '🎰', '🏆', '💡'];
        const variations = [
            message,
            `${emojis[Math.floor(Math.random() * emojis.length)]} ${message}`,
            `${message} ${emojis[Math.floor(Math.random() * emojis.length)]}`,
            message.replace(/!/g, '!!'),
            message.replace(/\./g, '...'),
            message.replace(/💰/g, '💸'),
            message.replace(/🔥/g, '⚡'),
            message.replace(/🚀/g, '🎯'),
            message.replace(/💎/g, '🌟'),
        ];
        
        return variations[Math.floor(Math.random() * variations.length)];
    }

    // Salvar contatos em arquivo
    static saveContact(contact) {
        const contactsFile = path.join(__dirname, '../data/contacts.txt');
        const contactInfo = `${contact.number} - ${contact.name || 'Sem nome'} - ${new Date().toISOString()}\n`;
        
        // Criar diretório se não existir
        const dir = path.dirname(contactsFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.appendFileSync(contactsFile, contactInfo);
    }

    // Ler todos os contatos
    static getContacts() {
        const contactsFile = path.join(__dirname, '../data/contacts.txt');
        if (fs.existsSync(contactsFile)) {
            return fs.readFileSync(contactsFile, 'utf8');
        }
        return 'Nenhum contato encontrado.';
    }

    // Gerar hash para autenticação
    static generateHash(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    // Validar se é admin (agora só o dono)
    static isOwner(number) {
        const config = require('../config/settings');
        return number === config.admin.owner + '@c.us';
    }

    // Formatar número de telefone
    static formatPhoneNumber(number) {
        return number.replace(/\D/g, '');
    }

    // Log de atividades
    static log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type}] ${message}`;
        console.log(logMessage);
        
        // Salvar em arquivo de log
        const logFile = path.join(__dirname, '../data/bot.log');
        const dir = path.dirname(logFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.appendFileSync(logFile, logMessage + '\n');
    }

    // Delay aleatório para parecer mais humano (MUITO AUMENTADO)
    static randomDelay(min = 8000, max = 35000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return this.delay(delay);
    }

    // Delay específico para broadcast (2-10 minutos)
    static broadcastDelay() {
        const min = 120000; // 2 minutos
        const max = 600000; // 10 minutos
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return this.delay(delay);
    }
}

module.exports = Helpers;