
import { BitBrowserUtil } from './bitbrowser.js';
import { decryptText } from '../crypt_module/crypt_text.js';
import { parseToken } from '../crypt_module/onepassword.js';
import { fuelPassword } from '../config.js';

export class MagicEdenUtil extends BitBrowserUtil {
    constructor(browserId) {
        super(browserId);
        this.importUrl = 'chrome-extension://afhdgmajabalcgkhkjmbhmnpppknnkbb/onboarding.html'
        this.unlockUrl = 'chrome-extension://afhdgmajabalcgkhkjmbhmnpppknnkbb/popup.html'
    }

    async import(enMnemonic){
        try{
            const mnemonic = await decryptText(enMnemonic)
            const mnemonics = mnemonic.split(' ')
            const password = await parseToken(fuelPassword)
            await this.page.goto(this.importUrl)
            await this.page.getByText('I Have A Wallet').click()
            await this.page.getByTestId('mnemonic-word-0').fill(mnemonics[0])
            await this.page.getByTestId('mnemonic-word-1').fill(mnemonics[1])
            await this.page.getByTestId('mnemonic-word-2').fill(mnemonics[2])
            await this.page.getByTestId('mnemonic-word-3').fill(mnemonics[3])
            await this.page.getByTestId('mnemonic-word-4').fill(mnemonics[4])
            await this.page.getByTestId('mnemonic-word-5').fill(mnemonics[5])
            await this.page.getByTestId('mnemonic-word-6').fill(mnemonics[6])
            await this.page.getByTestId('mnemonic-word-7').fill(mnemonics[7])
            await this.page.getByTestId('mnemonic-word-8').fill(mnemonics[8])
            await this.page.getByTestId('mnemonic-word-9').fill(mnemonics[9])
            await this.page.getByTestId('mnemonic-word-10').fill(mnemonics[10])
            await this.page.getByTestId('mnemonic-word-11').fill(mnemonics[11])
           
            await this.page.getByTestId('confirm-seed-phrase').click()
            await this.page.getByPlaceholder('Enter a unique password').fill(password)
            await this.page.getByTestId('confirm-password').click()
            await this.page.getByPlaceholder('Enter the password again').fill(password)
            await this.page.getByTestId('confirm-password').click()
            await this.page.getByText('Restore Wallet Now').click()
            await this.page.locator('//*[@id="root"]/div/div/div[2]/div/div[2]/div[1]').click()            
        }catch(error){console.log(error)}
    }

    async unlock(){
        try{
            const password = await parseToken(fuelPassword)
            await this.page.goto(this.unlockUrl)
            const status = await this.isElementExist('//input[@placeholder="Enter password"]')
            // console.log(status)
            if(status){
                await this.page.getByPlaceholder('Enter password').fill(password)
                await this.page.getByTestId('unlock-button').click()
            }
        }catch(error){console.log(error)}
    }
}