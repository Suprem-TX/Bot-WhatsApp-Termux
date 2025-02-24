const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("🏮 𝙴𝚂𝙲𝙰𝙽𝙴𝙰 𝙴𝙻 𝙲𝙾𝙳𝙸𝙶𝙾 𝚀𝚁 🏮");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ 𝙲𝙾𝙽𝙴𝙲𝚃𝙰𝙳𝙾 𝙴𝚇𝙸𝚃𝙾𝚂𝙰𝙼𝙴𝙽𝚃𝙴 ');
        }
    });

// Ruta de imágenes (Cambia por la ubicación de tus imágenes)
const WELCOME_IMAGE = '/root/SupremTX-Bot/img/welcome.png';
const GOODBYE_IMAGE = '/root/SupremTX-Bot/img/bye.png';
// 🔥 NOTIFICAR CUANDO ALGUIEN ENTRA AL GRUPO 🔥
sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;
    
    if (action === 'add') {
        const groupMetadata = await sock.groupMetadata(id);
        const admins = groupMetadata.participants.filter(p => p.admin).map(a => `@${a.id.split('@')[0]}`).join(', ');
        const newUser = `@${participants[0].split('@')[0]}`;

        const welcomeMessage = `🏮 𝚂𝚄𝙿𝚁𝙴𝙼-𝚃𝚇 𝙱𝙾𝚃 🏮\n\n> Bɪᴇɴᴠᴇɴɪᴅᴏ ${newUser}\n\n> Usᴀ ᴇʟ ᴄᴏᴍᴀɴᴅᴏ /reglas ᴘᴀʀᴀ ᴠᴇʀ ᴇʟ ʀᴇɢʟᴀᴍᴇɴᴛᴏ ᴅᴇʟ ɢʀᴜᴘᴏ\n*🏮ᴅɪsғʀᴜʀᴀ ᴛᴜ ᴇsᴛᴀɴᴄɪᴀ🏮*`;
        await sock.sendMessage(id, { 
            image: { url: WELCOME_IMAGE }, 
            caption: welcomeMessage, 
            mentions: [participants[0]]
        });
    }
});
// 🔥 NOTIFICAR CUANDO ALGUIEN SALE DEL GRUPO 🔥
sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;

    if (action === 'remove') {
        const leftUser = `@${participants[0].split('@')[0]}`;

        // Determinar quién expulsó al usuario
        const demoter = lastMessageSender[id] 
            ? `@${lastMessageSender[id].split('@')[0]}` 
            : "Desconocido";

        // Mensaje de despedida
        const goodbyeMessage = `┌───────────────────\n` +
                               `├ •  𝗙𝗨𝗘 𝗘𝗫𝗣𝗨𝗟𝗦𝗔𝗗𝗢\n` +
                               `├ • ➤ ${leftUser}\n\n` +
                               `├ • ┅┅━━━━ 𖣫 ━━━━┅┅ •\n\n` +
                               `├ •  𝗔𝗖𝗖𝗜𝗢́𝗡 𝗘𝗖𝗛𝗔 𝗣𝗢𝗥\n` +
                               `├ • ➤ ${demoter}` +
                               `└───────────────────`;

        // Ruta de la imagen de despedida
        const imagePath = "/root/SupremTX-Bot/img/bye.png";

        try {
            // Verificar si la imagen de despedida existe
            if (!fs.existsSync(imagePath)) {
                console.error("❌ La imagen de despedida no existe:", imagePath);
                return;
            }

            // Leer la imagen en un buffer
            const imageBuffer = fs.readFileSync(imagePath);
            if (!imageBuffer) {
                console.error("❌ Error: La imagen no se cargó correctamente.");
                return;
            }

            // Enviar mensaje con imagen
            await sock.sendMessage(id, { 
                image: imageBuffer, 
                caption: goodbyeMessage, 
                mentions: [participants[0]]
            });

        } catch (error) {
            if (error.code === 'ERR_INVALID_ARG_TYPE') {
                console.error("❌ Error: Argumento inválido recibido, intentando solución...");

                // Intentar reenviar el mensaje después de 2 segundos
                setTimeout(async () => {
                    try {
                        const imageBuffer = fs.readFileSync(imagePath);
                        if (imageBuffer) {
                            await sock.sendMessage(id, { 
                                image: imageBuffer, 
                                caption: goodbyeMessage, 
                                mentions: [participants[0]]
                            });
                        }
                    } catch (retryError) {
                        console.error("❌ No se pudo enviar el mensaje tras el reinicio:", retryError.message);
                    }
                }, 2000);

            } else {
                console.error("❌ Error al enviar mensaje de despedida:", error.message || error);
            }
        }
    }
});
// 🔥 COMANDO MENU 🔥
sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if (text === '/menu') {
        // Ruta de la imagen local
        const imagePath = '/root/SupremTX-Bot/img/menu.png'; // Cambia esta ruta al archivo local

        // Lee la imagen de forma asincrónica
        fs.readFile(imagePath, (err, data) => {
            if (err) {
                console.error('Error al leer la imagen:', err);
                return;
            }

            // Envía la imagen local
            sock.sendMessage(sender, { 
                image: data, 
                caption: '>    🏮 𝚂𝚄𝙿𝚁𝙴𝙼-𝚃𝚇 𝙱𝙾𝚃 🏮\n\n' + 
                         '┌──────────────────────\n' +
                         '├ • *_ᴄᴏᴍᴀɴᴅᴏs ᴅᴇʟ ʙᴏᴛ_*\n\n' + 
                         '├ •🛡️ *ᴘᴀʀᴀ ᴀᴅᴍɪɴɪsᴛʀᴀᴄɪᴏɴ* 🛡️\n\n' + 
                         '├ •📍 /promote ᵈᵃʳ ᵖʳⁱᵛⁱˡᵉᵍⁱᵒˢ\n' + 
                         '├ •📍 /demote ᵠᵘⁱᵗᵃʳ ᵖʳⁱᵛⁱˡᵉᵍⁱᵒˢ\n' + 
                         '├ •📍 /cerrar ᶜᵉʳʳᵃʳ ᶜʰᵃᵗ\n' + 
                         '├ •📍 /abrir ᵃᵇʳⁱʳ ᶜʰᵃᵗ\n' + 
                         '├ •📍 /clear ˡⁱᵐᵖⁱᵃʳ ᵈⁱʳᵉᶜᵗᵒʳⁱᵒ ᵗᵉᵐᵖ ᵈᵉ ˢᵗⁱᶜᵏᵉʳ\n' + 
                         '├ • ┅☑️*ᴘᴀʀᴀ ᴜsᴜᴀʀɪᴏs*☑️┅ •\n\n' +
                         '├ •💥 /s ᶜᵒⁿᵛᵉʳᵗⁱʳ ⁱᵐᵃᵍᵉⁿ ᴀ ˢᵗⁱᶜᵏᵉʳ\n' + 
                         '├ •💥 /admins ᵛᵉʳ ˡⁱˢᵗᵃᵈᵒ ᵈᵉ ᵃᵈᵐⁱⁿ ᵈᵉˡ ᶜʳᵘᵖᵒ\n' + 
                         '└───────────────────────\n\n'
            });
        });
    }
});

