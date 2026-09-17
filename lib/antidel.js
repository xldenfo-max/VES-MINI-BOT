const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

// ============================================================
// 📝 Restore Deleted TEXT (Clean Style)
// ============================================================
const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    const messageContent =
        mek.message?.conversation ||
        mek.message?.extendedTextMessage?.text ||
        'Unknown content';

    const formattedText = `
*MESSAGE RESTORED*
${deleteInfo}

*Content:* 
${messageContent}
`;

    await conn.sendMessage(
        jid,
        {
            text: formattedText,
            contextInfo: {
                mentionedJid: isGroup
                    ? [update.key.participant, mek.key.participant]
                    : [update.key.remoteJid],
            },
        },
        { quoted: mek }
    );
};

// ============================================================
// 🎞️ Restore Deleted MEDIA (Clean Style)
// ============================================================
const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
    const clonedMsg = structuredClone(mek.message);
    const type = Object.keys(clonedMsg)[0];

    if (clonedMsg[type]) {
        clonedMsg[type].contextInfo = {
            stanzaId: mek.key.id,
            participant: mek.sender,
            quotedMessage: mek.message,
        };
    }

    if (type === 'imageMessage' || type === 'videoMessage') {
        clonedMsg[type].caption = `
*MEDIA RESTORED*
${deleteInfo}
`;
    } else if (type === 'audioMessage' || type === 'documentMessage') {
        await conn.sendMessage(
            jid,
            {
                text: `
*FILE RESTORED*
${deleteInfo}
`,
            },
            { quoted: mek }
        );
    }

    await conn.relayMessage(jid, clonedMsg, {});
};

// ============================================================
// 🔄 Main Anti-Delete Controller
// ============================================================
const AntiDelete = async (conn, updates) => {
    for (const update of updates) {
        if (update.update.message === null) {
            const store = await loadMessage(update.key.id);
            if (!store || !store.message) continue;

            const mek = store.message;
            const isGroup = isJidGroup(store.jid);

            const antiDeleteEnabled = await getAnti();
            if (!antiDeleteEnabled) return;

            const deleteTime = new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            let deleteInfo;
            let jid;

            // ===================================
            // 🟦 GROUP DELETE
            // ===================================
            if (isGroup) {
                const meta = await conn.groupMetadata(store.jid);
                const groupName = meta.subject;
                const sender = mek.key.participant?.split('@')[0];
                const deleter = update.key.participant?.split('@')[0];

                deleteInfo = `
Group: ${groupName}
Sender: @${sender}
Deleted By: @${deleter}
Time: ${deleteTime}`;

                jid = config.ANTI_DEL_PATH === 'inbox' ? conn.user.id : store.jid;
            }

            // ===================================
            // 🟩 PRIVATE DELETE
            // ===================================
            else {
                const sender = mek.key.remoteJid?.split('@')[0];

                deleteInfo = `
Sender: @${sender}
Time: ${deleteTime}`;

                jid =
                    config.ANTI_DEL_PATH === 'inbox'
                        ? conn.user.id
                        : update.key.remoteJid;
            }

            // ===================================
            // 🔵 TEXT & MEDIA ROUTING
            // ===================================
            if (
                mek.message?.conversation ||
                mek.message?.extendedTextMessage?.text
            ) {
                await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
            } else {
                await DeletedMedia(conn, mek, jid, deleteInfo);
            }
        }
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
};
