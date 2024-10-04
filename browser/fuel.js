
import { BitBrowserUtil } from './bitbrowser.js';
import { decryptText } from '../crypt_module/crypt_text.js';
import { parseToken } from '../crypt_module/onepassword.js';
import { fuelPassword } from '../config.js';

export class FuelUtil extends BitBrowserUtil {
    constructor(browserId) {
        super(browserId);
        this.importUrl = 'chrome-extension://ffcplebkajhbcfailgelmlcdmnbiiime/index.html#/sign-up/welcome'
    }

    async import(enMnemonic){
        try{
            const mnemonic = await decryptText(enMnemonic)
            const mnemonics = mnemonic.split(' ')
            const password = await parseToken(fuelPassword)

            await this.page.goto(this.importUrl)
            await this.page.getByText('Import seed phrase').click()
            await this.page.locator('#agreeTerms').click()
            await this.page.getByText('Next: Seed Phrase').click()
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[1]/div/input').fill(mnemonics[0])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[2]/div/input').fill(mnemonics[1])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[3]/div/input').fill(mnemonics[2])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[4]/div/input').fill(mnemonics[3])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[5]/div/input').fill(mnemonics[4])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[6]/div/input').fill(mnemonics[5])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[7]/div/input').fill(mnemonics[6])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[8]/div/input').fill(mnemonics[7])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[9]/div/input').fill(mnemonics[8])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[10]/div/input').fill(mnemonics[9])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[11]/div/input').fill(mnemonics[10])
            await this.page.locator('//*[@id="root"]/main/div/div/div[3]/div[1]/div/div[2]/div[12]/div/input').fill(mnemonics[11])

            await this.page.getByText('Next: Your password').click()
            await this.page.getByPlaceholder('Type your password').fill(password)
            await this.page.getByPlaceholder('Confirm your password').fill(password)

            await this.page.getByText('Next: Finish set-up').click()
            
        }catch(error){console.log(error)}
    }
}