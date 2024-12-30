const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent // Đảm bảo intent này đã được bật trong Developer Portal
    ] 
});

const BATTLE_API_URL = 'https://gameinfo.albiononline.com/api/gameinfo/battles';

client.once('ready', () => {
    console.log('Bot đã sẵn sàng!');
});

client.on('messageCreate', async (message) => {
    if (message.content === '!battles') {
        try {
            const response = await axios.get(`${BATTLE_API_URL}?range=week&limit=10`);
            const battles = response.data;

            let battleInfo = 'Thông tin trận đấu:\n';
            battles.forEach(battle => {
                battleInfo += `- Trận đấu ID: ${battle.id}, Tổng Fame: ${battle.totalFame}, Tổng Kills: ${battle.totalKills}\n`;
            });

            message.channel.send(battleInfo);
        } catch (error) {
            console.error(error);
            message.channel.send('Đã xảy ra lỗi khi lấy thông tin trận đấu.');
        }
    }
});

client.login('MTMxMzgyMDM0NzYyNzQ3NTAxNQ.GQU4lT.z0Bt04x85Me09uMNqo4sung4DCIvfi2P0zVcQk');