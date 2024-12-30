const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

async function fetchBattleData() {
    try {
        const response = await axios.get('https://api-east.albionbattles.com/battles?plyAmount=0&offset=0&search=');
        console.log('API Response:', response.data); // Log the response to inspect it
        return response.data;
    } catch (error) {
        console.error('Error fetching battle data:', error);
        return null;
    }
}

client.on('messageCreate', async (message) => {
    if (message.content === '!battle') {
        const battleData = await fetchBattleData();
        if (battleData && Array.isArray(battleData.docs)) {
            const filteredBattles = battleData.docs.filter(battle => battle.players.list.length === 10);

            if (filteredBattles.length > 0) {
                // Create a message for each filtered battle
                const battleMessages = filteredBattles.map((battle, index) => {
                    return `Battle ${index + 1}:
                    ID: ${battle.id}
                    Start Time: ${new Date(battle.startTime).toLocaleString()}
                    End Time: ${new Date(battle.endTime).toLocaleString()}
                    Total Fame: ${battle.totalFame}
                    Total Kills: ${battle.totalKills}
                    Players: ${battle.players.list.join(', ')}
                    Alliances: ${battle.alliances.list.join(', ')}`;
                }).join('\n\n');

                message.channel.send(`Here are the battles with 10 players:\n${battleMessages}`);
            } else {
                message.channel.send('No battles with exactly 10 players found.');
            }
        } else {
            message.channel.send('Unexpected response format from API.');
        }
    }
});
client.login('MTMxMzgyMDM0NzYyNzQ3NTAxNQ.GQU4lT.z0Bt04x85Me09uMNqo4sung4DCIvfi2P0zVcQk');