const { cmd } = require('../command');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const config = require('../config');
const { URL } = require("url");
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  sleep,
  fetchJson
} = require("../lib/functions");
const moment = require('moment-timezone');
const pkg = require("../package.json");
const {
  generateForwardMessageContent,
  prepareWAMessageFromContent,
  generateWAMessageContent,
  generateWAMessageFromContent
} = require("@whiskeysockets/baileys");

// ================= Helper Functions =================
function formatUptime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    heap: (used.heapUsed / 1024 / 1024).toFixed(2),
    rss: (used.rss / 1024 / 1024).toFixed(2),
    total: (os.totalmem() / 1024 / 1024).toFixed(0),
    free: (os.freemem() / 1024 / 1024).toFixed(2)
  };
}

function getTotalUsers() {
  try {
    return global.db && global.db.users
      ? Object.keys(global.db.users).length
      : 0;
  } catch {
    return 0;
  }
}
// ================== ALIVE COMMAND ===================
cmd({
      pattern: "alive",
      alias: ["status"],
      desc: "Check if the bot is alive",
      category: "main",
      react: "👋",
      filename: __filename,
    },
    async (conn, mek, m, { from, pushname, reply, setting }) => {
      try {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: true });
        const date = now.toLocaleDateString('en-GB');

        let aliveText = `👋 *HI*, *${pushname}* *I am Alive Now*
        
> 🤖 Bot Main Features

• Media Downloader 📥
• Anti view one ⛔
• Anti delete system 😏
• Auto read msg and statues 😗
• Best Owner Commands 👥
• Auto Groups News Update System 📰
• Open Source Bot Project 🛠️
• Super, Fast, Clear & Reliable 🚀

*📅 Date:* ${date}
*⏰ Time:* ${time}
`;

        // Send alive message with image and reaction
        const aliveMsg = await conn.sendMessage(from, {
            image:  { url: config.MENU_IMAGE_URL }, // <--- Me thanata oyata one image link eka danna
            caption: aliveText
        }, { quoted: mek });

        // Check if global.aliveMessages exists before setting
        if (!global.aliveMessages) {
            global.aliveMessages = new Map();
        }
        
        // Save message ID for reply tracking
        global.aliveMessages.set(aliveMsg.key.id, from);

      } catch (e) {
        console.error("Alive Command Error:", e);
        reply(`❌ Error: ${e.message}`);
      }
});

// ================= PING Command =================
cmd({
  pattern: "ping",
  alias: ["speed", "pong"],
  desc: "Check bot's response time.",
  category: "main",
  react: "⚡",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const startTime = Date.now();
    const msg = await conn.sendMessage(from, { text: '*𝙿𝙸𝙽𝙶𝙸𝙽𝙶...*' });
    const endTime = Date.now();
    const ping = endTime - startTime;

    await conn.sendMessage(from, {
      text: `*⚡ Pong : ${ping}ms*`
    }, { quoted: msg });

  } catch (e) {
    console.error("Ping Command Error:", e);
    reply(`❌ ${e.message}`);
  }
});

// ================= 5. OWNER Command =================
cmd({
    pattern: "owner",
    react: "👑", 
    alias: ["king"],
    desc: "Get owner number",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from }) => {
    try {
        const ownerNumber = '94740544995'; 
        const ownerName = 'Mr.isira'; 
        const organization = 'ves-md team';

        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName}\n` + 
                      `ORG:${organization};\n` +
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` +
                      'END:VCARD';

        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        });

        await conn.sendMessage(from, { 
            text: `This is the owner's contact: ${ownerName}`,
            contextInfo: {
                mentionedJid: [ownerNumber + '@s.whatsapp.net']
            }
        }, { quoted: mek });
    } catch (error) {
        reply('Sorry, there was an error fetching the owner contact.');
    }
});

// ================= SYSTEM INFO Command =================
cmd({
  pattern: "system",
  alias: ["status", "botinfo"],
  desc: "Check bot runtime, system usage and version",
  category: "main",
  react: "🤖",
  filename: __filename
}, async (conn, mek, m, { reply, from }) => {
  try {
    const mem = getMemoryUsage();
    const uptime = formatUptime(process.uptime());
    const platform = `${os.type()} ${os.arch()} (${os.platform()})`;
    const hostname = os.hostname();
    const cpuLoad = os.loadavg()[0] ? os.loadavg()[0].toFixed(2) : "N/A";
    const totalUsers = getTotalUsers();

    let status = `*╭━━━[ 🤖 BOT SYSTEM INFO ]━━━╮*
*┃* ⏳ Uptime      : ${uptime}
*┃* 🧠 RAM Usage   : ${mem.rss} MB / ${mem.total} MB
*┃* 💻 CPU Load    : ${cpuLoad}%
*┃* 🖥 Platform    : ${platform}
*┃* 🏷 Hostname    : ${hostname}
*┃* 🔋 Status      : Online 24/7
*┃* 🆚 Version     : ${pkg.version}
*┃* 👤 Owner       : Isira Induwara
*╰━━━━━━━━━━━━━━━━━━━━━━╯*

*📊 Extra Info*
*• CPU Cores     : ${os.cpus().length}*
*• Free Memory   : ${mem.free} MB*
*• Total Users   : ${totalUsers}*
*• Node Version  : ${process.version}*

> ${config.DESCRIPTION}
`;

    await conn.sendMessage(from, {
      image:  { url: config.MENU_IMAGE_URL }, // <-- replace with your image URL
      caption: status
    }, { quoted: mek });

  } catch (e) {
    console.error("System Command Error:", e);
    reply(`⚠️ Error: ${e.message}`);
  }
});

