const config = require('../config');
const { cmd } = require('../command');
const os = require("os");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Jimp = require('jimp');
const moment = require('moment-timezone');
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// -------------------- Helper: Runtime Format --------------------
function runtime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${d}d ${h}h ${m}m ${s}s`;
}

// -------------------- VV2 Command --------------------
cmd({
  pattern: "vv2",
  alias: ["❤️", "😇", "💔", "🙂", "😂", "send"],
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isOwner }) => {
  try {
    if (!isOwner) return;
    if (!match.quoted) return client.sendMessage(from, { text: "*🍁 Please reply to a view once message!*" }, { quoted: message });

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;

    let content;
    if (mtype === "imageMessage") content = { image: buffer, caption: match.quoted.text || '' };
    else if (mtype === "videoMessage") content = { video: buffer, caption: match.quoted.text || '' };
    else if (mtype === "audioMessage") content = { audio: buffer, ptt: match.quoted.ptt || false };
    else return client.sendMessage(from, { text: "❌ Only image, video, and audio messages are supported" }, { quoted: message });

    await client.sendMessage(message.sender, content, { quoted: message });
  } catch (error) {
    console.error("vv2 Error:", error);
    client.sendMessage(from, { text: "❌ Error fetching vv2 message:\n" + error.message }, { quoted: message });
  }
});

// -------------------- VV Command --------------------
cmd({
  pattern: "vv",
  alias: ["viewonce", 'retrive'],
  react: '🐳',
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    if (!isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 This is an owner command.*"
      }, { quoted: message });
    }

    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a view once message!*"
      }, { quoted: message });
    }

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: match.quoted.ptt || false
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + error.message
    }, { quoted: message });
  }
});

// -------------------- Get Profile Picture --------------------
cmd({
  pattern: "getpp",
  react: "🖼️",
  desc: "Sends the profile picture of a user by phone number (owner only)",
  category: "owner",
  use: ".getpp <phone number>",
  filename: __filename
}, async (client, message, match, { text, from, isOwner }) => {
  try {
    if (!isOwner) return message.reply("🚫 *Only owner can use this command!*");
    if (!text) return message.reply("*🔥 Please provide a phone number (e.g., .getpp 1234567890)*");

    const targetJid = text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    let ppUrl;
    try {
      ppUrl = await client.profilePictureUrl(targetJid, "image");
    } catch {
      return message.reply("*🖼️ This user has no profile picture or it cannot be accessed!*");
    }

    await client.sendMessage(from, { image: { url: ppUrl }, caption: `> *© ᴩᴏᴡᴇʀᴅ ʙʏ ᴠᴇꜱ-ᴍᴅッ*` }, { quoted: message });
  } catch (e) {
    console.error("PP Fetch Error:", e);
    message.reply("🛑 An error occurred while fetching the profile picture!");
  }
});
// -------------------- Set Profile Picture --------------------


cmd({
  pattern: "setpp",
  desc: "Set bot profile picture.",
  category: "owner",
  react: "🖼️",
  filename: __filename
}, async (sock, msg, m, { from, reply }) => {
  try {
    // ✅ Check if user is owner
    const isOwner = msg.key.fromMe;
    if (!isOwner) {
      return await sock.sendMessage(from, { text: '❌ This command is only available for the owner!' });
    }

    // ✅ Check if message is a reply
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return await sock.sendMessage(from, { text: '⚠️ Please reply to an image with the .setpp command!' });
    }

    // ✅ Check if quoted message contains an image or sticker
    const mediaMsg = quoted.imageMessage || quoted.stickerMessage;
    if (!mediaMsg) {
      return await sock.sendMessage(from, { text: '❌ The replied message must contain an image!' });
    }

    // ✅ Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // ✅ Download the image or sticker content
    const stream = await downloadContentFromMessage(mediaMsg, mediaMsg.imageMessage ? 'image' : 'sticker');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // ✅ Save the image temporarily
    const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);
    fs.writeFileSync(imagePath, buffer);

    // ✅ Update profile picture
    await sock.updateProfilePicture(sock.user.id, { url: imagePath });

    // ✅ Delete temp file
    fs.unlinkSync(imagePath);

    await sock.sendMessage(from, { text: '✅ Successfully updated bot profile picture!' });

  } catch (error) {
    console.error('❌ Error in setpp command:', error);

    // ✅ Handle specific Baileys or file system errors
    let errMsg = '❌ Failed to update profile picture!';
    if (error?.message?.includes('Connection closed')) errMsg = '⚠️ Connection closed. Please reconnect the bot.';
    if (error?.message?.includes('status code 401')) errMsg = '⚠️ Unauthorized. Re-scan the QR code.';
    if (error?.message?.includes('ENOSPC')) errMsg = '⚠️ No space left on device.';
    
    await sock.sendMessage(from, { text: errMsg });
  }
});

Cmd({
  pattern: "setfullpp",
  desc: "Set full bot profile picture without cropping.",
  category: "owner",
  react: "🖼️",
  filename: __filename
}, async (sock, msg, m, { from }) => {
  try {
    // ✅ OWNER CHECK (simple & safe)
    if (!msg.key.fromMe) {
      return await sock.sendMessage(from, {
        text: "❌ This command is only for the owner!"
      });
    }

    // ✅ Check replied image
    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !quoted.imageMessage) {
      return await sock.sendMessage(from, {
        text: "⚠️ Please reply to an image to use this command!"
      });
    }

    // ✅ Download image
    const stream = await downloadContentFromMessage(
      quoted.imageMessage,
      "image"
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // ✅ Process image (FULL PP – no crop, only padding)
    const img = await Jimp.read(buffer);
    const w = img.getWidth();
    const h = img.getHeight();
    const size = Math.max(w, h);

    const canvas = new Jimp(size, size, 0xFFFFFFFF);
    canvas.composite(img, (size - w) / 2, (size - h) / 2);

    const finalBuffer = await canvas.getBufferAsync(Jimp.MIME_JPEG);

    // ✅ Update profile picture
    await sock.updateProfilePicture(sock.user.id, { url: finalBuffer });

    await sock.sendMessage(from, {
      text: "✅ Full profile picture successfully updated!"
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, {
      text: `❌ Failed to update profile picture: ${err.message}`
    });
  }
});

// -------------------- Send Quoted Message --------------------
cmd({
  pattern: "send",
  alias: ["sendme", "save"],
  react: '📤',
  desc: "Forwards quoted message back to user",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a message!*"
      }, { quoted: message });
    }

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = { image: buffer, caption: match.quoted.text || '' };
        break;
      case "videoMessage":
        messageContent = { video: buffer, caption: match.quoted.text || '' };
        break;
      case "audioMessage":
        messageContent = { audio: buffer, ptt: match.quoted.ptt || false };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("Forward Error:", error);
    await client.sendMessage(from, { text: "❌ Error forwarding message:\n" + error.message }, { quoted: message });
  }
});

// -------------------- JID Command --------------------//
cmd({
    pattern: "jid",
    alias: ["id", "chatid", "gjid"],  
    desc: "Get full JID of current chat/user (Creator Only)",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, isCreator, reply, sender 
}) => {
    try {
        if (!isCreator) {
            return reply("❌ *Command Restricted* - Only my creator can use this.");
        }

        if (isGroup) {
            // Ensure group JID ends with @g.us
            const groupJID = from.includes('@g.us') ? from : `${from}@g.us`;
            return reply(`👥 *Group JID:*\n\`\`\`${groupJID}\`\`\``);
        } else {
            // Ensure user JID ends with @s.whatsapp.net
            const userJID = sender.includes('@s.whatsapp.net') ? sender : `${sender}@s.whatsapp.net`;
            return reply(`👤 *User JID:*\n\`\`\`${userJID}\`\`\``);
        }

    } catch (e) {
        console.error("JID Error:", e);
        reply(`⚠️ Error fetching JID:\n${e.message}`);
    }
});

