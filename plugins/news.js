const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');
const { fetchJson } = require('../lib/functions');

const apilink = 'https://dawn-grass-c6ff.isirainduwara18.workers.dev';
let wm = '> *© ᴠᴇꜱ ᴜʟᴛʀᴀ ᴍɪɴɪ ʙᴏᴛ*';
let latestNews = {};
let newsIntervals = {}; // Group-wise news interval storage
let alertEnabledGroups = {}; // Group-wise alert status

async function checkAndSendNews(conn, from) {
    try {
        const response = await fetchJson(apilink);
        if (!response || !response.success || !Array.isArray(response.news) || response.news.length === 0) {
            return;
        }

        // Loop through news array from the new API
        for (const news of response.news) {
            try {
                if (!news || !news.title) continue;

                const newTitle = news.title;

                // Avoid sending duplicate news for the group
                if (latestNews[`${from}_${newTitle}`]) continue;

                latestNews[`${from}_${newTitle}`] = true;

                const msg = `*📰 ${news.title}*\n\n📂 *Category:* ${news.category || 'General'}\n\n${news.description || ''}\n\n🔗 ${news.url || ''}\n\n${wm}`;

                // Send news with image
                await conn.sendMessage(from, {
                    image: { url: news.image || 'https://via.placeholder.com/500' },
                    caption: msg
                });

                // Alert tagging for breaking news
                if (alertEnabledGroups[from]) {
                    const groupMetadata = await conn.groupMetadata(from);
                    const admins = groupMetadata.participants.filter(p => p.admin !== null).map(a => `@${a.id.split('@')[0]}`);
                    const alertMsg = `🚨 *BREAKING NEWS!* 🚨\n\n${msg}\n\n${admins.join(' ')}`;
                    await conn.sendMessage(from, { text: alertMsg, mentions: admins });
                }
            } catch (err) {
                console.error(`❌ Error sending news item to ${from}:`, err.message);
            }
        }
    } catch (e) {
        console.error("❌ Global error in checkAndSendNews:", e);
    }
}

// Enable Auto News
cmd({
    pattern: "newson",
    alias: ["autonews"],
    react: "🟢",
    desc: "Enable auto news sending",
    category: "news",
    use: '.newson',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ *This command can only be used in Groups!*");

    if (newsIntervals[from]) return reply("✅ *Auto News already enabled in this group!*");

    reply("✅ *Auto News enabled for this group.*");

    // Fetch immediately on enable
    checkAndSendNews(conn, from);

    newsIntervals[from] = setInterval(() => {
        checkAndSendNews(conn, from);
    }, 2 * 60 * 1000); // Check every 2 minutes
});

// Disable Auto News
cmd({
    pattern: "newsoff",
    alias: ["stopnews"],
    react: "🔴",
    desc: "Disable auto news sending",
    category: "news",
    use: '.newsoff',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ *This command can only be used in Groups!*");

    if (newsIntervals[from]) {
        clearInterval(newsIntervals[from]);
        delete newsIntervals[from];
        reply("🛑 *Auto News disabled for this group.*");
    } else {
        reply("❌ *Auto News was not enabled in this group!*");
    }
});

// Enable Alerts
cmd({
    pattern: "alerton",
    alias: ["newsalerton"],
    react: "🚨",
    desc: "Enable Breaking News Alerts",
    category: "news",
    use: '.alerton',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ *This command can only be used in Groups!*");

    alertEnabledGroups[from] = true;
    reply("✅ *Breaking News Alerts enabled for this group.*");
});

// Disable Alerts
cmd({
    pattern: "alertoff",
    alias: ["newsalertoff"],
    react: "❌",
    desc: "Disable Breaking News Alerts",
    category: "news",
    use: '.alertoff',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ *This command can only be used in Groups!*");

    alertEnabledGroups[from] = false;
    reply("🛑 *Breaking News Alerts disabled for this group.*");
});

// News Status Check
cmd({
    pattern: "newsstatus",
    react: "📊",
    desc: "Check auto news status in the group",
    category: "news",
    use: '.newsstatus',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ *This command can only be used in Groups!*");

    const isAutoNewsActive = !!newsIntervals[from];
    const isAlertActive = !!alertEnabledGroups[from];

    let statusMsg = `📊 *NEWS STATUS FOR THIS GROUP* 📊\n\n`;
    statusMsg += `> Auto News: ${isAutoNewsActive ? "✅ Enabled" : "❌ Disabled"}\n`;
    statusMsg += `> Breaking Alerts: ${isAlertActive ? "✅ Enabled" : "❌ Disabled"}\n\n`;
    statusMsg += `${wm}`;

    reply(statusMsg);
});
