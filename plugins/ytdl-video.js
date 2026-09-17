const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');

// Define constants for the SupunOfc API
const API_BASE_URL = "https://supunofc.site/api/download/down/ytdl/dl";
const API_KEY = "supun-r10o9fwenuvlggw6qqhdihta";

cmd({
    pattern: "video",
    alias: ["mp4", "song"],
    react: "🎥",
    desc: "Download video from YouTube",
    category: "download",
    use: ".video <query or URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a video name or YouTube URL!");

        let videoUrl, title;

        // ===============================
        // Detect if input = YouTube URL
        // ===============================
        if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(q)) {

            // Extract video ID safely
            let id;
            if (q.includes("v=")) {
                id = q.split("v=")[1].split("&")[0];
            } else {
                id = q.split("/").pop();
            }

            const info = await yts({ videoId: id });
            if (!info || !info.title) return reply("❌ Invalid YouTube URL!");

            videoUrl = `https://youtu.be/${id}`;
            title = info.title;

        } else {

            // ===============================
            // YouTube Search Mode
            // ===============================
            const search = await yts(q);
            if (!search.videos.length) return reply("❌ No results found!");

            const vid = search.videos[0];
            videoUrl = vid.url;
            title = vid.title;
        }

        await reply("⏳ *Downloading your video... Please wait!*");

        // ===============================
        // Call SupunOfc API (type=mp4)
        // ===============================
        const apiUrl = `${API_BASE_URL}?url=${encodeURIComponent(videoUrl)}&type=mp4&apikey=${API_KEY}`;

        const res = await fetch(apiUrl);
        const json = await res.json();

        // Check response properly based on SupunOfc API format
        if (!json.success || !json.result || !json.result.downloadUrl) {
            return reply("❌ API Error: Unable to fetch download link!");
        }

        const downloadLink = json.result.downloadUrl;

        // ===============================
        // SEND VIDEO
        // ===============================
        await conn.sendMessage(
            from,
            {
                video: { url: downloadLink },
                mimetype: "video/mp4",
                caption: `ᴡʜ-ʙᴏᴛ ᴍᴇᴅᴇɪᴀ ᴅᴏᴡɴʟᴏᴅᴇʀ🎬 *${title}*`
            },
            { quoted: mek }
        );

    } catch (error) {
        console.error(error);
        reply("❌ Error: " + error.message);
    }
});

const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');

// Define constants for the SupunOfc API

cmd({
    pattern: "video2",
    alias: ["mp4"],
    react: "🎥",
    desc: "Download video from YouTube with format choice",
    category: "download",
    use: ".video <query or URL>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a video name or YouTube URL!");

        let videoUrl, title, thumbnail, duration, views, author;

        // ===============================
        // Detect if input = YouTube URL
        // ===============================
        if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(q)) {
            let id;
            if (q.includes("v=")) {
                id = q.split("v=")[1].split("&")[0];
            } else {
                id = q.split("/").pop();
            }

            const info = await yts({ videoId: id });
            if (!info || !info.title) return reply("❌ Invalid YouTube URL!");

            videoUrl = `https://youtu.be/${id}`;
            title = info.title;
            thumbnail = info.thumbnail;
            duration = info.timestamp;
            views = info.views;
            author = info.author.name;
        } else {
            // ===============================
            // YouTube Search Mode
            // ===============================
            const search = await yts(q);
            if (!search.videos.length) return reply("❌ No results found!");

            const vid = search.videos[0];
            videoUrl = vid.url;
            title = vid.title;
            thumbnail = vid.thumbnail;
            duration = vid.timestamp;
            views = vid.views;
            author = vid.author.name;
        }

        // ===============================
        // Call SupunOfc API (type=mp4)
        // ===============================
        const apiUrl = `${API_BASE_URL}?url=${encodeURIComponent(videoUrl)}&type=mp4&apikey=${API_KEY}`;

        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.success || !json.result || !json.result.downloadUrl) {
            return reply("❌ API Error: Unable to fetch download link!");
        }

        const downloadUrl = json.result.downloadUrl;

        const ytmsg = `*🎬 VIDEO DOWNLOADER 🎬*

┃ 🎶 *Title:* ${title}
┃ ⏳ *Duration:* ${duration}
┃ 👀 *Views:* ${views}
┃ 👤 *Author:* ${author}
┃ 🔗 *Link:* ${videoUrl}

*Choose download format below:*

> © ᴡʜ-ʙᴏᴛ ᴍᴇᴅᴇɪᴀ ᴅᴏᴡɴʟᴏᴅᴇʀ`;

        // Sending with Interactive Buttons
        const sentMsg = await conn.sendMessage(from, {
            interactiveMessage: {
                header: {
                    hasMediaAttachment: true,
                    imageMessage: (await conn.prepareWAMessageMedia({ image: { url: thumbnail } }, { upload: conn.waUploadToServer })).imageMessage
                },
                body: { text: ytmsg },
                footer: { text: "© ᴡʜ-ʙᴏᴛ ᴍᴇᴅᴇɪᴀ ᴅᴏᴡɴʟᴏᴅᴇʀ" },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🎥 Normal Video",
                                id: `video_normal_${title}`
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "📄 Video Document",
                                id: `video_doc_${title}`
                            })
                        }
                    ]
                }
            }
        }, { quoted: mek });

        const filter = (msg) =>
            msg.key.remoteJid === from &&
            msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

        const timeout = 60000;

        const listener = async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!filter(msg)) return;

            const selected = msg.message?.extendedTextMessage?.text || 
                             msg.message?.buttonsResponseMessage?.selectedButtonId || "";

            await conn.sendMessage(from, { react: { text: "⬇️", key: msg.key } });

            if (selected.includes("video_normal_") || selected === "1") {
                await conn.sendMessage(from, {
                    video: { url: downloadUrl },
                    mimetype: "video/mp4",
                    caption: `> *🎬 Your video is ready!*`
                }, { quoted: msg });
            } else if (selected.includes("video_doc_") || selected === "2") {
                await conn.sendMessage(from, {
                    document: { url: downloadUrl },
                    mimetype: "video/mp4",
                    fileName: `${title}.mp4`,
                    caption: `> *📄 Your video document is ready!*`
                }, { quoted: msg });
            } else {
                await conn.sendMessage(from, { text: "*❌ Invalid selection or timeout!*" }, { quoted: msg });
            }

            conn.ev.off("messages.upsert", listener);
        };

        conn.ev.on("messages.upsert", listener);
        setTimeout(() => conn.ev.off("messages.upsert", listener), timeout);

    } catch (error) {
        console.error("Video Error:", error);
        reply("❌ Error: " + error.message);
    }
});
