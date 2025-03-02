'use client';
import {useState,useEffect} from 'react'
import { SuiClient, getFullnodeUrl  } from '@mysten/sui/client';
import { faucet_config } from '../lib/common/config';
import { FaucetResult } from '../lib/common/type';
import { Theme, Button,TextField,Box,Flex } from "@radix-ui/themes";
//import { setFlagsFromString } from 'v8';

const FAUCET=faucet_config.faucet_address
const address_msg = `Input an address with a balance of at least ${faucet_config.mainnet_balance_limit/1e9} SUI on the mainnet`

function isAddrValid(str : string):boolean{
    if(str && str.length == 66 && str.startsWith('0x')){
        return true;
    }
    
    return false;   
}

const test_client = new SuiClient({url:getFullnodeUrl('testnet')});
const main_client = new SuiClient({url:getFullnodeUrl('mainnet')});
interface ReqData  {  
    FixedAmountRequest: {
        recipient: string
    }
  };

const default_msg = `Welcome : faucet ${faucet_config.faucet_amount/1e9} SUI  testnet once a day, when you have at lease ${faucet_config.mainnet_balance_limit/1e9} SUI in mainnet`;
const FaucetPage = ( props : {update_history : ()=>void }) => {
    const [loading, setLoading] = useState(false);
    const [ msg , setMsg ] = useState(''); 
    const [recipient , setRecipient] = useState<string>('')

    const [mainnet_balance , set_mainnet_balance] = useState<number>(0)
    const [testnet_balance , set_testnet_balance] = useState<number>(0)

    const [total_balance ,set_total_balance] = useState<number>(0);

    const [faucet_enable , set_faucet_enable ] = useState(false)
    const update_total =  ()=>{
      setLoading(true)
      test_client.getBalance({owner:FAUCET}).then((balance) => {
        console.log('Balance:', balance);
        set_total_balance(Number(balance.totalBalance)/1e9);
        setLoading(false)
      });
    }

    const update_recipient_test =  ()=>{
        test_client.getBalance({owner:recipient}).then((balance) => {
        console.log('Balance:', balance);
        set_testnet_balance(Number(balance.totalBalance)/1e9);
      });
    }

    const [host,setHostname] = useState<string>("");
    const [port,setPort] = useState<string>("");
    const [protocol,setProtocol] = useState<string>("");
    useEffect(() => {
        const updateInfo = () => {
          setHostname(window.location.hostname);
          setPort(window.location.port || (window.location.protocol === "https:" ? "443" : "80"));
          setProtocol(window.location.protocol);
        };
        updateInfo();
      
        // 监听 popstate 事件（浏览器前进/后退）
        window.addEventListener("popstate", updateInfo);
        return () => window.removeEventListener("popstate", updateInfo);
      }, []);

      // 获取主机名

    const redirect_faucet = ( e : React.FormEvent )=>{
      
      const url = `${protocol}//${host}:{port}/${faucet_config.rpc_url}?recipient=${recipient}`
      console.log("redirect_faucet url:",url);
      window.location.href=url;
    }
    const redirect = false;
    const handleRequestFaucet = async (e: React.FormEvent) => {
        e.preventDefault();
        if(redirect){
          redirect_faucet(e);
          return;
        }
        set_faucet_enable(false);
        const formData :ReqData ={
            FixedAmountRequest:{
                recipient:""
            }
        }
        formData.FixedAmountRequest.recipient = recipient;
        const url =`${faucet_config.rpc_url}?recipient=${recipient}`;
        console.log(url);
        try {
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type':  'text/plain',
            },
            // body: JSON.stringify(formData),
          });
          set_faucet_enable(true);
          if (!res.ok) {
            setMsg('Network response was not ok');
            return;
          }
          //console.log("faucet result:",await res.text());
          const result : FaucetResult = await res.json();
          console.log(result)
          let str = result.succ ? 'success!':'failed!' ;
          if(result.digest){
            str += ` transaction digest=${result.digest}`
          }
                    
          str += result.succ ?  '':result.msg
          setMsg(str)

          props.update_history();
          if(result.succ){
            update_recipient_test();
            update_total();

          }
        } catch (error) {
            console.log(`Error: ${error}`);
        }
      };

    useEffect( ()=>{
      if(recipient.length == 0){
        setMsg(default_msg);
        set_faucet_enable(false);
        return 
      }
        let enable = total_balance >  (faucet_config.faucet_amount + faucet_config.gas_budget)/1e9;
        if(enable){
          enable = mainnet_balance >= faucet_config.mainnet_balance_limit/1e9
          if(!enable){
            setMsg(`this address has no enough balance in mainnet . you need at least ${faucet_config.mainnet_balance_limit/1e9} SUI @mainnet`);
          }
          else if(msg.length == 0){
            setMsg('Click the button to request faucet')
          }
        }
        else{
          setMsg(`Faucet balance  is not enough.`)
        }

        if(enable != faucet_enable)
          set_faucet_enable(enable);
    },[mainnet_balance,total_balance])

 
    useEffect(() => {
      update_total();
    }, []);

      useEffect(()=>{
        if(isAddrValid(recipient)){ 
            main_client.getBalance({owner:recipient}).then((balance) => {
                console.log('main Balance:', balance);
                const m = Number(balance.totalBalance);
                set_mainnet_balance(m / 1e9);
                if(m < faucet_config.mainnet_balance_limit){
                  setMsg(address_msg);
                }

            });    
            update_recipient_test();
        }
        else{ 
          
          if(mainnet_balance != 0){
            set_mainnet_balance(0);
          }
          setMsg('address format invalid!');
      }

      },[recipient])

    if(loading){
        return <h2>Loading Content... Please Wait.</h2>
    }
   
    return <>
 
 <Flex direction="column" gap="2" maxWidth="800px">
      <h1 className="text-2xl font-bold mb-4">Faucet@Sui_network</h1>

     
      <div>
           
            <label htmlFor='testnet_total'>Faucet total balance@testnet</label>
            <TextField.Root id="testnet_total" variant="surface" value={total_balance || ''} readOnly  />

      </div>

      <div>
        <label htmlFor='testnet_balance'>Your balance@mainnet</label>
        <TextField.Root id="testnet_balance" variant="surface" value={mainnet_balance || '0'}  readOnly></TextField.Root>      
      </div>

      <div>
        <label htmlFor='testnet_balance'>Your balance@testnet</label>
        <TextField.Root id="testnet_balance" variant="surface" value={testnet_balance}  readOnly />
      </div>
      <div>
        <label htmlFor='address'>Sui address</label>
        <TextField.Root id="address" variant="surface" value={recipient || ''}  onChange={(e)=>{
          const addr = e.target.value
          if(addr.length == 0){
            setMsg(default_msg);
          } else{
            setMsg('');
          }
          setRecipient(addr)
        }} placeholder="0xaf83..."/>       
      </div>

      <div>
        <Button id="request_faucet"
          onClick={handleRequestFaucet}
          className="cursor-pointer w-full disabled:cursor-not-allowed"
          disabled={!faucet_enable}
        >
          Request Faucet
        </Button>
        
        {msg && <label  className="block mb-2 text-xl font-medium text-gray-900 dark:text-white">{msg}</label>}
      </div>
    </Flex>


    </>
}


export default FaucetPage;