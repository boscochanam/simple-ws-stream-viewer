import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function StreamDetails({ currentStream, updateStream }: { currentStream: string, updateStream: (url: string) => void }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-full flex justify-center">
                <span className="font-mono text-xs bg-green-100 px-2 py-1 rounded mt-2 border-2 border-black">
                    <strong>Live: </strong>{currentStream}
                </span>
            </div>
            <div className='flex items-center justify-center w-full'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="mt-2">
                            Select Stream ? 
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => updateStream('http://example.com/stream1')}>
                            Stream Link 1
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStream('http://example.com/stream2')}>
                            Stream Link 2
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Input placeholder="Enter custom stream URL" className='w-full mt-2 ml-5' />
                <Button className="ml-2 mt-2">Set Stream</Button>
            </div>
        </div>
    )
}