# 🤖 Bot WhatsApp - Casa de Apostas (Railway)

Bot completo para WhatsApp hospedado na Railway com sistema administrativo avançado e interface web para QR Code.

## 🚀 Deploy na Railway

### Passo a Passo:

1. **Criar conta na Railway**: https://railway.app
2. **Conectar GitHub**: Faça fork deste repositório
3. **Deploy automático**: Railway detectará automaticamente o projeto Node.js
4. **Acessar URL**: Railway gerará uma URL como `https://seu-projeto.railway.app`
5. **Escanear QR Code**: Acesse a URL e escaneie o QR Code

### 📱 Como Conectar:

1. Após o deploy, acesse a **URL do seu projeto** (aparece no painel Railway)
2. Aguarde a página carregar com o QR Code
3. Abra o WhatsApp no celular
4. Vá em "Dispositivos conectados" > "Conectar dispositivo"
5. Escaneie o QR Code que aparece na página web
6. ✅ Bot conectado e funcionando!

## 🌐 Interface Web

- **QR Code limpo**: Página bonita com QR Code escaneável
- **Timer visual**: Mostra tempo restante (20 segundos)
- **Status em tempo real**: Conectando/Conectado/Erro
- **Auto-refresh**: Página atualiza automaticamente
- **Responsivo**: Funciona em celular e desktop
- **Instruções claras**: Como conectar o WhatsApp

## 🔧 Configurações Railway

- **Node.js**: Versão 18+
- **Servidor Web**: Express.js na porta 3000
- **Memória**: 512MB (suficiente)
- **Restart Policy**: Automático em caso de falha
- **URL pública**: Gerada automaticamente pela Railway

## 🎯 Links Configurados

- **Casa Principal**: https://receber.netlify.app/register
- **Casa 2**: https://olagiro.netlify.app/
- **Casa 3**: https://megagiro.netlify.app/
- **Casa 4**: https://sshortly.net/e8c338e
- **Grupo VIP**: https://chat.whatsapp.com/BD677joED8ABFOVQXv5kPK

## 👨‍💼 Acesso Administrativo

### Login:
1. Envie `/admin` para o bot
2. Digite as credenciais:
```
Email: freefiremaxdojis@gmail.com
Senha: 006007
```

### Comandos Disponíveis:

#### 📊 Informações
- `/stats` - Estatísticas do bot
- `/contacts` - Baixar lista de contatos
- `/config` - Ver configurações atuais

#### 📝 Configurações
- `/setmessage [tipo] [mensagem]` - Alterar mensagens
- `/setlink [casa] [link]` - Alterar links das casas

#### 📢 Envios em Massa
- `/broadcast [mensagem]` - Enviar mensagem para todos
- `/sendaudio` - Enviar áudio (responda um áudio)
- `/sendmedia` - Enviar mídia (responda uma mídia)

## 🛡️ Recursos Anti-Ban

- ✅ Delays aleatórios entre envios (3-8 segundos)
- ✅ Variações automáticas de mensagens
- ✅ Simulação de comportamento humano
- ✅ Limitação de envios por minuto
- ✅ QR Code único (evita spam de códigos)
- ✅ Interface web profissional

## 🔄 Fluxo do Cliente

1. **Cliente chega do Facebook** → Recebe boas-vindas + link da casa principal
2. **Qualquer resposta** → Bot solicita screenshot do depósito
3. **Texto enviado** → Bot pede novamente a foto
4. **Foto enviada** → Libera acesso ao grupo VIP + incentiva outras casas
5. **Mensagens seguintes** → Continua incentivando cadastros

## 📊 Monitoramento

- **Interface web**: Status em tempo real na URL
- **Logs Railway**: Logs completos no painel
- **Estatísticas**: Via comando `/stats`
- **Relatórios**: De envios em massa
- **Backup automático**: De contatos

## 🌐 Como Encontrar sua URL

### Método 1 - Painel Railway:
1. Acesse https://railway.app
2. Entre no seu projeto
3. Aba "Settings" → "Domains"
4. URL aparece: `https://seu-projeto.railway.app`

### Método 2 - Deploy Tab:
1. Aba "Deployments" → Último deploy
2. URL aparece no topo do deployment

### Método 3 - Logs:
Procure nos logs por:
```
🔗 URL: https://seu-projeto.railway.app
```

## 🚨 Importante para Railway

- ✅ **Servidor web**: Express.js para interface
- ✅ **QR Code web**: Página bonita e funcional
- ✅ **Auto-refresh**: Atualização automática
- ✅ **Reconexão automática**: Em caso de desconexão
- ✅ **Logs limpos**: Fácil visualização
- ✅ **Error handling**: Tratamento completo de erros
- ✅ **Status API**: Endpoint `/api/status` para monitoramento

## 🔧 Troubleshooting

### QR Code não aparece:
1. Acesse a URL do projeto na Railway
2. Aguarde até 30 segundos para carregar
3. Se necessário, atualize a página (F5)

### Bot desconecta:
1. Railway reconecta automaticamente
2. Novo QR Code será gerado na URL
3. Monitore os logs para acompanhar

### URL não funciona:
1. Verifique se o deploy foi bem-sucedido
2. Aguarde alguns minutos após o deploy
3. Teste a URL em navegador anônimo

---

**🚀 Agora com interface web profissional para QR Code!**
**🌐 Acesse sua URL da Railway e conecte facilmente!**