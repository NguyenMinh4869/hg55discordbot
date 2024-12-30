const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

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

// Khi bot sẵn sàng
client.once('ready', () => {
    console.log(`✅ Bot đã đăng nhập thành công với tên: ${client.user.tag}!`);
    scheduleBattleUpdates();
});

// Hàm lấy danh sách trận chiến từ API
async function fetchBattleData() {
    try {
        const response = await axios.get('https://api-east.albionbattles.com/battles?plyAmount=0&offset=0&search=');
        return response.data;
    } catch (error) {
        console.error('❌ Lỗi khi gọi API danh sách trận chiến:', error.message);
        return null;
    }
}

// Hàm lấy chi tiết trận chiến bằng ID
async function fetchBattleDetails(battleId) {
    try {
        const response = await axios.get(`https://api-east.albionbattles.com/battles/${battleId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Lỗi khi gọi API chi tiết trận chiến với ID ${battleId}:`, error.message);
        return null;
    }
}

// Hàm gửi thông tin trận chiến tới kênh Discord
async function sendBattleUpdates() {
    const battleData = await fetchBattleData();

    if (battleData && Array.isArray(battleData.docs)) {
        const filteredBattles = battleData.docs.filter(battle =>
            Array.isArray(battle.players?.list) && battle.players.list.length === 10
        );

        if (filteredBattles.length > 0) {
            const battleMessages = await Promise.all(filteredBattles.map(async (battle, index) => {
                const battleDetails = await fetchBattleDetails(battle.id);
                if (!battleDetails || !Array.isArray(battleDetails.kills)) return '';

                // Xử lý danh sách chi tiết các pha tiêu diệt
                const killDetails = battleDetails.kills.map((kill, idx) => {
                    const killerName = kill.Killer?.Name || 'Không rõ';
                    const victimName = kill.Victim?.Name || 'Không rõ';
                    const killerWeapon = kill.Killer?.Equipment?.MainHand?.Type || 'Không rõ';

                    return `🔪 **Kill ${idx + 1}**: ${killerName} (vũ khí: ${killerWeapon}) ➡️ ${victimName}`;
                }).join('\n');

                return `**Trận chiến ${index + 1}**
                - 🆔 ID: ${battle.id}
                - 🕒 Thời gian bắt đầu: ${new Date(battle.startTime).toLocaleString()}
                - ⚔️ Tổng số kills: ${battle.totalKills}
                - 👥 Người chơi: ${battle.players.list.join(', ')}
                - 🩸 Chi tiết kills:\n${killDetails}`;
            }));

            const channel = client.channels.cache.get(CHANNEL_ID);
            if (channel) {
                channel.send(`🔍 **Danh sách các trận chiến có 10 người chơi:**\n${battleMessages.filter(Boolean).join('\n\n')}`);
            } else {
                console.error('❌ Không tìm thấy kênh với ID:', CHANNEL_ID);
            }
        } else {
            console.log('⚠️ Không có trận chiến nào có đúng 10 người chơi.');
        }
    } else {
        console.log('❌ Dữ liệu trả về từ API không đúng định dạng.');
    }
}

// Lập lịch gửi cập nhật trận chiến mỗi 3 phút
function scheduleBattleUpdates() {
    setInterval(sendBattleUpdates, 60000); // 3 phút
}

// Đăng nhập bot
client.login(BOT_TOKEN);
