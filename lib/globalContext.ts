import { Transaction } from "@mysten/sui/transactions";
import {  SuiClient, getFullnodeUrl} from '@mysten/sui/client'
import { faucet_config } from "./common/config";
import {getSigner} from './local_key';
import { FaucetResult,FaucetCode } from "./common/type";

const test_client = new SuiClient({ url: getFullnodeUrl('testnet') });
const main_client = new SuiClient({ url: getFullnodeUrl('mainnet') });

// globalContext.ts
enum AllocErr{
    SUCC = 0,
    ERR_DURING_CALLING = 1,
    ERR_ALLOCATED_IN_ONE_DAY = 2,
    ERR_GITHUB_TOKEN_INVALID = 3,
    //ERR_ALLOC_FAIL = 4,
    ERR_MAINNET_LIMIT = 5,
    ERR_TRANSACTION_FAIL = 6,
    ERR_TRANSACTION_STATUS_FAIL = 7,

}

export class AllocResult {
    private err : AllocErr;
    private msg : string;
    private digest ?:string
    constructor(err : AllocErr,msg? : string,digest? : string){
        this.err = err;
        this.msg = msg || '';
        this.digest = digest;
    }
    isSucc() : boolean {
        return this.err == AllocErr.SUCC;
    }
    get errCode() : AllocErr {  
        return this.err;
    }

    get errMsg() : string{
        return this.msg;
    }

    static from(err :AllocErr,msg? : string,digest? : string){
        return new AllocResult(err,msg,digest);
    }
}

class  AllocData {
    //记录当天分配过的地址
    allocSet  :  Set<string>;
    //alloc_git_set : Set<string>;
    warmSet : Set<string>;
    tokenMap : Map<string,string>;
    timerRunning = false;
    

    constructor(){
        this.allocSet = new Set<string>();
        //this.alloc_git_set = new Set<string>();
        this.warmSet = new Set<string>();
        this.tokenMap = new Map<string,string>();
        this.timerRunning = false;
    }


}

export class GlobalContext {
    private static instance: GlobalContext;
    private data: AllocData;

    private constructor() {
        this.data = new AllocData();
    }


    public static getInstance(): GlobalContext {
        if (!GlobalContext.instance) {
            GlobalContext.instance = new GlobalContext();
            GlobalContext.instance.clearDaily();
        }
        return GlobalContext.instance;
    }

    public enter(id :string) : AllocResult {
        if(this.data.warmSet.has(id)){
            return AllocResult.from(AllocErr.ERR_DURING_CALLING)
        }
        if(this.data.allocSet.has(id)){
            return new AllocResult(AllocErr.ERR_ALLOCATED_IN_ONE_DAY);
        }
        this.data.warmSet.add(id);
        return AllocResult.from(AllocErr.SUCC);
    }

    public allocated(id :string){
        this.data.allocSet.add(id);
    }


    public regist_github(token : string, user_id : string){
        console.log(`register token=>user_id`,token,user_id);
        this.data.tokenMap.set(token,user_id);
    }

    public getUserId(token : string) : string | undefined {
        return this.data.tokenMap.get(token);
    }


    public leave(id:string){
        this.data.warmSet.delete(id);
    }

    public clearAllocSet(){
        this.data.allocSet.clear();
    }


    clearDaily(){
        if(this.data.timerRunning){
            console.log("clear daily!");
            //每天清空一次
            setInterval(async ()=>{
                this.data.allocSet.clear();
                //this.data.alloc_git_set.clear();
            },24*60*60*1000)
            this.data.timerRunning = true;
        }
    }
    

}


