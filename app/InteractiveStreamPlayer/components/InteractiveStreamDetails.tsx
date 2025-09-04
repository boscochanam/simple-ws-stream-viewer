import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface InteractiveStreamDetailsProps {
    currentStream: string;
    streamInput: string;
    onReload: () => void;
    currentTitle: string;
    onTitleUpdate: (title: string) => void;
}

export default function InteractiveStreamDetails({ 
    currentStream, 
    onReload,
    currentTitle,
    onTitleUpdate
}: InteractiveStreamDetailsProps) {
    const [titleInput, setTitleInput] = useState(currentTitle);

    const handleTitleUpdate = () => {
        onTitleUpdate(titleInput);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-center w-full">
                <span className="mt-2 font-mono text-xs bg-green-100 px-2 py-1 rounded border-2 border-black">
                    <strong>Live: </strong>{currentStream}
                </span>
            </div>
            
            {/* Title Update Section */}
            <div className="flex flex-col gap-2 p-4 bg-blue-50 rounded border">
                <h3 className="font-semibold text-sm">Stream Overlay Title</h3>
                <div className="flex justify-center w-full mb-2">
                    <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded border">
                        <strong>Current Title: </strong>{currentTitle}
                    </span>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Input
                        placeholder="Enter new title for overlay"
                        className="flex-1"
                        value={titleInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitleInput(e.target.value)}
                    />
                    <Button onClick={handleTitleUpdate} variant="outline">
                        Update Title
                    </Button>
                </div>
            </div>

            {/* Stream Selection Section */}
            <div className="flex flex-row items-center justify-center gap-3 w-full">
                <Button className="ml-2" onClick={onReload}>Reload Stream</Button>
            </div>
        </div>
    )
}