// Guardamos el último mensaje enviado en el grupo
let lastMessageSender = {};
// Escuchamos los mensajes y guardamos el remitente del último mensaje en el grupo
sock.ev.on("messages.upsert", async (m) => {
    try {
        const msg = m.messages[0];
        if (!msg.key.fromMe && msg.key.remoteJid.endsWith("@g.us")) {
            lastMessageSender[msg.key.remoteJid] = msg.key.participant;
        }
    } catch (e) {
        console.error("Error al capturar el último mensaje:", e);
    }
});
// 🔥 NOTIFICAR CUANDO ALGUIEN ES PROMOVIDO A ADMIN 🔥
sock.ev.on("group-participants.update", async (update) => {
    const { id, participants, action } = update;

    if (action === "promote") {
        // Identificar quién promovió y quién fue promovido
        const promoter = lastMessageSender[id] 
            ? `@${lastMessageSender[id].split("@")[0]}` 
            : "ᴀɴᴏɴɪᴍᴏ";

        const newAdmin = `@${participants[0].split("@")[0]}`;

        // Mensaje de promoción
        const promoteMessage = `┌────────────────────\n` +
                               `├ • 🎖️ *ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ ɴᴜᴇᴠᴏ* 🎖️\n` +
                               `├ • 👤 *ᴜsᴜᴀʀɪᴏ:* ${newAdmin}\n\n` +
                               `├ • 👑 *ᴘʀᴏᴍᴏᴠɪᴅᴏ ᴘᴏʀ*\n` +
                               `├ • 👤 *ᴀᴅᴍɪɴ*: ${promoter}\n` +
                               `└────────────────────`;

        // Ruta de la imagen de promoción
        const imagePath = "/root/SupremTX-Bot/img/promote.png";

        try {
            // Verificar si la imagen existe
            if (!fs.existsSync(imagePath)) {
                console.error("❌ La imagen de promoción no existe:", imagePath);
                return;
            }

            // Leer la imagen
            const imageBuffer = fs.readFileSync(imagePath);
            if (!imageBuffer) {
                console.error("❌ Error: La imagen no se cargó correctamente.");
                return;
            }

            // Enviar mensaje con la imagen
            await sock.sendMessage(id, {
                image: imageBuffer,
                caption: promoteMessage,
                mentions: [participants[0], lastMessageSender[id]],
            });

        } catch (error) {
            console.error("❌ Error al enviar mensaje de promoción:", error.message || error);
        }
    }
});
// 🔥 NOTIFICAR CUANDO ALGUIEN ES DEGRADADO DE ADMIN 🔥
sock.ev.on("group-participants.update", async (update) => {
    const { id, participants, action } = update;

    if (action === "demote") {
        const demoter = lastMessageSender[id] ? `@${lastMessageSender[id].split("@")[0]}` : "ᴀɴᴏɴɪᴍᴏ";
        const demotedUser = `@${participants[0].split("@")[0]}`;
        const demoteMessage = `⚠️ *ᴘʀɪᴠɪʟᴇɢɪᴏs ᴅᴇɢʀᴀᴅᴀᴅᴏs* ⚠️\n👤 *ᴜsᴜᴀʀɪᴏ:* ${demotedUser}\n❌ *ᴀᴄᴄɪᴏɴ ᴘᴏʀ* ${demoter}`;

        // Ruta de la imagen
        const imagePath = "/root/SupremTX-Bot/img/demote.png";
        const imageBuffer = fs.readFileSync(imagePath);

        await sock.sendMessage(id, {
            image: imageBuffer,
            caption: demoteMessage,
            mentions: [participants[0], lastMessageSender[id]],
        });
    }
});
//PARTE DEL COMANDO CLEAR
// Define la función para limpiar el directorio
async function clearTempDirectory() {
    const tempDir = '/root/SupremTX-Bot/temp'; // Reemplaza con la ruta del directorio que deseas limpiar

    try {
        const files = fs.readdirSync(tempDir);

        // Elimina todos los archivos dentro del directorio
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            if (fs.lstatSync(filePath).isFile()) {
                fs.unlinkSync(filePath); // Elimina el archivo
            }
        }

        console.log('✅ Directorio limpiado con éxito');
    } catch (error) {
        console.error('❌ Error al limpiar el directorio:', error);
        throw error;
    }
}
//COMANDO /CLEAR
sock.ev.on('messages.upsert', async (m) => {
    try {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');

        if (!isGroup) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        if (text === '/clear') {
            // Obtener los administradores del grupo
            const groupMetadata = await sock.groupMetadata(sender);
            const participants = groupMetadata.participants;
            const senderNumber = msg.key.participant || msg.key.remoteJid;
            const senderId = senderNumber.includes('@s.whatsapp.net') ? senderNumber : senderNumber + '@s.whatsapp.net';

            // Verificar si el remitente es un administrador o el creador del grupo
            const isAdmin = participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin' || p.admin === 'creator'));

            if (!isAdmin) {
                await sock.sendMessage(sender, { text: '📛Sᴏʟᴏ ʟᴏs ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs ᴇ ᴇʟ ᴄʀᴇᴀᴅᴏʀ ᴘᴜᴇᴅᴇɴ ᴜsᴀʀ ᴇʟ ᴄᴏᴍᴀɴᴅᴏ📛' });
                return;
            }

            // Llama a la función para limpiar el directorio temp
            await clearTempDirectory();
            await sock.sendMessage(sender, { text: '✅ ᴅɪʀᴇᴄᴛᴏʀɪᴏ ʟɪᴍᴘɪᴀᴅᴏ ᴄᴏɴ ᴇxɪᴛᴏ' });
        }

    } catch (error) {
        console.error('❌ Error en el comando /clearTemp:', error);
    }
});
//COMADO /s
sock.ev.on('messages.upsert', async (m) => {
    try {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');

        if (!isGroup) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        if (text === '/s') {
            // Verificar si el mensaje es una respuesta
            if (!msg.message.extendedTextMessage || !msg.message.extendedTextMessage.contextInfo) {
                await sock.sendMessage(sender, { text: '📌 ʀᴇꜱᴘᴏɴᴅᴇ ᴀ ᴜɴᴀ ɪᴍᴀɢᴇɴ ᴘᴀʀᴀ ᴄᴏɴᴠᴇʀᴛɪʀʟᴀ ᴇɴ ꜱᴛɪᴄᴋᴇʀ.' });
                return;
            }

            const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;

            // Verificar si el mensaje citado es una imagen
            if (!quotedMessage || !quotedMessage.imageMessage) {
                await sock.sendMessage(sender, { text: '📌 ᴇʟ ᴍᴇɴꜱᴀᴊᴇ ᴀʟ Qᴜᴇ ʀᴇꜱᴘᴏɴᴅɪꜱᴛᴇ ɴᴏ ᴇꜱ ᴜɴᴀ ɪᴍᴀɢᴇɴ' });
                return;
            }

            // Descargar la imagen correctamente
            const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const imagePath = path.join(__dirname, 'temp', 'image.jpg');
            const stickerPath = path.join(__dirname, 'temp', 'sticker.webp');

            writeFile(imagePath, buffer, async (err) => {
                if (err) {
                    console.error('❌ Error al guardar la imagen:', err);
                    await sock.sendMessage(sender, { text: '❌ Error al procesar la imagen.' });
                    return;
                }

                // Convertir la imagen a sticker usando ffmpeg
                exec(`ffmpeg -i ${imagePath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" ${stickerPath}`, async (error) => {
                    if (error) {
                        console.error('❌ Error al convertir a sticker:', error);
                        await sock.sendMessage(sender, { text: '❌ Error al convertir la imagen en sticker.' });
                        return;
                    }

                    // Enviar el sticker
                    await sock.sendMessage(sender, {
                        sticker: { url: stickerPath }
                    });

                    console.log('✅ Sticker enviado correctamente.');
                });
            });
        }
    } catch (error) {
        console.error('❌ Error en el comando /sticker:', error);
    }
});
// 🔥 COMANDO ADMIN 🔥
sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

