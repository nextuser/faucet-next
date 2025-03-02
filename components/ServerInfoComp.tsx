'use server'
import getServerInfo  from '../lib/getServerInfo';
import { ServerInfo } from '@/lib/common/type';
import React from 'react';

// app/components/ServerComponent.tsx
import { ReactNode } from 'react';

// 定义 props 类型，包含一个返回 ReactNode 的函数作为 children
interface ServerComponentProps {
  children: (config: ServerInfo) => ReactNode;
}

export default async function ServerComponent({ children }: ServerComponentProps) {
  const config =  getServerInfo();
  // 渲染子组件并传递配置
  return <div>{children(config)}</div>;
}