cmd({
  pattern: "forward",
  react: "🔀",
  alias: ["f"],
  desc: "Forward film and message",
  use: ".f jid",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, isMe, isOwner, isSudo }) => {
  try {
    // Check owner permissions
    if (!isMe && !isOwner && !isSudo) {
      return await reply("*📛 OWNER COMMAND ONLY*");
    }
    
    // Check if JID and quoted message are provided
    if (!q || !quoted) {
      return reply("*Please give me a JID and quote a message to continue.*");
    }
    
    // Split multiple JIDs by comma
    let jids = q.split(',').map(v => v.trim());
    if (jids.length === 0) {
      return reply("*Provide at least one valid JID. ⁉️*");
    }
    
    let messageObj = {
      key: quoted?.fakeObj?.key
    };
    
    // Handle document messages with captions safely
    if (quoted.documentWithCaptionMessage?.message?.documentMessage) {
      let docMsg = quoted.documentWithCaptionMessage.message.documentMessage;
      const mime = require("mime-types");
      let extension = mime.extension(docMsg.mimetype) || 'file';
      docMsg.fileName = docMsg.fileName || "file." + extension;
    }
    
    messageObj.message = quoted;
    let successfulJids = [];
    
    // Loop through each JID and forward the message
    for (let jid of jids) {
      try {
        await conn.forwardMessage(jid, messageObj, false);
        successfulJids.push(jid);
      } catch (err) {
        console.log("Forward Error for JID:", jid, err);
      }
    }
    
    // Send success or failure notification
    if (successfulJids.length > 0) {
      return reply("*✅ Message Forwarded Successfully!*\n\n" + successfulJids.join("\n"));
    } else {
      return reply("*❌ Failed to forward the message to the given JIDs.*");
    }
    
  } catch (e) {
    console.error("Forward Command Error:", e);
    return reply(`❌ Error: ${e.message}`);
  }
});


Cmd({
  pattern: 'id',
  react: '⚜',
  alias: ['getdeviceid'],
  desc: "Get message id",
  category: "main",
  use: ".id",
  filename: __filename
}, async (conn, mek, m, {
  from,
  quoted,
  isSudo,
  isMe,
  isOwner,
  reply
}) => {
  try {
    // Check owner / sudo permissions
    if (!isMe && !isOwner && !isSudo) {
      return await reply("*📛 OWNER COMMAND*");
    }
    
    // Check if a message is quoted
    if (!quoted) {
      return reply("*Please reply to a message... ℹ️*");
    }
    
    // Send the quoted message ID
    reply(quoted.id);
    
  } catch (err) {
    await conn.sendMessage(from, {
      react: {
        text: '❌',
        key: mek.key
      }
    });
    console.log(err);
    reply("❌ *Error Occurred !!*\n\n" + err);
  }
});


// ================== MENU COMMAND ===================
cmd({
      pattern: "menu",
      alias: ["status"],
      desc: "bot menu",
      category: "main",
      react: "📂",
      filename: __filename,
    },
    async (conn, mek, m, { from, pushname, reply, setting }) => {
      try {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: true });
        const date = now.toLocaleDateString('en-GB');

        let menuText = `*📂 VES ULTRA MINI BOT - COMMAND LIST*

> ✨ Main Commands
​.alive - Check if the bot is active and online
​.menu - Display the main command list
​.setting - Configure bot settings and preferences
​.ping - Check bot response speed (latency)
​.system - View host system information and resource usage
​.repo - Get the official GitHub repository link

> ​📥 Download Commands
​.song - Download audio tracks and songs
​.video - Download videos from various platforms
​.tiktok - Download TikTok videos without watermarks
​.fb - Download Facebook videos
​.apk - Download Android application files
​.mediafire - Download files directly from MediaFire links

> ​👑 Owner Commands
​.getpp - Fetch a user's profile picture
​.spam - Send repeated messages (Spam utility)
​.vv - Save and view View-Once media
​.jid - Get the unique JID of the chat
​.id - View group or chat ID
​.setpp - Change the bot's profile picture
​.block - Block a specific user
​.unblock - Unblock a restricted user
​.restart - Restart the bot system

> 👥 Group Commands
​.kick - Remove a member from the group
​.add - Add a new member to the group
​.mute - Restrict members from sending messages
​.unmute - Lift restrictions on group messaging
​.kickall - Remove all members from the group
​.tagall - Mention every member in the group
​.hidetag - Tag all members invisibly or with hidden text
​.left - Command the bot to leave the group
​.news on - Enable automated news updates
​.news off - Disable automated news updates

> ​🧠 AI Commands
​.aiimg - Generate AI images from text prompts
​.ves - Chat and interact directly with VES AI
`;

        // Send menu message with image and reaction
        const menuMsg = await conn.sendMessage(from, {
            image:  { url: config.MENU_IMAGE_URL },
            caption: menuText
        }, { quoted: mek });

        // Check if global.aliveMessages exists before setting (To prevent undefined errors)
        if (!global.aliveMessages) {
            global.aliveMessages = new Map();
        }
        
        // Save message ID for reply tracking
        global.aliveMessages.set(menuMsg.key.id, from);

      } catch (e) {
        console.error("Menu Command Error:", e);
        reply(`❌ Error: ${e.message}`);
      }
});
