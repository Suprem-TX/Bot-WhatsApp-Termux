# WhatsApp Bot en Termux

Bot sencillo para tus grupos, comandos sencillos bySupremTX

## 📌 Características
- ✅ Auto bienvenida y despedida en grupos.
- 🎨 Conversión de imágenes a stickers.
- 🎴 Capacidad de cerrar chat
  Entre otros

## 🚀 Instalación en Termux
Actualizamos paquetes e instalamos algunos

```bash
apt update && apt upgrade -y
```
```bash
pkg install nodejs git ffmpeg -y
```


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



### 🔹 Configuración
1. Escanea el código QR ejecutando:
   ```bash
   node index.js
   ```
2. Conéctate a WhatsApp y espera la autenticación.
3. ¡Listo! El bot estará activo en tu WhatsApp.

## 📜 Comandos principales
| Comando | Descripción |
|---------|------------|
| `.delete` | Elimina un mensaje en el grupo |
| `.sticker` | Convierte una imagen en sticker |
| `.mediafire <link>` | Descarga archivos desde MediaFire |
| `.bin` | Genera un BIN aleatorio |

## 🛠 Mantenimiento y actualización
Para actualizar el bot, usa:
```bash
cd whatsapp-bot
git pull
npm install
```

## 📩 Contacto
Si tienes dudas o sugerencias, contáctame en mi GitHub: [bySupremTX](https://github.com/bySupremTX)

---
💡 **Nota:** Asegúrate de usar este bot de manera ética y responsable.

