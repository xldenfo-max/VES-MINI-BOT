const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search'); 

const API_BASE_URL = "https://supunofc.site/api/download/down/ytdl/dl";
const API_KEY = "supun-r10o9fwenuvlggw6qqhdihta";

cmd({
  pattern: "song",
  react: "🎶",
  desc: "Download YouTube song with format choice",
  category: "main",
  use: ".song < Yt url or Name >",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("*Please provide a YouTube URL or Song name!*");

    // Using standard yt-search
    const search = await yts(q);
    const videos = search.videos;
    if (!videos || videos.length === 0) return reply("No results found!");

    const ytsData = videos[0];
    const apiUrl = `${API_BASE_URL}?url=${encodeURIComponent(ytsData.url)}&type=mp3&apikey=${API_KEY}`;
    
    const res = await fetch(apiUrl);
    const apiData = await res.json();

    if (!apiData.success) return reply(`API Error: Failed to fetch download data.`);

    const downloadUrl = apiData.result?.downloadUrl;
    if (!downloadUrl) return reply("Failed to fetch download URL.");

    const ytmsg = `*🎵 SONG DOWNLOADER 🎵*

┃ 🎶 *Title:* ${ytsData.title}
┃ ⏳ *Duration:* ${ytsData.timestamp}
┃ 👀 *Views:* ${ytsData.views}
┃ 👤 *Author:* ${ytsData.author.name}
┃ 🔗 *Link:* ${ytsData.url}

*Choose download format:*

1 || . 📄 MP3 as Document
2 || . 🎧 MP3 as Audio
3 || . 🎙️ MP3 as Voice Note

> © ᴡʜ-ʙᴏᴛ ᴍᴇᴅᴇɪᴀ ᴅᴏᴡɴʟᴏᴅᴇʀ`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: ytsData.thumbnail },
      caption: ytmsg
    }, { quoted: mek });

    const filter = (msg) =>
      msg.key.remoteJid === from &&
      msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

    const timeout = 30000;

    const listener = async (msgUpdate) => {
      const msg = msgUpdate.messages[0];
      if (!filter(msg)) return;

      const selected = msg.message.extendedTextMessage.text.trim();
      await conn.sendMessage(from, { react: { text: "⬇️", key: msg.key } });

      switch (selected) {
        case "1":
          await conn.sendMessage(from, {
            document: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${ytsData.title}.mp3`,
            caption: `> *🎶 Your song is ready!*`
          }, { quoted: msg });
          break;

        case "2":
          await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg"
          }, { quoted: msg });
          break;

        case "3":
          await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            ptt: true
          }, { quoted: msg });
          break;

        default:
          await conn.sendMessage(from, { text: "*❌ Invalid selection!*" }, { quoted: msg });
          break;
      }

      conn.ev.off("messages.upsert", listener);
    };

    conn.ev.on("messages.upsert", listener);
    setTimeout(() => conn.ev.off("messages.upsert", listener), timeout);

  }cations (e) {
    console.error("Song Error:", e);
    reply("An error occurred. Please try again later.");
  }
});
//

cmd({
  Pattern: "song2",
  React: "🎶",
  Desc: "Download YouTube song with format choice",
  Category: "main",
  Use: ".song < Yt url or Name >",
  Filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  Try {
    If (!q) return reply("*Please provide a YouTube URL or Song name!*");

    // Using standard yt-search
    Const search = await yts(q);
    Const videos = search.videos;
    If (!videos || videos.length === 0) return reply("No results found!");

    Const ytsData = videos[0];
    Const apiUrl = `${API_BASE_URL}?url=${encodeURIComponent(ytsData.url)}&type=mp3&apikey=${API_KEY}`;
    
    Const res = await fetch(apiUrl);
    Const apiData = await res.json();

    If (!apiData.success) return reply(`API Error: Failed to fetch download data.`);

    Const downloadUrl = apiData.result?.downloadUrl;
    If (!downloadUrl) return reply("Failed to fetch download URL.");

    Const ytmsg = `*🎵 SONG DOWNLOADER 🎵*

┃ 🎶 *Title:* ${ytsData.title}
┃ ⏳ *Duration:* ${ytsData.timestamp}
┃ 👀 *Views:* ${ytsData.views}
┃ 👤 *Author:* ${ytsData.author.name}
┃ 🔗 *Link:* ${ytsData.url}

*Choose download format below:*

> © ᴡʜ-ʙᴏᴛ ᴍᴇᴅᴇɪᴀ ᴅᴏᴡɴʟᴏᴅᴇʀ`;

    // Sending with Interactive Buttons
    Const sentMsg = await conn.sendMessage(from, {
      InteractiveMessage: {
        Header: {
          HasMediaAttachment: true,
          ImageMessage: (await conn.prepareWAMessageMedia({ image: { url: ytsData.thumbnail } }, { upload: conn.waUploadToServer })).imageMessage
        },
        Body: { text: ytmsg },
        Footer: { text: "© ᴡʜ-ʙᴏᴛ ᴍᴇᴅᴇɪᴀ ᴅᴏᴡɴʟᴏᴅᴇʀ" },
        NativeFlowMessage: {
          Buttons: [
            {
              Name: "quick_reply",
              ButtonParamsJson: JSON.stringify({
                Display_text: "📄 MP3 Document",
                Id: `song_doc_${ytsData.title}`
              })
            },
            {
              Name: "quick_reply",
              ButtonParamsJson: JSON.stringify({
                Display_text: "🎧 MP3 Audio",
                Id: `song_audio_${ytsData.title}`
              })
            },
            {
              Name: "quick_reply",
              ButtonParamsJson: JSON.stringify({
                Display_text: "🎙️ Voice Note",
                Id: `song_ptt_${ytsData.title}`
              })
            }
          ]
        }
      }
    }, { quoted: mek });

    Const filter = (msg) =>
      Msg.key.remoteJid === from &&
      Msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

    Const timeout = 60000; // Increased timeout for button click

    Const listener = async (msgUpdate) => {
      Const msg = msgUpdate.messages[0];
      If (!filter(msg)) return;

      // Get selected button id or text response
      Const selected = msg.message?.extendedTextMessage?.text || 
                       Msg.message?.buttonsResponseMessage?.selectedButtonId || 
                       Msg.message?.templateButtonReplyMessage?.selectedId || "";

      Wait conn.sendMessage(from, { react: { text: "⬇️", key: msg.key } });

      If (selected.includes("song_doc_") || selected === "1") {
        Wait conn.sendMessage(from, {
          Document: { url: downloadUrl },
          Mimetype: "audio/mpeg",
          FileName: `${ytsData.title}.mp3`,
          Caption: `> *🎶 Your song is ready!*`
        }, { quoted: msg });
      } else if (selected.includes("song_audio_") || selected === "2") {
        Wait conn.sendMessage(from, {
          Audio: { url: downloadUrl },
          Mimetype: "audio/mpeg"
        }, { quoted: msg });
      } else if (selected.includes("song_ptt_") || selected === "3") {
        Wait conn.sendMessage(from, {
          Audio: { url: downloadUrl },
          Mimetype: "audio/mpeg",
          Ptt: true
        }, { quoted: msg });
      } else {
        Wait conn.sendMessage(from, { text: "*❌ Invalid selection or timeout!*" }, { quoted: msg });
      }

      Conn.ev.off("messages.upsert", listener);
    };

    Conn.ev.on("messages.upsert", listener);
    SetTimeout(() => conn.ev.off("messages.upsert", listener), timeout);

  } catch (e) {
    Console.error("Song Error:", e);
    Reply("An error occurred. Please try again later.");
  }
});
