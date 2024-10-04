import { BitBrowserUtil } from "../browser/bitbrowser.js";
import { twitterLogin, follow, interactionAction, changeProfile } from "./twitter.js";
import { myFormatData } from "../formatdata.js";

const main = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    // console.log(data)
    for (const d of data) {
        try{
            const bitbrowser = new BitBrowserUtil(d['browser_id'])
            await bitbrowser.start()
            await twitterLogin(bitbrowser.page, d['twitter_username'], d['twitter_password'], d['twitter_otp'])
            // await interactionAction(bitbrowser.page, 'https://twitter.com/BitmapTech/status/1753396016597152172', {isReply:true, text:'great'})
            // await changeProfile(bitbrowser.page, {nickname:`${d['twitter_username']} - Merlin🔮🧙`})
            // await bitbrowser.stop()
        }catch(error){console.log(error)}
    }
});


// await main(5)