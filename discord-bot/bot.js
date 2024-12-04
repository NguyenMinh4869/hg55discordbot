const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log('Bot đã sẵn sàng!');
});

async function fetchBattles() {
    try {
        const response = await axios.get('https://east.albionbattles.com/api/battles');
        return response.data; // Giả sử API trả về dữ liệu dưới dạng JSON
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}

client.on('messageCreate', async (message) => {
    if (message.content === '!battles') {
        const battles = await fetchBattles();
        
        // Lọc các trận chiến có tổng số 10 người tham gia
        const filteredBattles = battles.filter(battle => battle.participants.length === 10);
        
        if (filteredBattles.length > 0) {
            const battleDetails = filteredBattles.map(battle => `Trận chiến ID: ${battle.id}, Thời gian: ${battle.time}, Người tham gia: ${battle.participants.length}`).join('\n');
            message.channel.send(`Dữ liệu cuộc đánh:\n${battleDetails}`);
        } else {
            message.channel.send('Không có trận chiến nào với 10 người tham gia.');
        }
    }
});

// Sử dụng biến môi trường để bảo mật token
client.login('MTMxMzgyMDM0NzYyNzQ3NTAxNQ.GQU4lT.z0Bt04x85Me09uMNqo4sung4DCIvfi2P0zVcQk');