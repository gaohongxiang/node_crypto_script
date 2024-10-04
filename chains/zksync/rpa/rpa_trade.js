import { MetaMaskUtil } from "../../../browser/metamask.js";

export class RPATradeUtil extends MetaMaskUtil {

    constructor(browserId, enPassword) {
        super(browserId, enPassword);
    }

    async selectTokenPair(projectName, tokens, {fromTokenEle, fromTokenInputEle, toTokenEle, searchSelector, searchTokenSelector}) {
        try{
            // searchTokenSelector不用了。有更好的方法了。逐步改掉
            let fromToken, toToken, value;
            // 确定fromToken
            while(true){
                fromToken = tokens[Math.floor(Math.random() * tokens.length)];
                console.log(`fromToken: ${fromToken}`)
                const fromTokenText = await fromTokenEle.textContent()
                console.log(`fromTokenText: ${fromTokenText}`)
                if (fromTokenText != fromToken){
                    fromTokenEle.click()
                    await this.page.waitForTimeout(100)
                    // 当项目为rpaSpaceFi，代币为ETH时，不用搜索，直接选下面的。因为搜索了反而没有ETH了，有点傻逼
                    if(fromToken !== 'ETH' || !['rpaSpaceFi'].includes(projectName)){
                        await this.page.getByPlaceholder(searchSelector).fill(fromToken)
                    }
                    await this.page.waitForTimeout(100)
                    const tokenEle = await this.page.$$(`text=/(^${fromToken}$)/i`)
                    // console.log(tokenEle.length)
                    if(tokenEle.length === 1) {
                        await tokenEle[0].click()
                    }else{
                        await tokenEle[1].click()
                    }
                    // await this.page.locator(searchTokenSelector).getByText(fromToken, { exact: true }).click()
                    await this.page.waitForTimeout(100)
                    await this.page.click('body', { position: {  x: 50, y: 300 } });  
                }
                await this.page.waitForTimeout(100)
                await this.page.locator('text=/(^MAX$|^100%$)/').click()
                await this.page.waitForTimeout(1000)
                value = await fromTokenInputEle.getAttribute('value')
                console.log(`value: ${value}`) // type:string
                const valueNumber = Number(value);
                if (valueNumber) {
                    break;
                }
            }
            // 避免兑换出去太多代币
            if(fromToken === 'ETH') {
                if (value > '0.003') {
                    value = 0.003
                    value = `${(Math.random() * (value - 0.001) + 0.001).toFixed(3)}`; // 随机选择0.001-0.008之间的一个数
                }
                await fromTokenInputEle.fill(value)
            }else{
                value = `${(Math.random() * (Number(value) - 1) + 1).toFixed(3)}`
                await fromTokenInputEle.fill(value)
            }
            console.log(`value: ${value}`) // type:string

            // 确定toToken
            while(true){
                toToken = tokens[Math.floor(Math.random() * tokens.length)];
                if(toToken != fromToken) {break}
            }
            await this.page.waitForTimeout(100)
            const toTokenText = await toTokenEle.textContent()
            if (toTokenText != toToken){
                await toTokenEle.click()
                // 当项目为rpaSpaceFi，代币为ETH时，不用搜索，直接选下面的。因为搜索了反而没有ETH了，有点傻逼
                if(toToken !== 'ETH' || !['rpaSpaceFi'].includes(projectName)){
                    await this.page.getByPlaceholder(searchSelector).fill(toToken)
                }
                await this.page.waitForTimeout(500)
                await this.page.locator(searchTokenSelector).getByText(toToken, { exact: true }).click()
            }
            // 随便点一个地方。izumi需要
            await this.page.click('body', { position: {  x: 50, y: 300 } });  
            await this.page.waitForTimeout(5000)
            return { fromToken, toToken, value }
        }catch(error){console.log(error)}
    }

