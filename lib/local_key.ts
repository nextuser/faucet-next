import * as fs from 'fs';
import * as  dotenv from 'dotenv';
import  path from 'path'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

import { faucet_config } from './common/config';
import { exit } from 'process';

dotenv.config();
// 初始化SUI Client, 用于和主网(mainnet)交互
// 从环境变量读取secretKey
//AAa...   ~/keys/*.key
// const secretKey = process.env.SECRET_KEY || get_key();;
// /** 这里把base64编码的secretKey转换为字节数组后截掉第一个元素，是因为第一位是一个私钥类型的标记位，后续派生签名者时不需要 **/
// const secretKeyBytes = fromBase64(secretKey).slice(1); // 发起方账户私钥
// export const signer = Ed25519Keypair.fromSecretKey(secretKeyBytes); // 生成签名者

export function getSigner(): Ed25519Keypair{
    const mnemonic = process.env.MNEMONIC || ''
    if(mnemonic == "") {
        console.error("export  MNMONIC FIRST");
        exit("no MNEMNIC environment variable")
    } 
    const signer = Ed25519Keypair.deriveKeypair(mnemonic);
    console.log(`signer.address=${signer.toSuiAddress}`);
    faucet_config.faucet_address = signer.toSuiAddress();
    console.log(`config.address=${faucet_config.faucet_address}`);
    return signer;
}
/**
 * 
 * @returns read .key
 */
export function get_local_key() : string{
    const fd = fs.openSync('.key','r')
    const buffer = Buffer.alloc(100);
    const buffer_size = 100;
    const read_len = fs.readSync(fd,buffer,0,buffer_size,null);

    fs.closeSync(fd);
    const ret = buffer.toString().trim().substring(0,read_len);
    return ret;
}



/**
 * read  ~/.sui/sui_config/sui.keystore  keys 
 * @returns private_key
 */
export function get_keys() : string[] {
    dotenv.config();
    const home_dir = process.env.HOME || "~/";

    const file = path.join(home_dir, ".sui/sui_config/sui.keystore");
    const buffer = fs.readFileSync(file);
    const keys = JSON.parse(buffer.toString());
    //console.log(keys);
    return keys as unknown as string[];
}

export function get_key() : string{
    return get_keys()[0];
}

