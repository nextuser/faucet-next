import { NextRequest, NextResponse } from 'next/server';
import {GlobalContext,github_faucet,toFaucetResult} from '../../../lib/globalContext'

export async function GET(request: NextRequest) {
    const address = request.nextUrl.searchParams.get('address');
    const token = request.nextUrl.searchParams.get('token');
    
    console.log("request.nextUrl:",request.nextUrl);
    console.log('/faucet/github req headers token=',token,',address=',address);
    if(!token || !address) {
        return NextResponse.json({error:"invalid params"})
    }
    const allocResult = await github_faucet(token,address);

    return NextResponse.json(toFaucetResult(allocResult))
}