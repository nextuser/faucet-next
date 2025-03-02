import { NextRequest, NextResponse } from 'next/server';
import {GlobalContext} from '../../../lib/globalContext'
import { ProfileData } from '@/lib/common/type';
import dotenv from 'dotenv'
dotenv.config();

export async function GET(request: NextRequest) {

    const ghCode = request.nextUrl.searchParams.get('code');
    const clientId = process.env.clientId;
    const clientSecret = process.env.clientSecret;
    if(!ghCode || !clientId || !clientSecret){
      return NextResponse.json({error:"ghCode or clientId or clientSecret is null"},{status:400});
    }
    const data ={
      clientId: clientId,
      clientSecret: clientSecret,
      code:ghCode
    }
    const url =`https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${data.code}`;
    //Send code to GitHub with 
    console.log("api/auth : fetch url:",url);
    let result :any = {ok:false};
    try{
      result = await fetch(encodeURI(url), {
          method: 'GET',
          headers: {
              "Accept": "application/json"
          }
      });
      if(!result.ok){
        
        ///console.log("reuslt:",result);
        let ret :ProfileData = {
            ok : "",
            error_description:`Error in /api/auth fetch ${url} error:${result.status}`
        }
        console.log(`Error in /api/auth fetch ${url} error:${result.status}`);
        return NextResponse.json(ret);
      }
  }catch(ex){
    console.log("api/auth : fetch error:",ex);
    let ret :ProfileData = {
      ok : "",
      error_description:`Error in /api/auth fetch ${url} error:${ex}`
   }
   return NextResponse.json(ret);
  }

/**
 * [1] /api/auth token object: {
[1]   error: 'bad_verification_code',
[1]   error_description: 'The code passed is incorrect or expired.',
[1]   error_uri: 'https://docs.github.com/apps/managing-oauth-apps/troubleshooting-oauth-app-access-token-request-errors/#bad-verification-code'
 */
    const token = await result.json();
    if(token.error){
      return NextResponse.json({ok:false, error:token.error, error_description:token.error_description, error_uri:token.error_uri})
    
    };
    console.log("/api/auth token object:",token); 
    console.log('https://api.github.com/user'); 
    const ret = await fetch('https://api.github.com/user', {
        headers: { Authorization: `${token.token_type} ${token.access_token}` }
    })
    
    if(! ret.ok){
       return NextResponse.json({ok:false,error_description:`error in https://api.github.com/user error status:${ret.statusText}`});
    }
    const user_res= await ret.json();
    console.log("/api/auth user_res:",user_res)

    const context = GlobalContext.getInstance();
    if(user_res.email){    
        context.regist_github(token.access_token,user_res.email);
        const ghResponse = {ok:true,"userData": user_res, "token": token.access_token}
        return NextResponse.json(ghResponse)
    } else{
      console.log("/api/auth : no user_res.email  user_res:",user_res);
      return NextResponse.json({ok:false,error_description:"get user_email failed",user_res})
    }

}