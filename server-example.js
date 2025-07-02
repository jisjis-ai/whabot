const express = require('express');
const qrcode = require('qrcode');
const WhatsAppAuthSystem = require('./whatsapp-auth-system');

const app = express();
const PORT = 3000;

// Instância do sistema de autenticação
const whatsappAuth = new WhatsAppAuthSystem('bot-principal');

// Variáveis de estado
let currentQRCode = null;
let connectionStatus = 'Iniciando...';
let clientInfo = null;

// Configurar callbacks
whatsappAuth.setCallbacks({
    onQR: async (qr) => {
        console.log('🔄 Novo QR Code gerado');
        currentQRCode = await qrcode.toDataURL(qr);
        connectionStatus = 'QR Code gerado - Escaneie para conectar';
    },
    
    onReady: (info) => {
        console.log('✅ WhatsApp conectado!');
        currentQRCode = null;
        connectionStatus = 'Conectado e funcionando';
        clientInfo = info;
    },
    
    onDisconnected: (reason) => {
        console.log('❌ WhatsApp desconectado:', reason);
        currentQRCode = null;
        connectionStatus = `Desconectado: ${reason}`;
        clientInfo = null;
        
        // Tentar reconectar após 5 segundos
        setTimeout(() => {
            whatsappAuth.initialize();
        }, 5000);
    },
    
    onAuthFailure: (msg) => {
        console.log('🚫 Falha na autenticação:', msg);
        currentQRCode = null;
        connectionStatus = 'Erro na autenticação - Reiniciando...';
        
        // Reiniciar após 3 segundos
        setTimeout(() => {
            whatsappAuth.initialize();
        }, 3000);
    }
});

// Rota principal
app.get('/', (req, res) => {
    const status = whatsappAuth.getStatus();
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🤖 WhatsApp Bot - Auth System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .status {
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                font-weight: bold;
            }
            .connected { background: #d4edda; color: #155724; }
            .qr-ready { background: #fff3cd; color: #856404; }
            .error { background: #f8d7da; color: #721c24; }
            .loading { background: #d1ecf1; color: #0c5460; }
            .qr-container {
                margin: 20px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            .info-box {
                background: #e7f3ff;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                text-align: left;
            }
        </style>
        <script>
            // Auto refresh a cada 3 segundos
            setTimeout(() => location.reload(), 3000);
        </script>
    </head>
    <body>
        <div class="container">
            <h1>🤖 WhatsApp Bot</h1>
            <h2>Sistema de Autenticação Persistente</h2>
            
            <div class="status ${getStatusClass(status)}">
                📱 ${connectionStatus}
            </div>
            
            ${currentQRCode ? `
                <div class="qr-container">
                    <h3>📱 Escaneie o QR Code:</h3>
                    <img src="${currentQRCode}" style="max-width: 300px; width: 100%;">
                    <p><small>QR Code válido por 20 segundos</small></p>
                </div>
            ` : ''}
            
            ${status.isReady && clientInfo ? `
                <div class="info-box">
                    <h3>✅ Conectado com sucesso!</h3>
                    <p><strong>Número:</strong> ${clientInfo.wid.user}</p>
                    <p><strong>Nome:</strong> ${clientInfo.pushname}</p>
                    <p><strong>Plataforma:</strong> ${clientInfo.platform}</p>
                </div>
            ` : ''}
            
            <div class="info-box">
                <h3>🔧 Status Técnico:</h3>
                <p><strong>Sessão salva:</strong> ${status.hasSession ? '✅ Sim' : '❌ Não'}</p>
                <p><strong>QR Code ativo:</strong> ${status.hasQR ? '✅ Sim' : '❌ Não'}</p>
                <p><strong>Cliente pronto:</strong> ${status.isReady ? '✅ Sim' : '❌ Não'}</p>
            </div>
            
            <div style="margin-top: 30px;">
                <button onclick="location.href='/logout'" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    🚪 Forçar Logout (Novo QR)
                </button>
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(html);
});

function getStatusClass(status) {
    if (status.isReady) return 'connected';
    if (status.hasQR) return 'qr-ready';
    if (connectionStatus.includes('Erro')) return 'error';
    return 'loading';
}

// Rota para forçar logout (gerar novo QR)
app.get('/logout', async (req, res) => {
    await whatsappAuth.logout();
    res.redirect('/?msg=logout');
});

// API de status
app.get('/api/status', (req, res) => {
    res.json({
        ...whatsappAuth.getStatus(),
        connectionStatus,
        currentQRCode
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
});

// Inicializar WhatsApp
whatsappAuth.initialize();