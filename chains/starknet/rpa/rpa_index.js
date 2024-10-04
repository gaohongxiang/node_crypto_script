import { myFormatData } from "../../../formatdata.js";
import { randomWait } from '../../../utils/utils.js';
import { RPATradeUtil } from "./rpa_trade.js";
import { RPANftUtil } from "./rpa_nft.js";
import { RPALendUtil } from "./rpa_lend.js";
import { RPASendMsgUtil } from "./rpa_sendMsg.js";

const projectInfos = {
    "actions": [
        {
            "name": "rpaApprove",
            "projects": [
                {
                    "name": "rpa10kSwap",
                    "website":"https://10kswap.com/swap",
                    "contractAddress": "0x7a6f98c03379b9513ca84cca1373ff452a7462a3b61598f0af5bb27ad7f76d1"
                },
                {
                    "name": "rpaJediSwap",
                    "website":"https://app.jediswap.xyz/#/swap",
                    "contractAddress": "0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023"
                },
                {
                    "name": "rpaMySwap",
                    "website":"https://www.myswap.xyz/",
                    "contractAddress": "0x10884171baf1914edc28d7afb619b40a4051cfae78a094a55d230f19e944a28"
                },
                {
                    "name": "rpaSithSwap",
                    "website":"https://app.sithswap.com/swap/",
                    "contractAddress": "0x28c858a586fa12123a1ccb337a0a3b369281f91ea00544d0c086524b759f627"
                },
                {
                    "name": "rpaAvnu",
                    "website":"https://app.avnu.fi/en",
                    "contractAddress": "0x4270219d365d6b017231b52e92b3fb5d7c8378b05e9abc97724537a80e93b0f"
                },
                {
                    "name": "starkex",
                    "website":"https://app.starkex.org/",
                    "contractAddress": "0x7ebd0e95dfc4411045f9424d45a0f132d3e40642c38fdfe0febacf78cc95e76"
                },
                {
                    "name": "rpaFibrous",
                    "website":"https://app.fibrous.finance/",
                    "contractAddress": "0x3201e8057a781dca378564b9d3bbe9b5b7617fac4ad9d9deaa1024cf63f877e"
                },
                {
                    "name": "rpaZklend",
                    "website":"https://app.zklend.com/dashboard",
                    "contractAddress": "0x4c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05"
                },
                
            ]
        },
        {
            "name": "rpaTrade",
            "projects": [
                {
                    "name": "rpaJediSwap",
                    "website":"https://app.jediswap.xyz/#/swap"
                },
                // {
                //     "name": "rpa10kSwap",
                //     "website":"https://10kswap.com/swap"
                // },
            ]
        },
        {
            "name": "rpaMintNft",
            "projects": [
                {
                    "name": "starknetId",
                    "website":"https://app.starknet.id/identities"
                },
                {
                    "name": "rpaZksNetwork",
                    "website":"https://zks.network/"
                },
            ]
        },
        {
            "name": "rpaLend",
            "projects": [
                {
                    "name": "rpaZkLend",
                    "website":"https://app.zklend.com/dashboard"
                },
            ]
        },
        {
            "name": "rpaSendMsg",
            "projects": [
                {
                    "name": "rpaDmail",
                    "website":"https://mail.dmail.ai/",
                    "loginWebsite":"https://mail.dmail.ai/login"
                },
            ]
        }
    ]
}

const getProject = (isTest=false, action='rpaLend', project='rpaZkLend')=>{
    // 随机选一个动作。可能是兑换代币，可能是mint nft。。。
    const actions = projectInfos['actions']      
    let randomAction, randomProject
    if(isTest) {
        // 测试新功能。
        for(const actionInfo of actions) {
            if(actionInfo.name === action){
                randomAction = actionInfo
            }
        }
        const projects = randomAction.projects
        for(const projectInfo of projects) {
            if(projectInfo.name === project){
                randomProject = projectInfo
            }
        }
    }else {
        randomAction = actions[Math.floor(Math.random() * actions.length)];
        // 根据randomAction随机选一个项目。比如mute、mav。。。或zksNetwork。。。
        const projects = randomAction.projects
        randomProject = projects[Math.floor(Math.random() * projects.length)];
    }
    console.log('action: ',randomAction.name);console.log('------------------------------------------');console.log('project: ',randomProject.name);
    return { randomAction, randomProject }
}

const main = (async(startNum, endNum=null)=>{
    try {
        // const projectInfos = getInfo(paths.projectFile)
        const data = await myFormatData(startNum, endNum)
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            console.log(`第${d['index_id']}个账号开始执行任务`)
            // console.log(d)
            const { randomAction, randomProject } = getProject()
            // const { randomAction, randomProject } = getProject(true, 'rpaTrade', 'rpaJediSwap')
            if (randomAction.name === 'rpaApprove') {                
                const rpaTrade = new RPATradeUtil(d['browser_id'], d['enPassword']);
                await rpaTrade.start()
                await rpaTrade.rpaApproveToken(randomProject)
                await rpaTrade.stop()
            }else if (randomAction.name === 'rpaTrade') {                
                const rpaTrade = new RPATradeUtil(d['browser_id'], d['enPassword']);
                await rpaTrade.start()
                if(randomProject.name === 'rpaJediSwap') {
                    await rpaTrade.rpaJediSwapToken(randomProject)
                }else if(randomProject.name === 'rpa10kSwap') {
                    await rpaTrade.rpa10kSwapToken(randomProject)
                }
                // await rpaTrade.stop()
            }else if (randomAction.name === 'rpaMintNft') {                
                const rpaNft = new RPANftUtil(d['browser_id'], d['enPassword']);
                await rpaNft.start()
                if(randomProject.name === 'starknetId') {
                    await rpaNft.starknetId(randomProject)
                }
                await rpaNft.stop()
            }else if (randomAction.name === 'rpaLend') {
                const rpaLend = new RPALendUtil(d['browser_id'], d['enPassword']);
                await rpaLend.start()
                if(randomProject.name === 'rpaZkLend') {
                    const { randomProject: randomTradeProject } = getProject(true, 'rpaTrade', 'rpaJediSwap' )
                    // console.log(randomTradeProject)
                    await rpaLend.rpaZkLend(randomProject, randomTradeProject)
                }
                // await rpaLend.stop()
            }else if (randomAction.name === 'rpaSendMsg') {
                const rpaSendMsg = new RPASendMsgUtil(d['browser_id'], d['enPassword']);
                await rpaSendMsg.start()
                if(randomProject.name === 'rpaDmail') {
                    await rpaSendMsg.rpaDmail(randomProject, d['gmail'])
                }
                await rpaSendMsg.stop()
            }  
            // 当数组长度大于1并且不是最后一个元素时随机等待（范围0-maxSeconds）
            if(data.length > 1 && i< data.length-1){
                await randomWait(1800,7200)
            }
        }
    }catch(error){console.log(error)}
});

await main(19,20);