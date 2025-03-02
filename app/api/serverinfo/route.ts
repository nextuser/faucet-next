import { NextRequest, NextResponse } from 'next/server';
import {GlobalContext,github_faucet,toFaucetResult} from '../../../lib/globalContext'
import { ServerInfo } from '@/lib/common/type';
import getServerInfo from '../../../lib/getServerInfo'
export async function GET(request: NextRequest) {
    const config = await getServerInfo();
    return NextResponse.json(config)
}