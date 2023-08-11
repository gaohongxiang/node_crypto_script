import { exec } from "child_process";
import fs from 'fs';

async function parseFile(file) {
  const template = fs.readFileSync(file, 'utf8');
  const opInject = `op inject`;

  return new Promise((resolve, reject) => {
    const child = exec(opInject, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(new Error(`1Password CLI error: ${stderr}`));
        return;
      }

      const data = JSON.parse(stdout);
      resolve(data);
    });

    child.stdin.write(template);
    child.stdin.end();
  });
}

async function parseToken(tokenPath) {
    const opRead = `op read ${tokenPath}`;
    return new Promise((resolve, reject) => {
        exec(opRead, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) {
                reject(new Error(`1Password CLI error: ${stderr}`));
                return;
            }

            const token = stdout.trim();
            // 保存 Personal Access Token 到环境变量
            // process.env.KEY = token; 
            // console.log(process.env.KEY)
            resolve(token);
        });
    });
}

// (async function () {
//   try {
//     const data = await parseFile('./data/okx.json');
//     console.log(data);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//   }
// })();

// (async function () {
//     try {
//       const data = await parseToken('op://Blockchain/crypto_script/script_key/iv');
//     //   console.log(data);
//     } catch (error) {
//       console.error(`Error: ${error.message}`);
//     }
//   })();

export { parseFile, parseToken };