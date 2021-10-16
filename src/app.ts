import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';
import moment from 'moment';

const clientID = '4fqgr33qhg1epc4kguxuou8oak79gm';
const clientSecret = '8tii9nlbvr1iaznpi093260qclr2i5';

export class MainTest {

    tokenData:any = null;
    authProvider:any = null;
    apiClient:any = null;
    chatClient:ChatClient|null = null;
    channels = ['feigurice', 'noobbotmaster', 'eythoreli'];

    constructor() {

    }

    async startup() {
        this.tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf8'));
        this.authProvider = new RefreshingAuthProvider(
            {
                clientId: clientID,
                clientSecret,
                onRefresh: async newTokenData => await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf8')
            },
            this.tokenData
        );
        this.apiClient = new ApiClient({ authProvider: this.authProvider });
        this.chatClient = new ChatClient({ authProvider: this.authProvider, channels: this.channels });    
        this.chatClient.connect();
        this.chatClient.onJoin(async (channel, user) => {
            const options = {
                lastSent: moment().toISOString()
            }
            var self = this;
            var name = channel.substring(1);
            setInterval(async () => {
                const u = await this.apiClient.users.getUserByName(name);
                console.log(`Checking if ${name} is online`);
                if(await u.getStream() !== null) {
                    if(moment().isAfter(moment(options.lastSent))) {
                        console.log(`Sending noob to ${user}`);
                        this.chatClient?.say(name, 'Noooob!!!');
                        options.lastSent = moment().add(1, 'hour').toISOString();
                    } else {
                        console.log(`Already sent noob to ${name} in the last hour`);
                    }
                } else {
                    console.log(`${name} is not online!`);
                }
            }, 1000 * 60);
        })

    }

    async isStreamLive(userName: string) {
        const user = await this.apiClient.users.getUserByName(userName);
        if (!user) {
            return false;
        }
        return await user.getStream() !== null;
    }

}

const main = async() => {
    const cl = new MainTest();
    await cl.startup();
}

main();