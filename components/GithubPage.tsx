"use client";
import { useState, useEffect } from 'react'
import { Theme, Button,TextField,Box,Flex } from "@radix-ui/themes";
import { FaucetResult } from '../lib/common/type';
import { redirect,useRouter,useSearchParams,usePathname } from 'next/navigation';
import {ServerInfo ,ProfileData,UserType} from '../lib/common/type'


function getMsg(result:FaucetResult){
  if(result.succ){
    return "Success! Digest=" + result.digest
  }else{
    return "Failed!" + result.msg + (result.digest ? ` Digest=${result.digest}` : "");
  }
}

function GithubPage( props : {config:ServerInfo, update_history : ()=>void} ) {
  console.log("GithubPage render");
  const serverInfo = props.config;
  const redirectURI = serverInfo.redirectUri

  const urlParams = useSearchParams();
  const code = urlParams.get('code')
  
  ////console.log("href:",window.location.href);

  const [loading, setLoading] = useState(false);
  const [gitToken,setGitToken] = useState<string>("")
  const [address,setAddress] = useState<string>("")
  const [msg,setMsg] = useState<string>("")
  const [userData,setUserData] = useState<UserType>()

//  成功 code=>token  ,失败 code =>init
  const authByCode = async (code :string) =>{
    setLoading(true) // Loading is true while our app is fetching
    const ret = await fetch(`/api/auth?code=${code}`)
    try{
      const ret_json = await ret.json();
      console.log("/api/auth result:",ret_json);
      const data = ret_json as ProfileData
      if( data.ok && data.token && data.token.length> 0  && data.userData?.login) {
        localStorage.setItem("githubAuth",data.token!)
        localStorage.setItem("githubExpired", String(new Date().getUTCMilliseconds() + serverInfo.time_expired));
        setGitToken(data.token);
        console.log('authByCode:setGitToken',data.token);
        console.log("right profile data",data.userData.name);
        return;
      } else if(data.error_description){
        console.log("/api/authresult fail");
        setMsg(data.error_description);
      }
      
    }
    catch(ex){
      console.log('/api/auth result: catch error',ex);
    }
    finally{
      setLoading(false)
    }
    oAuthReset();
   }

  useEffect(() => {
    let token :string |null = null;
    const time = Number(localStorage.getItem('githubExpired'));
    if( time > new Date().getUTCMilliseconds()){
      token = localStorage.getItem('githubAuth')
      console.log("token valid,use token in local storage",token);
    }
    
    const ignore = false;

    if (token != null && token.length > 0) {
      setLoading(false)
      setGitToken(token)
    } 
    else if (code) {
        console.log("auth by Code: code=",code);
        authByCode(code).then(()=>setLoading(false));
    }
  }, [])


  const router = useRouter();
  const pathname = usePathname();
  console.log('GithubPage calling:pathname',pathname);


  function oAuthGitHub() {
    const clientId = encodeURI(serverInfo.clientId)   
    const ghScope = encodeURI(serverInfo.scope)//'read:user'
    const oAuthURL = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectURI}&scope=${ghScope}`
    console.log("oAuthGithub:redirect ",oAuthGitHub);
    redirect(oAuthURL)

  }


  function oAuthReset() {
    console.log("oAuthReset,redirect to pathname:",pathname);
    setGitToken("");
    localStorage.removeItem('githubAuth')
    // 重定向到不包含查询参数的当前页面路径
    console.log("oAuthReset,replace to pathname:",pathname);
    router.replace(pathname); 
  }

  function requestFaucet(token:string){
    setLoading(true) // Loading is true while our app is fetching
    const reqUrl = `/faucet/github?address=${encodeURI(address)}&token=${encodeURI(token)}`
    console.log(`url =`,reqUrl);
    fetch(reqUrl, {
      method: 'GET',
      })
    .then((res) => {
      if(res.ok){
        return res.json()
      }
      else{
        setLoading(false);
        oAuthReset();
        throw "Error: Unable to fetch faucet funds. Please try again later.";
      }

    })
    .then((result : FaucetResult) => {
      console.log("faucet error: result",result);
      if(result.code == 'token_error'){
        oAuthReset();
      }
      props.update_history();
      setMsg(getMsg(result))
      console.log("faucetresult", result);
      setLoading(false)
    })
  }

 

  // Creating object to hold information for 'RESET' Button component
  const resetBtn = {
    label: "Unlink GitHub",
    handleClick: () => oAuthReset,
    extraClass: "bg-red-500 active:bg-red-800 hover:ring-red-400 focus:ring-red-400 ms-3",
  }


  //正在登录场景
  if(loading) {
    return <h2>Loading Content... Please Wait.</h2>
  }
  // 登录后场景
  if(gitToken && gitToken.length > 0) {
    return <>
    	<Flex direction="column" gap="2" maxWidth="800px">
	      <label htmlFor='address'>Sui address</label>
        <TextField.Root id="address" variant="surface" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="0xafed3..." />
        <Button className="cursor-pointer disabled:cursor-not-allowed" onClick={()=>requestFaucet(gitToken)} disabled={ gitToken == "" || address === "" } >Reques Faucet</Button>
        <Button className="cursor-pointer" onClick={oAuthReset}>Unlink GitHub</Button>
        {msg && <label>{msg}</label>}
      </Flex>
    </>
  }
  //未登录场景
  return <Flex direction="column" gap="2" maxWidth="800px">
    <Button className="cursor-pointer" onClick={oAuthGitHub} >Github Login</Button>
    {msg && <label>{msg}</label>}
    </Flex>
}

export default GithubPage
