# WhatsApp Bot en Termux

Bot sencillo para tu grupo

## 📜 Comandos
```bash
┌──────────────────────
├ •🛡️ *ᴘᴀʀᴀ ᴀᴅᴍɪɴɪsᴛʀᴀᴄɪᴏɴ* 🛡️
├ •📍 /promote ᵈᵃʳ ᵖʳⁱᵛⁱˡᵉᵍⁱᵒˢ
├ •📍 /demote ᵠᵘⁱᵗᵃʳ ᵖʳⁱᵛⁱˡᵉᵍⁱᵒ 
├ •📍 /cerrar ᶜᵉʳʳᵃʳ ᶜʰᵃᵗ
├ •📍 /abrir ᵃᵇʳⁱʳ ᶜʰᵃᵗ
├ •📍 /clear ˡⁱᵐᵖⁱᵃʳ ᵈⁱʳᵉᶜᵗᵒʳⁱᵒ ᵗᵉᵐᵖ ᵈᵉ ˢᵗⁱᶜᵏᵉʳ
├ • ┅☑️*ᴘᴀʀᴀ ᴜsᴜᴀʀɪᴏs*☑️┅ •
├ •💥 /s ᶜᵒⁿᵛᵉʳᵗⁱʳ ⁱᵐᵃᵍᵉⁿ ᴀ ˢᵗⁱᶜᵏᵉʳ
├ •💥 /admins ᵛᵉʳ ˡⁱˢᵗᵃᵈᵒ ᵈᵉ ᵃᵈᵐⁱⁿ ᵈᵉˡ ᶜʳᵘᵖᵒ 
└───────────────────────
```
# 🔹 Instalación
Actualizamos e instalamos paquetes

```bash
apt update && apt upgrade -y
```
```bash
pkg install nodejs git ffmpeg -y
```
# 🔹 Clonamos repositorio y entramos en la carpeta
```bash
git clone https://github.com/Suprem-TX/SupremTX-Bot.git && cd SupremTX-Bot
```
# 🔹 Instalamos librerias
```bash
npm install 
```
```bash
npm install @whiskeysockets/baileys --legacy-peer-deps
```
```bash
npm install link-preview-js --legacy-peer-deps
```
```bash
npm install sharp@0.32.6
```

# 🔹 Ejecucion

```bash
   node index.js
```
Escaneas el QR y listo



## 📩 DATOS DEL CREADOR

---
## INFORMACION ADICIONAL

En caso de volver a iniciar sesion pero no puedes solo borra la carpeta 
**auth_info** 


```bash
rm -rf auth_info
```

