

'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import StreamWindow from './components/StreamWindow';
import StreamDetails from './components/StreamDetails';

const STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL || 'http://localhost:8000/video_stream';

export default function StreamPlayer() {

    const [currentStream, setCurrentStream] = useState(STREAM_URL);

    function updateStream(url: string) {
        setCurrentStream(url);
    }

    return (
        <div>
            <h1 className='font-bold text-2xl ml-6 mt-6'>Streaming Page</h1>
            <Card className="m-6 p-0 flex items-center w-fit h-fit">
                <CardTitle className="px-6 pt-6">Live Stream</CardTitle>
                <CardContent className="p-6 pt-0">
                    <StreamWindow STREAM_URL={currentStream} />
                    <StreamDetails currentStream={currentStream} updateStream={updateStream} />
                </CardContent>
            </Card>
        </div>
    );
}