if (text === '/admins') {
    if (!sender.includes('@g.us')) {
        return await sock.sendMessage(sender, { text: '🔖 ʙᴏᴛ ғᴜɴᴄɪᴏɴᴀʟ ᴇɴ ɢʀᴜᴘᴏs' });
    }

    try {
        const groupMetadata = await sock.groupMetadata(sender);
        const admins = groupMetadata.participants.filter(p => p.admin);

        if (admins.length === 0) {
            return await sock.sendMessage(sender, { text: '❌ No se encontraron administradores en este grupo.' });
        }

        const mentions = admins.map(admin => `@${admin.id.split('@')[0]}`).join('\n');

        // Ruta de la imagen local
        const imagePath = '/root/SupremTX-Bot/img/info.png';

        // Verifica si la imagen existe antes de enviarla
        if (!fs.existsSync(imagePath)) {
        }

        // Lee la imagen y envía el mensaje con la lista de administradores
        const imageBuffer = fs.readFileSync(imagePath);
        await sock.sendMessage(sender, {
            image: imageBuffer,
            caption: `🏮 *ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs ᴅᴇʟ ɢʀᴜᴘᴏ* 🏮\n\n${mentions}`,
            mentions: admins.map(admin => admin.id)
        });

    } catch (error) {
        console.error('Error obteniendo admins:', error);
    }
}
// 🔥 COMANDO PARA DESACTIVAR MENSAJES EN EL GRUPO 🔥
else if (text.startsWith('/cerrar')) {
    if (!sender.includes('@g.us')) {
        return await sock.sendMessage(sender, { text: '🔖 ʙᴏᴛ ғᴜɴᴄɪᴏɴᴀʟ ᴇɴ ɢʀᴜᴘᴏs' });
    }

    try {
        const groupMetadata = await sock.groupMetadata(sender);
        const admins = groupMetadata.participants.filter(p => p.admin).map(a => a.id);
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        if (!admins.includes(msg.key.participant)) {
            return await sock.sendMessage(sender, { text: '🔖Sᴏʟᴏ ʟᴏs ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs ᴘᴜᴇᴅᴇɴ ᴜsᴀʀ ᴇʟ ᴄᴏᴍᴀɴᴅᴏ🔖' });
        }

        if (!admins.includes(botNumber)) {
            return await sock.sendMessage(sender, { text: '🔖ɴᴇᴄᴇsɪᴛᴏ sᴇʀ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ🔖' });
        }

        // Desactivar el permiso de enviar mensajes para todos excepto administradores
        const participants = groupMetadata.participants.map(p => p.id);
        const nonAdmins = participants.filter(id => !admins.includes(id)); // Filtrar a los no administradores

        await sock.groupSettingUpdate(sender, 'announcement'); // Cambiar la configuración del grupo a solo anuncios

        await sock.sendMessage(sender, { text: '*🏮 ɢʀᴜᴘᴏ ᴄᴇʀʀᴀᴅᴏ 🏮*' });

    } catch (error) {
        console.error('Error al desactivar mensajes en el grupo:', error);
    }
}
// 🔥 COMANDO PARA ACTIVAR MENSAJES EN EL GRUPO 🔥
else if (text.startsWith('/abrir')) {
    if (!sender.includes('@g.us')) {
        return await sock.sendMessage(sender, { text: '🔖 ʙᴏᴛ ғᴜɴᴄɪᴏɴᴀʟ ᴇɴ ɢʀᴜᴘᴏs' });
    }

    try {
        const groupMetadata = await sock.groupMetadata(sender);
        const admins = groupMetadata.participants.filter(p => p.admin).map(a => a.id);
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        if (!admins.includes(msg.key.participant)) {
            return await sock.sendMessage(sender, { text: '🔖Sᴏʟᴏ ʟᴏs ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs ᴘᴜᴇᴅᴇɴ ᴜsᴀʀ ᴇʟ ᴄᴏᴍᴀɴᴅᴏ🔖' });
        }

        if (!admins.includes(botNumber)) {
            return await sock.sendMessage(sender, { text: '🔖ɴᴇᴄᴇsɪᴛᴏ sᴇʀ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ🔖' });
        }

        // Activar el permiso de enviar mensajes para todos los miembros
        await sock.groupSettingUpdate(sender, 'not_announcement'); // Cambiar la configuración del grupo a mensajes habilitados para todos

        await sock.sendMessage(sender, { text: '*🏮 ɢʀᴜᴘᴏ ᴀʙɪᴇʀᴛᴏ 🏮*' });

    } catch (error) {
        console.error('Error al activar mensajes en el grupo:', error);
    }
}
// 🔥 COMANDO PARA PROMOVER A ADMIN 🔥
else if (text.startsWith('/promote')) {
    if (!sender.includes('@g.us')) {
        return await sock.sendMessage(sender, { text: '🔖 ʙᴏᴛ ғᴜɴᴄɪᴏɴᴀʟ ᴇɴ ɢʀᴜᴘᴏs' });
    }

    try {
        const groupMetadata = await sock.groupMetadata(sender);
        const admins = groupMetadata.participants.filter(p => p.admin).map(a => a.id);
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        if (!admins.includes(msg.key.participant)) {
            return await sock.sendMessage(sender, { text: '🔖Sᴏʟᴏ ʟᴏs ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs ᴘᴜᴇᴅᴇɴ ᴜsᴀʀ ᴇʟ ᴄᴏᴍᴀɴᴅᴏ🔖' });
        }

        if (!admins.includes(botNumber)) {
            return await sock.sendMessage(sender, { text: '🔖ɴᴇᴄᴇsɪᴛᴏ sᴇʀ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ🔖' });
        }

        let userToPromote;

        if (msg.message.extendedTextMessage?.contextInfo?.participant) {
            userToPromote = msg.message.extendedTextMessage.contextInfo.participant;
        } else {
            const mentionedUsers = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            userToPromote = mentionedUsers.length > 0 ? mentionedUsers[0] : null;
        }

        if (!userToPromote) {
            return await sock.sendMessage(sender, { 
                text: '🔖Sᴏʟᴏ ʟᴏs ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs ᴘᴜᴇᴅᴇɴ ᴜsᴀʀ ᴇʟ ᴄᴏᴍᴀɴᴅᴏ🔖' 
            });            
        }

        // Promover al usuario
        await sock.groupParticipantsUpdate(sender, [userToPromote], 'promote');

    } catch (error) {
        console.error('Error promoviendo a admin:', error);
        await sock.sendMessage(sender, { text: '❌ Ocurrió un error al promover al usuario ❌' });
    }
}
// 🔥 COMANDO PARA QUITAR PRIVILEGIOS DE ADMIN 🔥
else if (text.startsWith('/demote')) {
    if (!sender.includes('@g.us')) {
        return await sock.sendMessage(sender, { text: '🔖 ʙᴏᴛ ғᴜɴᴄɪᴏɴᴀʟ ᴇɴ ɢʀᴜᴘᴏs' });
    }

    try {
        const groupMetadata = await sock.groupMetadata(sender);
        const admins = groupMetadata.participants.filter(p => p.admin).map(a => a.id);
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        if (!admins.includes(msg.key.participant)) {
            return await sock.sendMessage(sender, { text: '🔖Sᴏʟᴏ ʟᴏs ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs ᴘᴜᴇᴅᴇɴ ᴜsᴀʀ ᴇʟ ᴄᴏᴍᴀɴᴅᴏ🔖' });
        }

        if (!admins.includes(botNumber)) {
            return await sock.sendMessage(sender, { text: '🔖ɴᴇᴄᴇsɪᴛᴏ sᴇʀ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ🔖' });
        }

        let userToDemote;

        if (msg.message.extendedTextMessage?.contextInfo?.participant) {
            userToDemote = msg.message.extendedTextMessage.contextInfo.participant;
        } else {
            const mentionedUsers = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            userToDemote = mentionedUsers.length > 0 ? mentionedUsers[0] : null;
        }

        if (!userToDemote) {
            return await sock.sendMessage(sender, { text: '⚠️ No se ha mencionado a ningún usuario para quitarle privilegios.' });
        }

        if (!admins.includes(userToDemote)) {
            return await sock.sendMessage(sender, { text: '⚠️ El usuario no es un administrador.' });
        }

        await sock.groupParticipantsUpdate(sender, [userToDemote], 'demote');

    } catch (error) {
        console.error('❌ Error quitando admin:', error);
        await sock.sendMessage(sender, { text: '❌ Hubo un error al intentar quitar los privilegios de administrador.' });
    }
}
//FINAL//
    });
}
startBot();
