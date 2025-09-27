// index.js
const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    EmbedBuilder, 
    PermissionFlagsBits 
} = require("discord.js");

// ================== CONFIG ==================
const TOKEN = "YOUR_BOT_TOKEN"; // <-- Put your bot token here
const PREFIX = "!";             // <-- Set your prefix
const ALLOWED_USERS = ["702465506501722202"]; // <-- Replace with your Discord ID
// ============================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Listen for commands
client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (["badgemine", "mine", "maxrules"].includes(command)) {
        await handleBadgeMine(client, message, args);
    }
});

// ================== COMMAND LOGIC ==================
async function handleBadgeMine(client, message, args) {
    // Only allow bot owner/specific users
    if (!ALLOWED_USERS.includes(message.author.id)) {
        return message.reply("❌ This command is restricted to bot owners only!");
    }

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply("❌ You need Administrator permission!");
    }

    if (!message.guild.features.includes("COMMUNITY")) {
        return message.reply("❌ Server must be Community-enabled for AutoMod!");
    }

    const botPerms = message.guild.members.me.permissions;
    if (!botPerms.has([PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ModerateMembers])) {
        return message.reply("❌ Bot needs Manage Server and Moderate Members permissions!");
    }

    try {
        await message.reply("🚀 Starting badge mining... Creating maximum AutoMod rules!");
        
        // Clean existing rules first
        await cleanupExistingRules(message.guild);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create maximum rules (10 total)
        const createdRules = await createMaximumRules(message.guild);
        
        const embed = new EmbedBuilder()
            .setTitle("🏆 Badge Mining Complete!")
            .setDescription(`Created **${createdRules.length}/10** maximum AutoMod rules for badge mining`)
            .addFields(
                { name: "Rules Created", value: createdRules.join("\n") },
                { name: "Badge Progress", value: `+${createdRules.length} rules toward AutoMod badge requirement` }
            )
            .setColor(0x00ff00)
            .setFooter({ text: `github: drakenplayz1`, iconURL: message.guild.iconURL() });

        await message.channel.send({ embeds: [embed] });

    } catch (error) {
        console.error("Badge mining error:", error);
        await message.channel.send(`❌ Badge mining failed: ${error.message}`);
    }
}

// ================== HELPERS ==================
async function cleanupExistingRules(guild) {
    const rules = await guild.autoModerationRules.fetch();
    
    for (const rule of rules.values()) {
        try {
            if (rule.triggerType === 5 && guild.features.includes("COMMUNITY")) {
                await rule.edit({ enabled: false });
            } else {
                await rule.delete();
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            // Ignore cleanup errors
        }
    }
}

async function createMaximumRules(guild) {
    const createdRules = [];
    const basicAction = [{ type: 1, metadata: { customMessage: "Blocked by AutoMod" } }];

    try {
        // Same 10 rules you had before...
        await guild.autoModerationRules.create({
            name: "Badge-Profanity",
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 4,
            triggerMetadata: { presets: [1, 2, 3] },
            actions: basicAction
        });
        createdRules.push("✅ Profanity Filter");
        await wait(1000);

        await guild.autoModerationRules.create({
            name: "Badge-Keywords-1",
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 1,
            triggerMetadata: { keywordFilter: ["spam", "scam", "hack", "virus", "malware"] },
            actions: basicAction
        });
        createdRules.push("✅ Keywords Filter #1");
        await wait(1000);

        await guild.autoModerationRules.create({
            name: "Badge-Keywords-2", 
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 1,
            triggerMetadata: { keywordFilter: ["toxic", "troll", "grief", "raid", "nuke"] },
            actions: basicAction
        });
        createdRules.push("✅ Keywords Filter #2");
        await wait(1000);

        await guild.autoModerationRules.create({
            name: "Badge-Links-Social",
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 1,
            triggerMetadata: { keywordFilter: ["*discord.gg*", "*discord.com/invite*", "*instagram.com*", "*twitter.com*", "*tiktok.com*"] },
            actions: basicAction
        });
        createdRules.push("✅ Social Links Filter");
        await wait(1000);

        await guild.autoModerationRules.create({
            name: "Badge-Links-Media",
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 1,
            triggerMetadata: { keywordFilter: ["*youtube.com*", "*youtu.be*", "*twitch.tv*", "*spotify.com*", "*soundcloud.com*"] },
            actions: basicAction
        });
        createdRules.push("✅ Media Links Filter");
        await wait(1000);

        await guild.autoModerationRules.create({
            name: "Badge-Links-Suspicious",
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 1,
            triggerMetadata: { keywordFilter: ["*bit.ly*", "*tinyurl.com*", "*shorturl.at*", "*t.co*", "*rb.gy*"] },
            actions: basicAction
        });
        createdRules.push("✅ Suspicious Links Filter");
        await wait(1000);

        await guild.autoModerationRules.create({
            name: "Badge-Spam",
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 3,
            actions: basicAction
        });
        createdRules.push("✅ Spam Detection");
        await wait(1000);

        await guild.autoModerationRules.create({
            name: "Badge-MentionSpam",
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 5,
            triggerMetadata: { mentionTotalLimit: 5 },
            actions: basicAction
        });
        createdRules.push("✅ Mention Spam Filter");
        await wait(1000);

        await guild.autoModerationRules.create({
            name: "Badge-Keywords-Gaming",
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 1,
            triggerMetadata: { keywordFilter: ["aimbot", "wallhack", "cheat", "crypto", "investment"] },
            actions: basicAction
        });
        createdRules.push("✅ Gaming/Crypto Filter");
        await wait(1000);

        await guild.autoModerationRules.create({
            name: "Badge-Keywords-NSFW",
            creatorId: guild.client.user.id,
            enabled: true,
            eventType: 1,
            triggerType: 1,
            triggerMetadata: { keywordFilter: ["onlyfans", "adult", "nsfw", "porn", "xxx"] },
            actions: basicAction
        });
        createdRules.push("✅ NSFW Content Filter");

    } catch (error) {
        console.error("Error creating rule:", error.message);
    }

    return createdRules;
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ================== START BOT ==================
client.login(TOKEN);
