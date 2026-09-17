const config = require('../config');
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require("axios");
const fs = require("fs");


// ================== GOOGLE IMAGE SEARCH COMMAND ===================
Cmd({
  pattern: 'imagesearch',
  alias: ['gimage', 'imgsearch', 'googleimg'],
  react: '🔍',
  desc: 'Search images from Google using SupunOfc API',
  category: 'search',
  filename: __filename
}, async (conn, mek, m, {
  from,
  q,
  command,
  reply
}) => {
  try {
    if (!q) {
      return reply(`*Usage:* .${command} <query>\n\n*Example:* .${command} Cat`);
    }

    await reply('> *🔍 Searching for images...*');

    // API URL with encoded query and API key
    const apiKey = "supun-r10o9fwenuvlggw6qqhdihta";
    const apiUrl = `https://supunofc.site/api/search/google-image-search/search?q=${encodeURIComponent(q)}&apikey=${apiKey}`;

    // Fetching data from the API
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.success || !data.result || data.result.length === 0) {
      return reply("❌ *No images found for your query!*");
    }

    // Getting the first image URL from the result array
    const imageUrl = data.result[0];

    // Send the image to the user
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `📸 *Google Image Search*\n\n🔎 *Query:* ${q}\n\n> *© Powered by Bot*` 
    }, { quoted: mek });

  } catch (error) {
    console.error('Error in Image Search command:', error);
    reply(`*AN ERROR OCCURRED!! MESSAGE :*\n\n> ${error.message}`);
  }
});
