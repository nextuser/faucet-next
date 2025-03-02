// pages/api/config.js (Next.js 示例路由)
import getServerInfo from '../../lib/getServerInfo';
import { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(_:NextApiRequest, res:NextApiResponse) {
  try {
    const config = await getServerInfo();
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load configuration' });
  }
}