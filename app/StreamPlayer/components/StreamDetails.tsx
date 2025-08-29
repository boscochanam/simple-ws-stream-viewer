import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface StreamDetailsProps {
    currentStream: string;
    streamInput: string;
    setStreamInput: (url: string) => void;
    onDropdownSelect: (url: string) => void;
    onReload: () => void;
}

export default function StreamDetails({ currentStream, streamInput, setStreamInput, onDropdownSelect, onReload }: StreamDetailsProps) {
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-center w-full">
                <span className="mt-2 font-mono text-xs bg-green-100 px-2 py-1 rounded border-2 border-black">
                    <strong>Live: </strong>{currentStream}
                </span>
            </div>
            <div className="flex flex-row items-center justify-center gap-3 w-full">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Select Stream ?
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onDropdownSelect('http://example.com/stream1')}>
                            Stream Link 1
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDropdownSelect('http://example.com/stream2')}>
                            Stream Link 2
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Input
                    placeholder="Enter custom stream URL"
                    className="w-full"
                    value={streamInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStreamInput(e.target.value)}
                />
                <Button className="ml-2" onClick={onReload}>Reload Stream</Button>
            </div>
        </div>
    )
}