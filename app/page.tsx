'use client';
import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import FaucetPage from '../components/FaucetPage'
import GithubPage from "../components/GithubPage";

import TransactionHistory from '../components/TransactionHistory'
import { Box, Flex , Grid} from "@radix-ui/themes";
import {useState,useEffect} from 'react'
import { SuiClient, getFullnodeUrl,PaginatedTransactionResponse,SuiTransactionBlockResponse  } from '@mysten/sui/client';
import { faucet_config } from '../lib/common/config';
import { Suspense } from 'react';
import {ServerInfo} from "@/lib/common/type"
import ServerComponent from "@/components/ServerInfoComp";
import loadConfig from "next/dist/server/config";

const Page = () => {
    console.log("page render");
	const FAUCET = faucet_config.faucet_address
	const test_client = new SuiClient({url:getFullnodeUrl('testnet')});
	
	//view tx : https://testnet.suivision.xyz/txblock/4iYdXoRXJTAscEs5J1FZLXM5ZTdjUZXVR6unn2mQsWsc
	const [transactions,setTransactions] = useState<SuiTransactionBlockResponse[]>([])
	
	const queryTransactions = 	async ()=>{
		const response :PaginatedTransactionResponse = await test_client.queryTransactionBlocks({filter:{
				FromAddress:faucet_config.faucet_address,
			},
			order:"descending",
			options:{
				showBalanceChanges:true,
				showEffects:true
			}
		});
		setTransactions([... response.data ])
	}
    const [config,setConfig] = useState<ServerInfo|null>(null);

    const query_serverinfo = async ()=>{
        const ret = await fetch("/api/serverinfo");
        const ret_json = await ret.json();
        setConfig(ret_json);
    }

    const [github_loading ,setGithubLoading] = useState(false);


    const  loadConfigAndHistory = async() =>{
        await query_serverinfo();
        await update_history();
        setGithubLoading(true);
    }

	const update_history = ()=>{
		queryTransactions();
	}
	useEffect( ()=>{
        loadConfigAndHistory();
    },[]);

    if(!config){
        return <div>Loading...</div>
    }
    return(
    <>
<center>
<Grid columns="1" gap="2" maxWidth="800px">
	<Box>
		<Tabs.Root className="TabsRoot" defaultValue="tab1">
			<Tabs.List className="TabsList" aria-label="Manage your account">
				<Tabs.Trigger className="TabsTrigger" value="tab1">
				Github
				</Tabs.Trigger>
				<Tabs.Trigger className="TabsTrigger" value="tab2">
				sui@Mainnet 
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content className="TabsContent" value="tab1">
                  {github_loading  && <GithubPage update_history={update_history} config={config} />}
			</Tabs.Content>
			<Tabs.Content className="TabsContent" value="tab2">
				<FaucetPage update_history={update_history}/>
			</Tabs.Content>
		</Tabs.Root>
	</Box>
	<Box>
		<TransactionHistory transactions={transactions}/>
	</Box>
</Grid>
</center>
    </>    
);
}

export default Page;