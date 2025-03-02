import dotenv from 'dotenv';
//TODO upload 的时候替换 github_config_local =》 github_config_react
import { github_config_local as config } from './site_config';
import { ServerInfo } from './common/type';
dotenv.config();


function getServerInfo() : ServerInfo{
    return {
        clientId : process.env.clientId || "",
        redirectUri:  config.redirect_uri ,
        scope : config.scope,
        time_expired : config.time_expired,
    }
}

export default getServerInfo;
