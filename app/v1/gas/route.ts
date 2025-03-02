import { NextRequest, NextResponse } from 'next/server';
import {GlobalContext,faucet, toFaucetResult} from '../../../lib/globalContext'
import dotenv from 'dotenv'
dotenv.config();

export async function GET(request: NextRequest) {

    const recipient = request.nextUrl.searchParams.get('recipient');
    if(!recipient){
        return NextResponse.json( {succ: false,
            msg: 'param recipient missing',
            code : 'param_missing'
        });
    }
    const context = GlobalContext.getInstance();
    let result = toFaucetResult(await faucet(recipient));
    return NextResponse.json(result);
}