    async rpaSyncApproveToken(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛', hasNavigator:true, navigatorButton:'//p[text()="Welcome to SyncSwap"]/../../../div[1]/div'})
            const tokens = ['USDC', 'ceBUSD', 'USD+', 'zkUSD', 'OT', 'MAV', 'TES']
            const fromTokenEle = await this.page.locator('//input[@class="swap-input"][1]/following-sibling::button').nth(0)
            const fromTokenInputEle = await this.page.locator('//input[@class="swap-input"][1]').nth(0)
            const searchSelector = 'Search name or paste address'
            // #toolbox + div 表示选择 ID 为 #toolbox 的元素后的下一个 <div> 同级元素。
            const searchTokenSelector = '#toolbox + div'
            // 确定fromToken
            const fromToken = tokens[Math.floor(Math.random() * tokens.length)];
            console.log(`fromToken: ${fromToken}`)
            const fromTokenText = await fromTokenEle.textContent()
            console.log(`fromTokenText: ${fromTokenText}`)
            if (fromTokenText != fromToken){
                fromTokenEle.click()
                await this.page.waitForTimeout(100)
                await this.page.getByPlaceholder(searchSelector).fill(fromToken)
                await this.page.waitForTimeout(100)
                const tokenEle = await this.page.$$(`text=/(^${fromToken}$)/i`)
                // console.log(tokenEle.length)
                if(tokenEle.length === 1) {
                    await tokenEle[0].click()
                }else{
                    await tokenEle[1].click()
                }    
            }
            await this.page.waitForTimeout(100)
            await this.page.click('body', { position: {  x: 50, y: 300 } });  
            await this.page.waitForTimeout(100)

            const value = `${(Math.random() * (10 - 1) + 1).toFixed(3)}`
            await fromTokenInputEle.fill(value)

            // approve
            if (fromToken != 'ETH') {
                await this.approve(`text=/(^Unlock ${fromToken}$)/i`, value, { canEditGas:false, hasCheckPage:true })
            }
        }catch(error){console.log(error)}
    }

    /**
     * 随机选择一组from/to代币，兑换from代币的25%
     * 
     */
    async rpaSyncSwapToken(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛', hasNavigator:true, navigatorButton:'//p[text()="Welcome to SyncSwap"]/../../../div[1]/div'})

            const tokens = ['ETH', 'USDC', 'USDT', 'LUSD']
            const fromTokenEle = await this.page.locator('//input[@class="swap-input"][1]/following-sibling::button').nth(0)
            const toTokenEle = await this.page.locator('//input[@class="swap-input"][1]/following-sibling::button').nth(1)
            const fromTokenInputEle = await this.page.locator('//input[@class="swap-input"][1]').nth(0)
            const searchSelector = 'Search name or paste address'
            // #toolbox + div 表示选择 ID 为 #toolbox 的元素后的下一个 <div> 同级元素。
            const searchTokenSelector = '#toolbox + div'
            const { fromToken, toToken, value } = await this.selectTokenPair(projectInfo.name, tokens, {
                fromTokenEle:fromTokenEle, 
                fromTokenInputEle:fromTokenInputEle, 
                toTokenEle:toTokenEle, 
                searchSelector:searchSelector,
                searchTokenSelector:searchTokenSelector})

            // approve
            if (fromToken != 'ETH') {
                await this.approve(`text=/(^Unlock ${fromToken}$)/i`, value, {canEditGas:false, hasCheckPage:true })
            }

            // swap
            await this.executeTransaction('text=/(^Swap$)/i', { canEditGas:false })
        }catch(error){console.log(error)}
    }

    async rpaMavSwapToken(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛', checkButton:`label.items-center`})

            const tokens = [{'ETH':'ETH'}, {'USDC':'0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'}, {'LUSD':'0x503234F203fC7Eb888EEC8513210612a43Cf6115'}]
            let fromToken, fromTokenAddress, toToken, toTokenAddress, value;
            const fromTokenInputEle = await this.page.locator('//input[@placeholder="0"]')

            while(true) {
                const fromTokenInfo = tokens[Math.floor(Math.random() * tokens.length)];
                fromToken = Object.keys(fromTokenInfo)[0];
                fromTokenAddress = Object.values(fromTokenInfo)[0];
                while(true){
                    const toTokenInfo = tokens[Math.floor(Math.random() * tokens.length)];
                    toToken = Object.keys(toTokenInfo)[0];
                    toTokenAddress = Object.values(toTokenInfo)[0];
                    if(toToken != fromToken) {break}
                }
                await this.page.goto(`${projectInfo.website}?chain=324&tokenA=${fromTokenAddress}&tokenB=${toTokenAddress}`)
                await this.page.waitForTimeout(15000)
                await this.page.locator('text=/(^MAX$)/').click()
                value = await fromTokenInputEle.getAttribute('value')
                console.log(`value: ${value}`) // type:string
                if (value) {
                    break;
                }
            }
            // 避免兑换出去太多代币
            if(fromToken === 'ETH') {
                if (value > '0.008') {
                    value = 0.008
                    value = `${(Math.random() * (value - 0.001) + 0.001).toFixed(3)}`; // 随机选择0.001-0.008之间的一个数
                }
                await fromTokenInputEle.fill(value)
            }else{
                value = `${(Math.random() * (Number(value) - 1) + 1).toFixed(3)}`
                await fromTokenInputEle.fill(value)
            }
            console.log(`value: ${value}`) // type:string
            
            await this.page.waitForTimeout(6000)
            await this.page.locator(`text=/(^Swap ${fromToken} to ${toToken}  $)/`).click()
            await this.page.waitForTimeout(6000)
            
            // approve
            if (fromToken != 'ETH') {
                await this.approve(`text=/(^Approve ${fromToken}$)/`, value, {gasLimitRate:0.6 })
            }
            await this.page.waitForTimeout(2000)
            // swap
            await this.executeTransaction('text=/(^Confirm Swap$)/', { gasLimitRate:0.6 })
        }catch(error){console.log(error)}
    }

    async rpaIzumiApproveToken(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛'})

            const tokens = ['USDC', 'iUSD', 'MAV', 'iZi', 'BUSD', 'OT', 'ZKUSD']
            const fromTokenEle = await this.page.locator('//*[@id="root"]/div/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/div[1]/div/div[1]/div/div/div')
            const toTokenEle = await this.page.locator('//*[@id="root"]/div/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/div[3]/div/div[1]/div/div')
            const fromTokenInputEle = await this.page.locator('//*[@id="root"]/div/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/div[1]/div/div[2]/div/div/div[1]/div/input')
            const searchSelector = 'Enter name or paste address'
            // #toolbox + div 表示选择 ID 为 #toolbox 的元素后的下一个 <div> 同级元素。
            const searchTokenSelector = '//*[text()="Select a Token"]/../following-sibling::div/div/div[2]'

            // toToken为USDC时无法将fromToken置为USDC，很傻，ui有bug。先把它换成别的
            const initToTokenText = await toTokenEle.textContent()
            console.log(initToTokenText)

            if( initToTokenText === 'USDC'){
                await toTokenEle.click()
                await this.page.waitForTimeout(100)
                await this.page.getByPlaceholder('Enter name or paste address').fill('iZi')
                await this.page.waitForTimeout(500)
                await this.page.locator('//*[text()="Select a Token"]/../following-sibling::div/div/div[2]').getByText('iZi').click()                
            }

            // 确定fromToken
            const fromToken = tokens[Math.floor(Math.random() * tokens.length)];
            console.log(`fromToken: ${fromToken}`)
            const fromTokenText = await fromTokenEle.textContent()
            console.log(`fromTokenText: ${fromTokenText}`)
            if (fromTokenText != fromToken){
                fromTokenEle.click()
                await this.page.waitForTimeout(100)
                await this.page.getByPlaceholder(searchSelector).fill(fromToken)
                await this.page.waitForTimeout(100)
                await this.page.locator(searchTokenSelector).getByText(fromToken, { exact: true }).click()
            }
            await this.page.waitForTimeout(100)
            
            const value = `${(Math.random() * (10 - 1) + 1).toFixed(3)}`
            await fromTokenInputEle.fill(value)
            await this.page.waitForTimeout(100)
            await this.page.click('body', { position: {  x: 50, y: 300 } });  
            await this.page.waitForTimeout(2000)
            // approve
            if (fromToken != 'ETH') {
                await this.approve(`text=/(^Approve ${fromToken}$)/`, value, { gasLimitRate:0.6 })
            }
        }catch(error){console.log(error)}
    }

    async rpaIzumiSwapToken(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛'})

            const tokens = ['ETH', 'USDC', 'iUSD']
            const fromTokenEle = await this.page.locator('//*[@id="root"]/div/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/div[1]/div/div[1]/div/div/div')
            const toTokenEle = await this.page.locator('//*[@id="root"]/div/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/div[3]/div/div[1]/div/div')
            const fromTokenInputEle = await this.page.locator('//*[@id="root"]/div/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/div[1]/div/div[2]/div/div/div[1]/div/input')
            const searchSelector = 'Enter name or paste address'
            // #toolbox + div 表示选择 ID 为 #toolbox 的元素后的下一个 <div> 同级元素。
            const searchTokenSelector = '//*[text()="Select a Token"]/../following-sibling::div/div/div[2]'

            // toToken为USDC时无法将fromToken置为USDC，很傻，ui有bug。先把它换成别的
            const initToTokenText = await toTokenEle.textContent()
            console.log(initToTokenText)

            if( initToTokenText === 'USDC'){
                await toTokenEle.click()
                await this.page.waitForTimeout(100)
                await this.page.getByPlaceholder('Enter name or paste address').fill('iZi')
                await this.page.waitForTimeout(500)
                await this.page.locator('//*[text()="Select a Token"]/../following-sibling::div/div/div[2]').getByText('iZi').click()                
            }

            const { fromToken, toToken, value } = await this.selectTokenPair(projectInfo.name, tokens, {
                fromTokenEle:fromTokenEle, 
                fromTokenInputEle:fromTokenInputEle, 
                toTokenEle:toTokenEle, 
                searchSelector:searchSelector,
                searchTokenSelector:searchTokenSelector})

            // approve
            if (fromToken != 'ETH') {
                await this.approve(`text=/(^Approve ${fromToken}$)/`, value, { gasLimitRate:0.6 })
            }

            // swap
            await this.executeTransaction('text=/(^swap$)/', { gasLimitRate:0.6 })
        }catch(error){console.log(error)}
    }

    async rpaSpaceFiSwapToken(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛'})
            
            const tokens = ['ETH', 'USDC', 'USDT', 'LUSD']
            const fromTokenEle = await this.page.locator('//input[@title="Token Amount"][1]/following-sibling::button[2]')
            // const fromTokenEle = await this.page.locator('//input[@title="Token Amount"]').nth(1).locator('following-sibling::button[2]')
            const toTokenEle = await this.page.locator('//input[@title="Token Amount"][2]/following-sibling::button')
            const fromTokenInputEle = await this.page.locator('//input[@title="Token Amount"]').nth(1)
            // const fromTokenInputEle = await this.page.locator('//div[text()="From"]/../../../following-sibling::div[2]/input')
            const searchSelector = 'Search name or paste address'
            // #toolbox + div 表示选择 ID 为 #toolbox 的元素后的下一个 <div> 同级元素。
            // const searchTokenSelector = '//*[text()="Select a token"]/../../following-sibling::div[2]/div/div'
            const searchTokenSelector = '//input[@id="token-search-input"]/../following-sibling::div[2]/div/div'

            const { fromToken, toToken, value } = await this.selectTokenPair(projectInfo.name, tokens, {
                fromTokenEle:fromTokenEle, 
                fromTokenInputEle:fromTokenInputEle, 
                toTokenEle:toTokenEle, 
                searchSelector:searchSelector,
                searchTokenSelector:searchTokenSelector})

            // approve
            if (fromToken != 'ETH') {
                await this.approve(`text=/(^Approve ${fromToken}$)/i`, value)
            }

            // swap
            await this.executeTransaction(projectInfo.name, 'text=/(^Swap$)/i')
        }catch(error){console.log(error)}
    }

    async rpaVelocoreSwapToken(projectInfo, gasLimitRate=0.5) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛'})
            
            const tokens = ['ETH', 'USDC']
            const fromTokenEle = await this.page.locator('//input[@placeholder="0.00"]/../../preceding-sibling::div').nth(0)
            const toTokenEle = await this.page.locator('//input[@placeholder="0.00"]/../../preceding-sibling::div').nth(1)
            const fromTokenInputEle = await this.page.locator('//input[@placeholder="0.00"]').nth(0)
            const fromTokenText = await this.page.locator('div.symbol').nth(0).textContent()
            const toTokenText = await this.page.locator('div.symbol').nth(1).textContent()
            // const fromTokenInputEle = await this.page.locator('//div[text()="From"]/../../../following-sibling::div[2]/input')
            const searchSelector = 'ETH, VC, 0x...'
            // #toolbox + div 表示选择 ID 为 #toolbox 的元素后的下一个 <div> 同级元素。
            // const searchTokenSelector = '//*[text()="Select a token"]/../../following-sibling::div[2]/div/div'
            const searchTokenSelector = '//input[@id="token-search-input"]/../following-sibling::div[2]/div/div'

            // console.log(toTokenText)
            // process.exit()
            let fromToken, toToken, value;
            // 确定fromToken
            while(true){
                fromToken = tokens[Math.floor(Math.random() * tokens.length)];
                console.log(`fromToken: ${fromToken}`)
                console.log(`fromTokenText: ${fromTokenText}`)
                if (fromTokenText != fromToken){
                    fromTokenEle.click()
                    await this.page.waitForTimeout(100)
                    await this.page.getByPlaceholder(searchSelector).fill(fromToken)
                    await this.page.waitForTimeout(1000)
                    const tokenEle = await this.page.$$(`text=/(^${fromToken}$)/i`)
                    console.log(tokenEle.length)
                    if(tokenEle.length === 1) {
                        await tokenEle[0].click()
                    }else{
                        await tokenEle[1].click()
                    }                
                }
                await this.page.waitForTimeout(100)
                await this.page.locator('div.inside-button').nth(0).click() // MAX
                await this.page.waitForTimeout(1000)
                value = await fromTokenInputEle.getAttribute('value')
                console.log(`value: ${value}`) // type:string
                if (value) {
                    break;
                }
            }
            // 避免兑换出去太多代币
            if(fromToken === 'ETH') {
                if (value > '0.008') {
                    value = 0.008
                    value = `${(Math.random() * (value - 0.001) + 0.001).toFixed(3)}`; // 随机选择0.001-0.008之间的一个数
                }
                await fromTokenInputEle.fill(value)
            }else{
                value = `${(Math.random() * (Number(value) - 1) + 1).toFixed(3)}`
                await fromTokenInputEle.fill(value)
            }
            console.log(`value: ${value}`) // type:string

            // 确定toToken
            while(true){
                toToken = tokens[Math.floor(Math.random() * tokens.length)];
                if(toToken != fromToken) {break}
            }
            await this.page.waitForTimeout(100)
            console.log(`toToken: ${toToken}`)
            console.log(`toTokenText: ${toTokenText}`)
            if (toTokenText != toToken){
                toTokenEle.click()
                await this.page.getByPlaceholder(searchSelector).fill(toToken)
                await this.page.waitForTimeout(1000)
                const tokenEle = await this.page.$$(`text=/(^${toToken}$)/i`)
                console.log(tokenEle.length)
                if(tokenEle.length === 1) {
                    await tokenEle[0].click()
                }else{
                    await tokenEle[1].click()
                }      
            }
            await this.page.waitForTimeout(5000)


            if (fromToken != 'ETH') {
                try{
                    await this.page.waitForTimeout(1000)
                    await this.page.waitForSelector('//p[text()="Swap"]', {timeout:5000}).then(element => { element.click() });
                    await this.page.waitForTimeout(2000)
                    const metamaskPage = await this.page.context().newPage()
                    await metamaskPage.goto(this.homeUrl, {wait_until:'networkidle', timeout:10000})
                    await this.page.waitForTimeout(8000)
                    await metamaskPage.reload()
                    value = (Number(value) * 1.1).toFixed(3).toString()
                    // console.log(value)
                    // console.log(typeof(value))
                    await metamaskPage.locator('#custom-spending-cap').fill(value)
                    await metamaskPage.waitForTimeout(2000)
                    await metamaskPage.waitForSelector('text=/(^下一步$|^next$)/i', {timeout:10000}).then(element => { element.click() });
                    // 修改gas limit。设置为推荐的gasLimitRate倍

                    try{
                        await metamaskPage.waitForTimeout(1000)
                        await metamaskPage.locator('//button[text()="编辑"]').nth(1).click() // 编辑
                        await metamaskPage.locator('//a[text()="编辑"]').click() // 编辑
                        let gasLimit = await metamaskPage.getByTestId('gas-limit-input').getAttribute('value')
                        await metamaskPage.waitForTimeout(500)
                        gasLimit = Math.floor(gasLimit * gasLimitRate).toString()
                        await metamaskPage.getByTestId('gas-limit-input').fill(gasLimit)
                        await metamaskPage.waitForTimeout(1000)
                        await metamaskPage.locator('text=/(^保存$)/').click() // 保存
                        await metamaskPage.waitForTimeout(1000)
                    }catch(error){console.log(error)}
                    await metamaskPage.waitForSelector('text=/(^批准$|^approve$)/i', {timeout:10000}).then(element => { element.click() });
                    // 等待授权完成
                    await metamaskPage.waitForTimeout(15000)
                    await metamaskPage.reload()
                    try{
                        await metamaskPage.waitForTimeout(1000)
                        await metamaskPage.waitForSelector('text=/(^建议的网站$)/', {timeout:6000}).then(element => { element.click() }); // 建议的网站
                        await metamaskPage.locator('//span[text()="高级"]').click() // 高级
                        await metamaskPage.locator('//a[text()="编辑"]').click() // 编辑
                        let gasLimit = await metamaskPage.getByTestId('gas-limit-input').getAttribute('value')
                        gasLimit = Math.round(gasLimit * gasLimitRate).toString()
                        await metamaskPage.waitForTimeout(500)
                        await metamaskPage.getByTestId('gas-limit-input').fill(gasLimit)
                        await metamaskPage.waitForTimeout(500)
                        await metamaskPage.locator('text=/(^保存$)/').click() // 保存
                        await metamaskPage.waitForTimeout(500)
                    }catch(error){console.log(error)}

                    await metamaskPage.locator('text=/(^确认$)/').click()
                    // 等待确认
                    await this.page.waitForTimeout(10000)
                    await metamaskPage.close()
                }catch(error){
                    console.log(error)
                }
            }else{
                // swap
                // await this.executeTransaction('//p[text()="Swap"]')
                try{
                    await this.page.waitForTimeout(3000)
                    await this.page.waitForSelector('//p[text()="Swap"]', {timeout:10000}).then(element => { element.click() });
                    await this.page.waitForTimeout(1000)
                    const metamaskPage = await this.context.newPage()
                    await metamaskPage.goto(this.homeUrl, {wait_until:'networkidle', timeout:10000})
                    await metamaskPage.waitForTimeout(8000)
                    await metamaskPage.reload()
                    // 修改gas limit。设置为推荐的gasLimitRate倍。两种页面。
                    try{
                        await metamaskPage.waitForTimeout(1000)
                        await metamaskPage.waitForSelector('text=/(^建议的网站$)/', {timeout:6000}).then(element => { element.click() }); // 建议的网站
                        await metamaskPage.locator('//span[text()="高级"]').click() // 高级
                        await metamaskPage.locator('//a[text()="编辑"]').click() // 编辑
                        let gasLimit = await metamaskPage.getByTestId('gas-limit-input').getAttribute('value')
                        gasLimit = Math.round(gasLimit * gasLimitRate).toString()
                        await metamaskPage.waitForTimeout(500)
                        await metamaskPage.getByTestId('gas-limit-input').fill(gasLimit)
                        await metamaskPage.waitForTimeout(500)
                        await metamaskPage.locator('text=/(^保存$)/').click() // 保存
                        await metamaskPage.waitForTimeout(500)
                    }catch(error){console.log(error)}
                    await metamaskPage.locator('text=/(^确认$)/').click()
                    // 等待确认
                    await this.page.waitForTimeout(10000)
                    await metamaskPage.close()
                }catch(error){console.log(error)}
            }
        }catch(error){console.log(error)}
    }

    async rpaVesyncSwapToken(projectInfo, gasLimitRate=0.5) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛', connectButton:'text=/(^Connect Wallet$)/'})
            
            const tokens = ['ETH', 'USDC', 'USDT', 'LUSD']
            const fromTokenEle = await this.page.locator('//input[@placeholder="0.00"]/../../../preceding-sibling::div').nth(0)
            const toTokenEle = await this.page.locator('//input[@placeholder="0.00"]/../../../preceding-sibling::div').nth(1)
            const fromTokenInputEle = await this.page.locator('//input[@placeholder="0.00"]').nth(0)
            const fromTokenText = await this.page.locator('//input[@placeholder="0.00"]/../../following-sibling::p').nth(0).textContent()
            const toTokenText = await this.page.locator('//input[@placeholder="0.00"]/../../following-sibling::p').nth(1).textContent()
            const searchSelector = 'ETH, VS, 0x...'

            // console.log(toTokenText)
            // process.exit()
            let fromToken, toToken, value;
            // 确定fromToken
            while(true){
                fromToken = tokens[Math.floor(Math.random() * tokens.length)];
                console.log(`fromToken: ${fromToken}`)
                console.log(`fromTokenText: ${fromTokenText}`)
                if (fromTokenText != fromToken){
                    fromTokenEle.click()
                    await this.page.waitForTimeout(100)
                    await this.page.getByPlaceholder(searchSelector).fill(fromToken)
                    await this.page.waitForTimeout(1000)
                    const tokenEle = await this.page.$$(`text=/(^${fromToken}$)/i`)
                    console.log(tokenEle.length)
                    // console.log(typeof(tokenEle.length))
                    if(tokenEle.length === 1) {
                        await tokenEle[0].click()
                    }else{
                        await tokenEle[1].click()
                    }                
                }
                await this.page.waitForTimeout(100)
                await this.page.locator('text=/(^Max$)/i').click() // MAX
                await this.page.waitForTimeout(1000)
                value = await fromTokenInputEle.getAttribute('value')
                console.log(`value: ${value}`) // type:string
                if (value) {
                    break;
                }
            }
            // 避免兑换出去太多代币
            if(fromToken === 'ETH') {
                if (value > '0.008') {
                    value = 0.008
                    value = `${(Math.random() * (value - 0.001) + 0.001).toFixed(3)}`; // 随机选择0.001-0.008之间的一个数
                }
                await fromTokenInputEle.fill(value)
            }else{
                value = `${(Math.random() * (Number(value) - 1) + 1).toFixed(3)}`
                await fromTokenInputEle.fill(value)
            }
            console.log(`value: ${value}`) // type:string

            // 确定toToken
            while(true){
                toToken = tokens[Math.floor(Math.random() * tokens.length)];
                if(toToken != fromToken) {break}
            }
            await this.page.waitForTimeout(100)
            console.log(`toToken: ${toToken}`)
            console.log(`toTokenText: ${toTokenText}`)
            if (toTokenText != toToken){
                toTokenEle.click()
                await this.page.getByPlaceholder(searchSelector).fill(toToken)
                await this.page.waitForTimeout(1000)
                const tokenEle = await this.page.$$(`text=/(^${toToken}$)/i`)
                console.log(tokenEle.length)
                // console.log(typeof(tokenEle.length))
                if(tokenEle.length === 1) {
                    await tokenEle[0].click()
                }else{
                    await tokenEle[1].click()
                }      
            }
            await this.page.waitForTimeout(5000)


            if (fromToken != 'ETH') {
                try{
                    await this.page.waitForTimeout(1000)
                    await this.page.waitForSelector('//p[text()="Swap"]', {timeout:5000}).then(element => { element.click() });
                    await this.page.waitForTimeout(2000)
                    const metamaskPage = await this.page.context().newPage()
                    await metamaskPage.goto(this.homeUrl, {wait_until:'networkidle', timeout:10000})
                    await this.page.waitForTimeout(8000)
                    await metamaskPage.reload()
                    value = (Number(value) * 1.1).toFixed(3).toString()
                    // console.log(value)
                    // console.log(typeof(value))
                    await metamaskPage.locator('#custom-spending-cap').fill(value)
                    await metamaskPage.waitForTimeout(2000)
                    await metamaskPage.waitForSelector('text=/(^下一步$|^next$)/i', {timeout:10000}).then(element => { element.click() });
                    // 修改gas limit。设置为推荐的gasLimitRate倍

                    try{
                        await metamaskPage.waitForTimeout(1000)
                        await metamaskPage.locator('//button[text()="编辑"]').nth(1).click() // 编辑
                        await metamaskPage.locator('//a[text()="编辑"]').click() // 编辑
                        let gasLimit = await metamaskPage.getByTestId('gas-limit-input').getAttribute('value')
                        await metamaskPage.waitForTimeout(500)
                        gasLimit = Math.floor(gasLimit * gasLimitRate).toString()
                        await metamaskPage.getByTestId('gas-limit-input').fill(gasLimit)
                        await metamaskPage.waitForTimeout(1000)
                        await metamaskPage.locator('text=/(^保存$)/').click() // 保存
                        await metamaskPage.waitForTimeout(1000)
                    }catch(error){console.log(error)}
                    await metamaskPage.waitForSelector('text=/(^批准$|^approve$)/i', {timeout:10000}).then(element => { element.click() });
                    // 等待授权完成
                    await metamaskPage.waitForTimeout(15000)
                    await metamaskPage.reload()
                    try{
                        await metamaskPage.waitForTimeout(1000)
                        await metamaskPage.waitForSelector('text=/(^建议的网站$)/', {timeout:6000}).then(element => { element.click() }); // 建议的网站
                        await metamaskPage.locator('//span[text()="高级"]').click() // 高级
                        await metamaskPage.locator('//a[text()="编辑"]').click() // 编辑
                        let gasLimit = await metamaskPage.getByTestId('gas-limit-input').getAttribute('value')
                        gasLimit = Math.round(gasLimit * gasLimitRate).toString()
                        await metamaskPage.waitForTimeout(500)
                        await metamaskPage.getByTestId('gas-limit-input').fill(gasLimit)
                        await metamaskPage.waitForTimeout(500)
                        await metamaskPage.locator('text=/(^保存$)/').click() // 保存
                        await metamaskPage.waitForTimeout(500)
                    }catch(error){console.log(error)}

                    await metamaskPage.locator('text=/(^确认$)/').click()
                    // 等待确认
                    await this.page.waitForTimeout(10000)
                    await metamaskPage.close()
                }catch(error){
                    console.log(error)
                }
            }else{
                // swap
                // await this.executeTransaction('//p[text()="Swap"]')
                try{
                    await this.page.waitForTimeout(3000)
                    await this.page.waitForSelector('//p[text()="Swap"]', {timeout:10000}).then(element => { element.click() });
                    await this.page.waitForTimeout(1000)
                    const metamaskPage = await this.context.newPage()
                    await metamaskPage.goto(this.homeUrl, {wait_until:'networkidle', timeout:10000})
                    await metamaskPage.waitForTimeout(8000)
                    await metamaskPage.reload()
                    // 修改gas limit。设置为推荐的gasLimitRate倍。两种页面。
                    try{
                        await metamaskPage.waitForTimeout(1000)
                        await metamaskPage.waitForSelector('text=/(^建议的网站$)/', {timeout:6000}).then(element => { element.click() }); // 建议的网站
                        await metamaskPage.locator('//span[text()="高级"]').click() // 高级
                        await metamaskPage.locator('//a[text()="编辑"]').click() // 编辑
                        let gasLimit = await metamaskPage.getByTestId('gas-limit-input').getAttribute('value')
                        gasLimit = Math.round(gasLimit * gasLimitRate).toString()
                        await metamaskPage.waitForTimeout(500)
                        await metamaskPage.getByTestId('gas-limit-input').fill(gasLimit)
                        await metamaskPage.waitForTimeout(500)
                        await metamaskPage.locator('text=/(^保存$)/').click() // 保存
                        await metamaskPage.waitForTimeout(500)
                    }catch(error){console.log(error)}
                    await metamaskPage.locator('text=/(^确认$)/').click()
                    // 等待确认
                    await this.page.waitForTimeout(10000)
                    await metamaskPage.close()
                }catch(error){console.log(error)}
            }
        }catch(error){console.log(error)}
    }
}

// const RPATrade = new RPATradeUtil('c04784d64e1742cab2f1329c3a8ee898');
// await RPATrade.rpaSyncSwapToken()

