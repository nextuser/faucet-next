// app/layout.tsx
import ReactDOM from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import '../styles/App.css'
import '../styles/style.css'
import '../styles/global.css'
import { ReactNode } from 'react';


export const metadata = {
    title: 'Next.js Global Context',
    description: 'Demonstrating global context in Next.js App Router',
};

const RootLayout = ({ children }: { children: ReactNode }) => {
    return (
        <html lang="en">
            <body>
            <Theme appearance="light">
                {children}
            </Theme>
            </body>
        </html>
    );
};

export default RootLayout;