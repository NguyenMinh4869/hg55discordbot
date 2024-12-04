const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Thay thế 'YOUR_BOT_TOKEN' bằng token thực tế của bot bạn
const BOT_TOKEN = 'MTMxMzgyMDM0NzYyNzQ3NTAxNQ.GQU4lT.z0Bt04x85Me09uMNqo4sung4DCIvfi2P0zVcQk';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

let lastCheckedBattles = []; // Mảng để lưu trữ trận đánh đã kiểm tra

client.once('ready', () => {
    console.log('Bot đã sẵn sàng!');
    // Bắt đầu kiểm tra trận đánh mới mỗi 60 giây
    setInterval(checkForNewBattles, 60000);
});

// Hàm lấy dữ liệu trận chiến từ API
async function fetchBattles() {
    try {
        const response = await axios.get('https://east.albionbattles.com/api/battles');
        return response.data; // Giả sử API trả về dữ liệu dưới dạng JSON
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}

// Hàm kiểm tra trận đánh mới
async function checkForNewBattles() {
    const battles = await fetchBattles();
    const filteredBattles = battles.filter(battle => battle.participants.length === 10);

    // Kiểm tra xem có trận đánh nào mới không
    const newBattles = filteredBattles.filter(battle => !lastCheckedBattles.includes(battle.id));

    if (newBattles.length > 0) {
        const battleDetails = newBattles.map(battle => `Trận đánh ID: ${battle.id}, Thời gian: ${battle.time}, Người tham gia: ${battle.participants.length}`).join('\n');
        const channel = client.channels.cache.get('936975285050564691'); // Thay thế bằng ID của kênh bạn muốn gửi thông báo
        if (channel) {
            channel.send(`Có trận đánh mới với 10 người tham gia:\n${battleDetails}`);
        }
    }

    // Cập nhật danh sách trận đánh đã kiểm tra
    lastCheckedBattles = [...lastCheckedBattles, ...filteredBattles.map(battle => battle.id)];
}

client.on('messageCreate', async (message) => {
    // Kiểm tra xem tin nhắn không phải từ bot
    if (message.author.bot) return;

    // Kiểm tra nội dung tin nhắn để xác định khi nào bot nên lấy trận đánh
    if (message.content === '!getBattles') {
        console.log('Đang lấy dữ liệu trận đánh có 10 người tham gia...'); // Thông báo khi bắt đầu lấy dữ liệu
        const battles = await fetchBattles();
        
        // Lọc các trận chiến có tổng số 10 người tham gia
        const filteredBattles = battles.filter(battle => battle.participants.length === 10);
        
        if (filteredBattles.length > 0) {
            const battleDetails = filteredBattles.map(battle => `Trận đánh ID: ${battle.id}, Thời gian: ${battle.time}, Người tham gia: ${battle.participants.length}`).join('\n');
            message.channel.send(`Dữ liệu trận đánh có 10 người tham gia:\n${battleDetails}`);
        } else {
            message.channel.send('Không tìm thấy trận đánh nào có 10 người tham gia.');
        }
    }
});

// Đăng nhập vào bot
client.login(BOT_TOKEN);