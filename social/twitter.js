import { BitBrowserUtil } from "../browser/bitbrowser.js";
import { getOTP } from "../utils/otp.js";
import { myFormatData } from "../formatdata.js";

export async function twitterLogin(page, username, password, otpSecretKey){
    await page.goto('https://twitter.com/i/flow/login')
    await page.locator('//input[@autocomplete="username"]').fill(username)
    await page.locator('text=/(下一步|next)/i').click()
    await page.locator('//input[@name="password"]').fill(password)
    await page.waitForTimeout(2000)
    await page.getByTestId('controlView').getByTestId('LoginForm_Login_Button').click()
    const otp = await getOTP(otpSecretKey)
    await page.getByTestId("ocfEnterTextTextInput").fill(otp)
    await page.getByTestId('controlView').getByTestId('ocfEnterTextNextButton').click()
}

export async function follow(page, usernames){
    for (const username of usernames) {
        await page.goto(`https://twitter.com/${username}`);
        await page.waitForTimeout(3000); // 等待页面加载完成
        // 查找关注按钮并点击
        const followButton = await page.$(`div[aria-label="Follow @${username}"]`);
        if (followButton) {
            await followButton.click();
            await page.waitForTimeout(3000)
            // console.log(`Followed user: ${followUsername}`);
        }
    }
}

export async function interactionAction(page, url, {isLike=true, isRetweet=true, isReply=false, text=''}={}){
    await page.goto(url)
    if(isLike){
        try{
            // 创建一个定位器
            const tweetLocator = page.getByTestId('like').first();
            // 显式等待元素出现，最长等待 3000 毫秒
            await tweetLocator.waitFor({timeout: 3000 });
            // 点击该元素
            await tweetLocator.click();
            await page.waitForTimeout(2000)
        }catch(error){console.log(error)}
    }
    if(isRetweet){
        try{
            // 创建一个定位器
            let tweetLocator = page.getByTestId('retweet').first();
            // 显式等待元素出现，最长等待 3000 毫秒
            await tweetLocator.waitFor({timeout: 3000 });
            // 点击该元素
            await tweetLocator.click();
            tweetLocator = page.getByTestId('retweetConfirm').first();
            // 显式等待元素出现，最长等待 3000 毫秒
            await tweetLocator.waitFor({timeout: 3000 });
            // 点击该元素
            await tweetLocator.click();
        }catch(error){console.log(error)}
    }
    if(isReply){
        try{
            // 创建一个定位器
            let tweetLocator = page.getByTestId('reply').first();
            // 显式等待元素出现，最长等待 3000 毫秒
            await tweetLocator.waitFor({timeout: 3000 });
            // 点击该元素
            await tweetLocator.click();
            // 创建一个定位器
            tweetLocator = page.locator('//div[@aria-label="Post text"]').first();
            // 显式等待元素出现，最长等待 3000 毫秒
            await tweetLocator.waitFor({timeout: 3000 });
            // 点击该元素
            await tweetLocator.fill(text);
            // 创建一个定位器
            tweetLocator = page.getByTestId('tweetButton').first();
            // 显式等待元素出现，最长等待 3000 毫秒
            await tweetLocator.waitFor({timeout: 3000 });
            // 点击该元素
            await tweetLocator.click();
        }catch(error){console.log(error)}
    }
}

export async function changeProfile(page, {nickname='', bro='', location='', websiteUrl=''}={}){
    await page.goto('https://twitter.com/settings/profile')
    if(nickname != ''){await page.locator('//input[@name="displayName"]').fill(nickname)}
    if(bro != ''){await page.locator('//textarea[@name="description"]').fill(bro)}
    if(location != ''){await page.locator('//input[@name="location"]').fill(location)}
    if(websiteUrl != ''){await page.locator('//input[@name="url"]').fill(websiteUrl)}
    await page.getByTestId('Profile_Save_Button').click()
}