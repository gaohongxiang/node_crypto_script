import { authenticator } from 'otplib';

/**
 * 生成一次性密码（OTP）并等待一段时间后重新生成。
 * @param {string} otpSecretKey - 用于生成OTP的密钥。
 * @param {number} waitTime - 等待时间（秒），如果密码的剩余有效时间小于等于此时间，则重新生成密码。
 * @returns {Promise<string>} 返回生成的一次性密码。
 */
export async function getOTP(otpSecretKey, waitTime = 3) {
    while (true) {
        // 生成一次性密码（基于时间）
        const otp = await authenticator.generate(otpSecretKey);
        const remainingTimeInSeconds = authenticator.timeRemaining();
        
        if (remainingTimeInSeconds > waitTime) {
            console.log(otp)
            return otp; // 返回生成的一次性密码
        }
    
        console.log(`等待 ${remainingTimeInSeconds} 秒后重新生成密码...`);
        await new Promise(resolve => setTimeout(resolve, (remainingTimeInSeconds + 1) * 1000));
    }
}

// await getOTP('W4BM77lkSJ7KPWQA')
