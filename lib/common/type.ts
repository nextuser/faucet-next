export type FaucetCode = 'mainnet_limit' | 'faucet_limit' | 'time_limit' 
                |'tx_fail' | 'tx_status_error' | 'tx_succ' | 'token_error' | 'param_missing';


export type FaucetResult = {
    succ: boolean,
    msg: string,
    digest?:string,
    code : FaucetCode
}


export type ServerInfo = {
    clientId : string,
    redirectUri: string,
    scope : string,
    time_expired : number,
}


export type ProfileData = {
    ok : string
    error_description?:string
    token? : string
    userData? : UserType
 }


 export type UserType = {
    avatar_url: string;
    login: string;
    location: string;
    name: string;
    id: string;
    type: string;
    followers: number;
    following: number;
    public_repos: number;
   };
  
  