async  function doFaucet(target:string) :Promise<AllocResult>{
    const tx = new Transaction();
    const coin = tx.splitCoins(tx.gas,[tx.pure.u64(faucet_config.faucet_amount)]);
    tx.transferObjects([coin],tx.pure.address(target));
    const sign_resp = await test_client.signAndExecuteTransaction({transaction:tx,signer:getSigner()});
    const resp = await test_client.waitForTransaction({digest:sign_resp.digest,options:{showEffects:true,showBalanceChanges:true,showEvents:true}});
    if(resp.errors){
        console.log("tx.digest:",sign_resp.digest,",tx error:",resp.errors);
        return  AllocResult.from(AllocErr.ERR_TRANSACTION_FAIL,
                                `tx fail ${sign_resp.digest}`,
                                sign_resp.digest)
    } else{
        if(resp.effects?.status.status === "success"){
            
            console.log("tx.digest:",sign_resp.digest,",tx success");
            return AllocResult.from(AllocErr.SUCC,'',sign_resp.digest);
        } else{
            console.log("tx.digest:",sign_resp.digest,",tx status:",resp.effects?.status.status);
            return  AllocResult.from(AllocErr.ERR_TRANSACTION_STATUS_FAIL,
                                    `tx.digest=${sign_resp.digest} tx status error:`,
                                    sign_resp.digest);
        }
    }
}

export async function github_faucet(token :string ,address : string ) : Promise<AllocResult> {
    const context = GlobalContext.getInstance();
    const user_id = context.getUserId(token);
    if(!user_id ) {
        return AllocResult.from(AllocErr.ERR_GITHUB_TOKEN_INVALID);
    }

    try{
        const ret = context.enter(user_id);
        if(!ret.isSucc()) return ret;

        const result = await doFaucet(address);
        if(result.isSucc()){
            context.allocated(user_id);
        }     
        
        return result;
        
    }finally{
        context.leave(user_id);
    }
}



function toFaucetCode(code :AllocErr) : FaucetCode {
    switch(code){
        case AllocErr.ERR_MAINNET_LIMIT:
            return 'mainnet_limit';
        case AllocErr.ERR_DURING_CALLING:
            return 'faucet_limit';
        case AllocErr.ERR_ALLOCATED_IN_ONE_DAY:
            return 'tx_fail';
        case AllocErr.ERR_TRANSACTION_FAIL:
            return 'tx_fail';
        case AllocErr.ERR_TRANSACTION_STATUS_FAIL:
            return 'tx_status_error';
        case AllocErr.SUCC:
            return 'tx_succ';
        case AllocErr.ERR_GITHUB_TOKEN_INVALID:
            return 'token_error';
    }
}

export function  toFaucetResult(result :AllocResult) : FaucetResult{
    return {
        succ: result.isSucc(),
        msg: result.errMsg ,
        digest:"",
        code : toFaucetCode(result.errCode),
    }
}



// mainet faucet
export async function faucet(target :string) :Promise<AllocResult>{

    const context = GlobalContext.getInstance();

    const result  = context.enter(target);
    if(!result.isSucc()){
        return result;
    }
    try{

        const main_balance = await main_client.getBalance({owner:target});
        if(Number(main_balance.totalBalance) < faucet_config.mainnet_balance_limit){
            return AllocResult.from(AllocErr.ERR_MAINNET_LIMIT);
        }

        const result = await doFaucet(target);
        if(result.isSucc()){
            context.allocated(target);
        }
        return result;
    } 
    finally{
        context.leave(target);
    }
}

export default GlobalContext.getInstance();


function test_duplicate_faucet(){
    faucet('0xafe36044ef56d22494bfe6231e78dd128f097693f2d974761ee4d649e61f5fa2').then((result) => {
        if (result.isSucc()) {
            console.log('Faucet successful');
        } else {
            console.error('1.Faucet failed: errmsg,errcode', result.errMsg,result.errCode);
        }
    });

    faucet('0xafe36044ef56d22494bfe6231e78dd128f097693f2d974761ee4d649e61f5fa2').then((result) => {
        if (result.isSucc()) {
            console.log('Faucet successful');
        } else {
            console.error('2.Faucet failed:,code=', result.errMsg,result.errCode);
        }
    });
}

if( process.env.TEST){
    test_duplicate_faucet();
}