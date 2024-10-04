import { myFormatData } from "../../../formatdata.js";
import { randomWait } from '../../../utils/utils.js';
import { RPATradeUtil } from "./rpa_trade.js";
import { RPANftUtil } from "./rpa_nft.js";
import { RPALendUtil } from "./rpa_lend.js";
import { RPASendMsgUtil } from "./rpa_sendMsg.js";
import { bitbrowserUrl } from "../../../paths.js"; 
import axios from 'axios';

const projectInfos = {
    "actions": [
        {
            "name": "rpaApprove",
            "projects": [
                {
                    "name": "rpaSync",
                    "website":"https://syncswap.xyz"
                },
                {
                    "name": "rpaIzumi",
                    // "website":"https://zksync.izumi.finance/swap",
                    "website":"https://zksync-legacy.izumi.finance/swap",
                },
            ]
        },
        {
            "name": "rpaTrade",
            "projects": [
                {
                    "name": "rpaSync",
                    "website":"https://syncswap.xyz",
                    "contractAddress": "0x981F198286E40F9979274E0876636E9144B8FB8E"

                },
                {
                    "name": "rpaMav",
                    "website":"https://app.mav.xyz/"
                },
                {
                    "name": "rpaIzumi",
                    "website":"https://zksync.izumi.finance/swap"
                },
                {
                    "name": "rpaVelocore",
                    "website":"https://app.velocore.xyz/swap"
                },
                {
                    "name": "rpaVesync",
                    "website":"https://app.vesync.finance/swap"
                },
                // {
                //     "name": "rpaSpaceFi",
                //     "website":"https://swap-zksync.spacefi.io/#/swap"
                // },  
            ]
        },
        {
            "name": "rpaMintNft",
            "projects": [
                // {
                //     "name": "rpaZksNetwork",
                //     "website":"https://zks.network/"
                // },
                {
                    "name": "rpaL2telegraph",
                    "sendMessageWebsite":"https://l2telegraph.xyz/",
                    "bridgeNftWebsite":"https://l2telegraph.xyz/bridge/",
                    "bridgeTokenWebsite":"https://l2telegraph.xyz/bridgetokens/"
                },
                // {
                //     "name": "rpaMerkly",
                //     "website":"https://race.cryptomaze.app/"
                // },
                // {
                //     "name": "rpaRace",
                //     "website":"https://race.cryptomaze.app/"
                // },
            ]
        },
        // {
        //     "name": "rpaLend",
        //     "projects": [
        //         {
        //             "name": "rpaEraLend",
        //             "website":"https://app.eralend.com/"
        //         },
        //         // {
        //         //     "name": "rpaReactor",
        //         //     "website":"https://main.reactorfusion.xyz/"
        //         // }
        //     ]
        // }
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

const getProject = (isTest=false, action='rpaSendMsg', project='rpaDmail')=>{
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

const main = (async(startNum, endNum=null, {maxTaskNum=5} = {})=>{
    try {
        // const projectInfos = getInfo(paths.projectFile)
        const data = await myFormatData(startNum, endNum)
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            // console.log(d)
            const randomTaskNum = Math.floor(Math.random() * maxTaskNum) + 1;
            console.log(`第${d['index_id']}个账号开始执行任务,将获得${randomTaskNum}条tx`)

            for (let j = 0; j < randomTaskNum; j++) {
                const { randomAction, randomProject } = getProject()
                if (randomAction.name === 'rpaApprove') {
                    const rpaApprove = new RPATradeUtil(d['browser_id'], d['enPassword']);
                    await rpaApprove.start()
                    const maxApprveTaskNum = 5
                    const randomApproveTaskNum = Math.floor(Math.random() * maxApprveTaskNum) + 1;
                    for (let k = 0; k < randomApproveTaskNum; k++) {
                        const projects = randomAction.projects
                        const randomProject = projects[Math.floor(Math.random() * projects.length)];
                        if(randomProject.name === 'rpaSync') {
                            await rpaApprove.rpaSyncApproveToken(randomProject)
                        }else if(randomProject.name === 'rpaIzumi') {
                            await rpaApprove.rpaIzumiApproveToken(randomProject)
                        }
                        // 当数组长度大于1并且不是最后一个元素时随机等待（范围0-maxSeconds）
                        if(randomApproveTaskNum > 1 && k< randomApproveTaskNum-1){
                            await randomWait(300)
                        }
                    }
                    // await rpaApprove.stop()
                }else if (randomAction.name === 'rpaTrade') {                
                    const rpaTrade = new RPATradeUtil(d['browser_id'], d['enPassword']);
                    await rpaTrade.start()
                    if(randomProject.name === 'rpaSync') {
                        await rpaTrade.rpaSyncSwapToken(randomProject)
                    }else if(randomProject.name === 'rpaMav') {
                        await rpaTrade.rpaMavSwapToken(randomProject)
                    }else if(randomProject.name === 'rpaIzumi') {
                        await rpaTrade.rpaIzumiSwapToken(randomProject)
                    }else if(randomProject.name === 'rpaSpaceFi') {
                        await rpaTrade.rpaSpaceFiSwapToken(randomProject)
                    }else if(randomProject.name === 'rpaVelocore') {
                        await rpaTrade.rpaVelocoreSwapToken(randomProject)
                    }else if(randomProject.name === 'rpaVesync') {
                        await rpaTrade.rpaVesyncSwapToken(randomProject)
                    }
                    // await rpaTrade.stop()
                }else if (randomAction.name === 'rpaMintNft') {                
                    const rpaNft = new RPANftUtil(d['browser_id'], d['enPassword']);
                    await rpaNft.start()
                    if(randomProject.name === 'rpaZksNetwork') {
                        await rpaNft.rpaZksNetworkMintDomain(randomProject)
                    }else if(randomProject.name === 'rpaL2telegraph') {
                        await rpaNft.rpaL2telegraph(randomProject)
                    }else if(randomProject.name === 'rpaRace') {
                        await rpaNft.rpaRace(randomProject)
                    }
                    // await rpaNft.stop()
                } else if (randomAction.name === 'rpaLend') {
                    const rpaLend = new RPALendUtil(d['browser_id'], d['enPassword']);
                    await rpaLend.start()
                    if(randomProject.name === 'rpaEraLend') {
                        await rpaLend.rpaEraLend(randomProject)
                        // await rpaLend.rpaEraWithdraw(randomProject)
                    }
                    // await rpaLend.stop()
                } else if (randomAction.name === 'rpaSendMsg') {
                    const rpaSendMsg = new RPASendMsgUtil(d['browser_id'], d['enPassword']);
                    await rpaSendMsg.start()
                    if(randomProject.name === 'rpaDmail') {
                        await rpaSendMsg.rpaDmail(randomProject, d['gmail'])
                    }
                    // await rpaSendMsg.stop()
                }
                // 当数组长度大于1并且不是最后一个元素时随机等待（范围0-maxSeconds）
                if(randomTaskNum > 1 && j< randomTaskNum-1){
                    await randomWait(300,1200)
                }
                // 关闭浏览器
                await axios.post(`${bitbrowserUrl}/browser/close`, {id: d['browser_id']});

            }
            // 当数组长度大于1并且不是最后一个元素时随机等待（范围0-maxSeconds）
            if(data.length > 1 && i< data.length-1){
                await randomWait(1800,7200)
            }
        }
    }catch(error){console.log(error)}
});

await main(25,30);