// -------------------- Restart --------------------
cmd({
  pattern: "restart",
  desc: "Restart the bot",
  category: "owner",
  react: "🔄",
  filename: __filename
}, async (conn, mek, m, { senderNumber, reply }) => {
  try {
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) return reply("*⚠️ Only the bot owner can use this command.*");

    const { exec } = require("child_process");
    reply("*🔄 Restarting...*");
    exec("pm2 restart all");
  } catch (e) {
    console.error(e);
    reply(`${e}`);
  }
});


cmd({
    pattern: "block",
    desc: "Blocks a person",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, m, { reply, q, react }) => {
    // Get the bot owner's number dynamically
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    
    if (m.sender !== botOwner) {
        await react("❌");
        return reply("Only the bot owner can use this command.");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender; // If replying to a message, get sender JID
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0]; // If mentioning a user, get their JID
    } else if (q && q.includes("@")) {
        jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net"; // If manually typing a JID
    } else {
        await react("❌");
        return reply("Please mention a user or reply to their message.");
    }

    try {
        await conn.updateBlockStatus(jid, "block");
        await react("✅");
        reply(`Successfully blocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        reply("Failed to block the user.");
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblocks a person",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (conn, m, { reply, q, react }) => {
    // Get the bot owner's number dynamically
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    if (m.sender !== botOwner) {
        await react("❌");
        return reply("Only the bot owner can use this command.");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender;
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0];
    } else if (q && q.includes("@")) {
        jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
    } else {
        await react("❌");
        return reply("Please mention a user or reply to their message.");
    }

    try {
        await conn.updateBlockStatus(jid, "unblock");
        await react("✅");
        reply(`Successfully unblocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        reply("Failed to unblock the user.");
    }
});
