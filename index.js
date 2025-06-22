const express = require('express');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const config = require('./config/settings');
const UserHandler = require('./handlers/userHandler');
const AdminHandler = require('./handlers/adminHandler');
const Helpers = require('./utils/helpers');

// Criar servidor Express
const app = express();
const PORT = process.env.PORT || 3000;

// Variáveis globais para QR Code
let currentQRCode = null;
let qrExpireTime = null;
let botStatus = 'Iniciando...';

// Configuração do cliente WhatsApp otimizada para Railway
const client = new Client({
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
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--memory-pressure-off'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    }
});

// Inicializar handlers
const userHandler = new UserHandler(client);
const adminHandler = new AdminHandler(client);

// Variável para controlar QR Code
let qrGenerated = false;
let isConnecting = false;

// Rota principal - Página do QR Code
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🤖 Bot WhatsApp - Casa de Apostas</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            
            .container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
                max-width: 500px;
                width: 90%;
            }
            
            .title {
                font-size: 2.5em;
                margin-bottom: 10px;
                background: linear-gradient(45deg, #FFD700, #FFA500);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .subtitle {
                font-size: 1.2em;
                margin-bottom: 30px;
                opacity: 0.9;
            }
            
            .qr-container {
                background: white;
                border-radius: 15px;
                padding: 20px;
                margin: 30px 0;
                display: inline-block;
            }
            
            .qr-code {
                max-width: 250px;
                width: 100%;
                height: auto;
            }
            
            .status {
                font-size: 1.1em;
                margin: 20px 0;
                padding: 15px;
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .status.connected {
                background: rgba(76, 175, 80, 0.3);
                border: 1px solid #4CAF50;
            }
            
            .status.connecting {
                background: rgba(255, 193, 7, 0.3);
                border: 1px solid #FFC107;
            }
            
            .status.error {
                background: rgba(244, 67, 54, 0.3);
                border: 1px solid #F44336;
            }
            
            .instructions {
                text-align: left;
                margin: 20px 0;
                padding: 20px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                border-left: 4px solid #FFD700;
            }
            
            .instructions h3 {
                color: #FFD700;
                margin-bottom: 15px;
            }
            
            .instructions ol {
                padding-left: 20px;
            }
            
            .instructions li {
                margin: 8px 0;
                line-height: 1.5;
            }
            
            .timer {
                font-size: 1.3em;
                font-weight: bold;
                color: #FFD700;
                margin: 15px 0;
            }
            
            .refresh-btn {
                background: linear-gradient(45deg, #FFD700, #FFA500);
                color: #333;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                margin-top: 20px;
                transition: transform 0.2s;
            }
            
            .refresh-btn:hover {
                transform: translateY(-2px);
            }
            
            @media (max-width: 600px) {
                .container {
                    padding: 20px;
                }
                
                .title {
                    font-size: 2em;
                }
                
                .qr-code {
                    max-width: 200px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="title">🤖 Bot WhatsApp</div>
            <div class="subtitle">Casa de Apostas</div>
            
            <div class="status ${getStatusClass()}" id="status">
                📱 ${botStatus}
            </div>
            
            ${currentQRCode ? `
                <div class="qr-container">
                    <img src="${currentQRCode}" alt="QR Code WhatsApp" class="qr-code" id="qrcode">
                </div>
                
                <div class="timer" id="timer">
                    ⏰ QR Code expira em: <span id="countdown">20</span>s
                </div>
            ` : ''}
            
            <div class="instructions">
                <h3>📋 Como Conectar:</h3>
                <ol>
                    <li>Abra o <strong>WhatsApp</strong> no seu celular</li>
                    <li>Toque em <strong>"Mais opções"</strong> (⋮) ou <strong>"Configurações"</strong></li>
                    <li>Selecione <strong>"Dispositivos conectados"</strong></li>
                    <li>Toque em <strong>"Conectar dispositivo"</strong></li>
                    <li><strong>Escaneie o QR Code</strong> acima</li>
                </ol>
            </div>
            
            <button class="refresh-btn" onclick="location.reload()">
                🔄 Atualizar Página
            </button>
        </div>
        
        <script>
            // Auto refresh a cada 5 segundos
            setInterval(() => {
                location.reload();
            }, 5000);
            
            // Countdown timer
            let timeLeft = 20;
            const countdownElement = document.getElementById('countdown');
            
            if (countdownElement) {
                const timer = setInterval(() => {
                    timeLeft--;
                    countdownElement.textContent = timeLeft;
                    
                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        location.reload();
                    }
                }, 1000);
            }
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// Função para determinar classe CSS do status
function getStatusClass() {
    if (botStatus.includes('Conectado')) return 'connected';
    if (botStatus.includes('Conectando') || botStatus.includes('QR Code')) return 'connecting';
    if (botStatus.includes('Erro') || botStatus.includes('Falha')) return 'error';
    return 'connecting';
}

// Rota para API do status
app.get('/api/status', (req, res) => {
    res.json({
        status: botStatus,
        qrCode: currentQRCode,
        expireTime: qrExpireTime,
        connected: botStatus.includes('Conectado')
    });
});

// Iniciar servidor Express
app.listen(PORT, () => {
    console.log('\n' + '🌐'.repeat(20));
    console.log(`🚀 SERVIDOR WEB INICIADO!`);
    console.log(`🔗 URL: https://seu-projeto.railway.app`);
    console.log(`📱 Acesse a URL para escanear o QR Code`);
    console.log('🌐'.repeat(20) + '\n');
    
    Helpers.log(`Servidor web iniciado na porta ${PORT}`, 'SYSTEM');
});

// Evento QR Code - Melhorado para Railway
client.on('qr', async qr => {
    if (qrGenerated) return; // Evita múltiplos QR codes
    
    qrGenerated = true;
    isConnecting = true;
    botStatus = '📱 QR Code gerado - Escaneie para conectar';
    
    try {
        // Gerar QR Code como imagem base64
        currentQRCode = await qrcode.toDataURL(qr, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        qrExpireTime = Date.now() + 20000; // 20 segundos
        
        console.clear();
        console.log('\n' + '='.repeat(60));
        console.log('🤖 BOT WHATSAPP - CASA DE APOSTAS');
        console.log('='.repeat(60));
        console.log('\n🌐 ACESSE A URL PARA ESCANEAR O QR CODE:');
        console.log(`🔗 https://seu-projeto.railway.app`);
        console.log('\n📱 QR Code disponível na página web!');
        console.log('⏰ Válido por 20 segundos');
        console.log('='.repeat(60) + '\n');
        
        // QR Code no terminal também (menor)
        qrcodeTerminal.generate(qr, { 
            small: true,
            errorCorrectionLevel: 'M'
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('💡 Acesse a URL acima para QR Code melhor!');
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.error('❌ Erro ao gerar QR Code:', error);
        botStatus = '❌ Erro ao gerar QR Code';
    }
    
    // Reset após 25 segundos se não conectar
    setTimeout(() => {
        if (isConnecting) {
            qrGenerated = false;
            currentQRCode = null;
            qrExpireTime = null;
            botStatus = '⚠️ QR Code expirado - Reiniciando...';
            console.log('⚠️ QR Code expirado. Reiniciando...');
        }
    }, 25000);
});

// Evento de conexão
client.on('ready', () => {
    qrGenerated = true;
    isConnecting = false;
    currentQRCode = null;
    botStatus = '✅ Bot conectado e funcionando!';
    
    console.clear();
    console.log('\n' + '🎉'.repeat(20));
    console.log('✅ BOT WHATSAPP CONECTADO COM SUCESSO!');
    console.log('🤖 Sistema de casa de apostas ATIVO');
    console.log('👨‍💼 Sistema administrativo DISPONÍVEL');
    console.log('🚀 Pronto para receber clientes!');
    console.log('🎉'.repeat(20) + '\n');
    
    // Informações do bot
    console.log('📊 INFORMAÇÕES DO BOT:');
    console.log(`📱 Número: ${client.info.wid.user}`);
    console.log(`👤 Nome: ${client.info.pushname}`);
    console.log(`🌐 Plataforma: ${client.info.platform}`);
    console.log('\n' + '='.repeat(50));
    console.log('💡 Para acessar admin, envie: /admin');
    console.log('📧 Email admin: freefiremaxdojis@gmail.com');
    console.log('🔑 Senha admin: 006007');
    console.log('='.repeat(50) + '\n');
    
    Helpers.log('Bot conectado com sucesso na Railway', 'SYSTEM');
});

// Evento de desconexão
client.on('disconnected', (reason) => {
    console.log('\n❌ BOT DESCONECTADO:', reason);
    console.log('🔄 Tentando reconectar...\n');
    
    qrGenerated = false;
    isConnecting = false;
    currentQRCode = null;
    botStatus = '🔄 Reconectando...';
    
    Helpers.log(`Bot desconectado: ${reason}`, 'SYSTEM');
    
    // Tentar reconectar após 5 segundos
    setTimeout(() => {
        console.log('🔄 Reiniciando cliente...');
        botStatus = '🔄 Reiniciando cliente...';
        client.initialize();
    }, 5000);
});

// Evento de erro de autenticação
client.on('auth_failure', msg => {
    console.error('\n❌ FALHA NA AUTENTICAÇÃO:', msg);
    console.log('🔄 Reinicie o bot e escaneie novamente\n');
    
    qrGenerated = false;
    isConnecting = false;
    currentQRCode = null;
    botStatus = '❌ Falha na autenticação - Reinicie o bot';
    
    Helpers.log(`Falha na autenticação: ${msg}`, 'ERROR');
});

// Evento de carregamento
client.on('loading_screen', (percent, message) => {
    if (percent < 100) {
        botStatus = `🔄 Carregando WhatsApp: ${percent}%`;
        process.stdout.write(`\r🔄 Carregando WhatsApp: ${percent}% - ${message}`);
    } else {
        botStatus = '✅ WhatsApp carregado - Gerando QR Code...';
        console.log('\n✅ WhatsApp carregado completamente!');
    }
});

// Handler principal de mensagens
client.on('message', async msg => {
    try {
        // Ignorar mensagens de grupos e status
        if (msg.from.includes('@g.us') || msg.from.includes('status@broadcast')) {
            return;
        }

        // Ignorar mensagens próprias
        if (msg.fromMe) {
            return;
        }

        const messageBody = msg.body.trim();
        
        // Verificar se é comando de admin
        if (messageBody.startsWith('/admin') || config.admin.numbers.includes(msg.from)) {
            await adminHandler.handleAdminMessage(msg);
        } else {
            // Processar como usuário normal
            await userHandler.handleUserMessage(msg);
        }

    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        Helpers.log(`Erro ao processar mensagem: ${error.message}`, 'ERROR');
        
        // Tentar responder com mensagem de erro genérica
        try {
            await msg.reply('⚠️ Ocorreu um erro temporário. Tente novamente em alguns instantes.');
        } catch (replyError) {
            Helpers.log(`Erro ao enviar mensagem de erro: ${replyError.message}`, 'ERROR');
        }
    }
});

// Evento para capturar novos grupos
client.on('group_join', async (notification) => {
    try {
        const chat = await notification.getChat();
        Helpers.log(`Bot adicionado ao grupo: ${chat.name} (${chat.id._serialized})`, 'GROUP');
    } catch (error) {
        Helpers.log(`Erro ao processar entrada em grupo: ${error.message}`, 'ERROR');
    }
});

// Função para enviar mensagem em grupos específicos
async function sendToGroup(groupId, message) {
    try {
        await client.sendMessage(groupId, message);
        Helpers.log(`Mensagem enviada para grupo ${groupId}`, 'GROUP');
        return true;
    } catch (error) {
        Helpers.log(`Erro ao enviar para grupo ${groupId}: ${error.message}`, 'ERROR');
        return false;
    }
}

// Função para obter lista de grupos onde o bot é admin
async function getAdminGroups() {
    try {
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        const adminGroups = [];

        for (const group of groups) {
            const participants = group.participants;
            const botParticipant = participants.find(p => p.id._serialized === client.info.wid._serialized);
            
            if (botParticipant && botParticipant.isAdmin) {
                adminGroups.push({
                    id: group.id._serialized,
                    name: group.name,
                    participantCount: participants.length
                });
            }
        }

        return adminGroups;
    } catch (error) {
        Helpers.log(`Erro ao obter grupos admin: ${error.message}`, 'ERROR');
        return [];
    }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    Helpers.log(`Unhandled Rejection: ${reason}`, 'ERROR');
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    Helpers.log(`Uncaught Exception: ${error.message}`, 'ERROR');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, encerrando bot...');
    client.destroy();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Recebido SIGINT, encerrando bot...');
    client.destroy();
    process.exit(0);
});

// Inicializar o bot
console.log('\n🚀 INICIANDO BOT WHATSAPP NA RAILWAY...');
console.log('📡 Conectando ao WhatsApp Web...');
console.log('🌐 Servidor web iniciando...');
console.log('⏳ Aguarde o QR Code...\n');

botStatus = '🚀 Iniciando bot...';
client.initialize();

// Exportar funções para uso externo
module.exports = {
    client,
    sendToGroup,
    getAdminGroups,
    config
};