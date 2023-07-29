import './globals.css';
import { Inter } from 'next/font/google';

import Account from '@/assemblies/Account.js';
import Operators from '@/assemblies/Operators.js';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Account menu={account_menu}/>
        <Operators operators={operators}/>

        {children}
      </body>
    </html>
  );
}

const account_menu = [
    { url: '/',                   label: 'コックピット' },
    { url: '/business',           label: 'ビジネス' },
    { url: '/design',             label: 'デザイン' },
    { url: '/screen',             label: '画面' },
    { url: '/data',               label: 'データ' },
    { url: '/classes',            label: 'クラス' },
    { url: '/system-environment', label: 'システム構成' },
    { url: '/message',            label: 'メッセージ' },
    { url: '/wbs',                label: 'WBS' },
    { url: '/scrum',              label: 'Scrum' },
    { url: '/account',            label: 'アカウント' },
    { url: '/auth',               label: '認証' },
    { url: '/next.js',            label: 'Next.js' },
];

const operators = [
    {
        code: 'a',
        label: { type: 'text', val: 'X' },
        position: { x: null, y: null },
    },
    {
        code: 'b',
        label: { type: 'text', val: 'Y' },
        position: { x: null, y: null },
    },
    {
        code: 'c',
        label: { type: 'text', val: 'Z' },
        position: { x: null, y: null },
    },
].map(d=> {
    // size use default
    d.size = { w: 66, h: 66 };

    return d;
});
