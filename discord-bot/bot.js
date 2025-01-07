const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const keepAlive = require('./server');
// Token và ID kênh Discord
const BOT_TOKEN = 'MTMxMzgyMDM0NzYyNzQ3NTAxNQ.GQU4lT.z0Bt04x85Me09uMNqo4sung4DCIvfi2P0zVcQk';
const CHANNEL_ID = '1323245373971763310';

// Tạo client Discord với quyền hạn cần thiết
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Mảng để lưu trữ các battle.id đã được gửi
const sentBattles = new Set();

// Khi bot sẵn sàng
client.once('ready', () => {
    console.log(`✅ Created By:marconguyen/Bot has successfully logged in with the name: ${client.user.tag}!`);
    scheduleBattleUpdates();
});


// Hàm lấy danh sách trận chiến từ API
async function fetchBattleData() {
    try {
        const response = await axios.get('https://api-east.albionbattles.com/battles?plyAmount=0&offset=0&search=');
        const battleList = response.data.docs;

        // Lọc các trận có đúng 10 người chơi
        const filteredBattles = battleList.filter(battle =>
            Array.isArray(battle.players?.list) && battle.players.list.length === 10
        );

        return filteredBattles;
    } catch (error) {
        console.error('❌ Error calling the battle list API:', error.message);
        return [];
    }
}

// Hàm lấy chi tiết trận chiến bằng ID
async function fetchBattleDetails(battleId) {
    try {
        const response = await axios.get(`https://api-east.albionbattles.com/battles/${battleId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error calling battle details API with ID ${battleId}:`, error.message);
        return null;
    }
}

// Hàm gửi thông tin trận chiến tới kênh Discord
async function sendBattleUpdates() {
    const battles = await fetchBattleData();

    if (battles.length === 0) {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send('⚠️ Created By:marconguyen/There are currently no battles with a total player count of 10.');
        }
        console.log('⚠️Created By:marconguyen/ There are no battles with a total number of players of 10.');
        return;
    }

    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) {
        console.error('❌ No channel found with ID:', CHANNEL_ID);
        return;
    }

    for (const battle of battles) {
        // Kiểm tra nếu trận chiến đã được gửi trước đó
        if (sentBattles.has(battle.id)) {
            continue;
        }

        const details = await fetchBattleDetails(battle.id);
        if (!details) continue;

        // Chỉ hiển thị nếu tổng kills >= 5
        if (battle.totalKills < 5) {
            continue;
        }

        // Xử lý chi tiết các pha tiêu diệt
        const killDetails = details.kills.slice(0, 10).map((kill, idx) => {
            const killerName = kill.Killer?.Name || 'unknown';
            const victimName = kill.Victim?.Name || 'unknown';
            const killerWeapon = kill.Killer?.Equipment?.MainHand?.Type || 'unknown';
            const victimWeapon = kill.Victim?.Equipment?.MainHand?.Type || 'unknown';
            return `🔪: ${killerName} (WEAPON: :${killerWeapon}:) ⚔️ ${victimName} (WEAPON: :${victimWeapon}:)`;
        }).join('\n');

        // Gửi thông tin lên Discord
        const message = `**HellGate 5vs5 Battle Log Created By:marconguyen**
        🆔 **Link**: https://east.albionbattles.com/battles/${battle.id}
        🕒 **Time (UTC)**: ${new Date(battle.startTime).toLocaleString()}
        ⚔️ **Total kills**: ${battle.totalKills}
        👥 **Player**: ${battle.players.list.join(', ')}
        🩸 **Detail**:\n${killDetails || 'no kills.'}`;

        channel.send(message);

        // Lưu battle.id vào bộ nhớ để tránh lặp lại
        sentBattles.add(battle.id);
    }
}

// Lập lịch gửi cập nhật trận chiến mỗi 3 phút
function scheduleBattleUpdates() {
    setInterval(sendBattleUpdates, 180000); // 3 phút
}

keepAlive();
// Đăng nhập bot
client.login(BOT_TOKEN);
