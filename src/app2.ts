import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider, StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';

const clientID = '4fqgr33qhg1epc4kguxuou8oak79gm';
const clientAccess = '1g8o0joj9zeg2fwqz50ee557vk4dvh';
const refreshToken = 'eyJfaWQmNzMtNGCJ9%6VFV5LNrZFUj8oU231/3Aj';
const clientSecret = 'vlez5ifkaaa7zdbsz1gbyjjvwh6b9b';


// inside the async function again

async function main() {
    const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf8'));
    const authProvider = new RefreshingAuthProvider(
        {
            clientId: clientID,
            clientSecret,
            onRefresh: async newTokenData => await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf8')
        },
        tokenData
    );
    const api  = new ApiClient({authProvider: new StaticAuthProvider(clientID, tokenData.accessToken)});
	  const chatClient = new ChatClient({ authProvider, channels: ['noobbotmaster'] });
    await chatClient.connect();
    chatClient.onMessage((channel, user, message) => {
        if (message === '!ping') {
            chatClient.say(channel, 'Pong!');
        } else if (message === '!dice') {
            const diceRoll = Math.floor(Math.random() * 6) + 1;
            chatClient.say(channel, `@${user} rolled a ${diceRoll}`)
        }
    });

    const isLive = await api.streams.getStreamByUserName('noobbotmaster');
    console.log(isLive);
}

main();