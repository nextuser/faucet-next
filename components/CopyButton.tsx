'use client';
const CopyButton =( props:{ display:string, copy_value: string})=>{
    const copyContent = async (text:string) => {
        try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
        } catch (err) {
        console.error('Failed to copy: ', err);
        }
    }
    return (<button onClick={()=>copyContent(props.copy_value)}
    className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 dark:focus-visible:ring-zinc-300 border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 rounded-md text-xs text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors h-7 px-2"><svg
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="lucide lucide-copy h-3 sm:mr-1 mr-0">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
    </svg><span className="hidden sm:inline">{props.display}</span></button>);
}


export default CopyButton;