const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

const API_BASE_URL = "https://supunofc.site/api/search/happymod/search";
const API_KEY = "supun-r10o9fwenuvlggw6qqhdihta";

// Helper function to check URL and safe values (like in your Aptoide code)
const isHttpUrl = (string) => {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
};

const safe = (val, fallback) => val ? val : fallback;

cmd(
  {
    pattern: "happymod",
    alias: ["hm", "apksearch"],
    desc: "Search and download APKs from HappyMod",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("❌ Please provide an app name.");

      await reply("🔍 *Searching HappyMod, please wait...*");

      const apiUrl = `${API_BASE_URL}?q=${encodeURIComponent(q)}&apikey=${API_KEY}`;
      const { data } = await axios.get(apiUrl);

      // Check response structure based on HappyMod API JSON
      const list = data?.result?.result;
      if (!Array.isArray(list) || list.length === 0) {
        return reply("⚠️ No results found.");
      }

      // Limit results to top 10 items for the menu
      const results = list.slice(0, 10);

      let menuText = `📦 *HAPPYMOD SEARCH MENU* 📦\n\n`;
      menuText += `🔎 *Query:* ${q}\n`;
      menuText += `📊 *Total Found:* ${data?.result?.total || results.length}\n\n`;

      results.forEach((item, index) => {
          menuText += `*${index + 1} ||* 📱 ${safe(item.title, "Unknown App")}\n\n`;
      });

      menuText += `_Reply with the number (1 to ${results.length}) to download the app._\n\n`;
      menuText += `> *© ᴡʜ-ʙᴏᴛ ᴍᴇᴅᴇɪᴀ ᴅᴏᴡɴʟᴏᴅᴇʀ*`;

      const sentMsg = await conn.sendMessage(
          from,
          { text: menuText },
          { quoted: mek }
      );

      // Reply listener for interactive menu selection
      const filter = (msg) =>
          msg.key.remoteJid === from &&
          msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

      const timeout = 60000; // 60 seconds timeout

      const listener = async (msgUpdate) => {
          const msg = msgUpdate.messages[0];
          if (!filter(msg)) return;

          const selectedText = msg.message.extendedTextMessage.text.trim();
          const selectedIndex = parseInt(selectedText) - 1;

          if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= results.length) {
              await conn.sendMessage(from, { text: "⚠️ Invalid selection. Please reply with a valid number." }, { quoted: msg });
              return;
          }

          const app = results[selectedIndex];

          await conn.sendMessage(from, { react: { text: "⬇️", key: msg.key } });

          const caption = `📦 *Name:* ${safe(app?.title, "-")}\n🔗 *Link:* ${safe(app?.url, "-")}`;

          if (isHttpUrl(app?.thumbnail)) {
              await conn.sendMessage(
                  from,
                  { image: { url: app.thumbnail }, caption },
                  { quoted: mek }
              );
          } else {
              await reply(caption);
          }

          // Note: HappyMod search API returns a webpage URL, not a direct .apk file path.
          // If you have a separate HappyMod download API to get the direct file link, 
          // you can pass `app.url` to it and send it as a document just like your Aptoide code.

          conn.ev.off("messages.upsert", listener);
      };

      conn.ev.on("messages.upsert", listener);
      setTimeout(() => conn.ev.off("messages.upsert", listener), timeout);

    } catch (e) {
      console.error("happymod:", e);
      reply("❌ Error fetching app from HappyMod.");
    }
  }
);
