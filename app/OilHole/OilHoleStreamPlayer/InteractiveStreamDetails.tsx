'use client';
import InteractiveStreamDetails from '@/app/InteractiveStreamPlayer/components/InteractiveStreamDetails';
import StreamWindow from '@/app/InteractiveStreamPlayer/components/StreamWindow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

const INTERACTIVE_STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL || 'http://localhost:8000/interactive_cv2_stream';
const OIL_HOLE_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.7.30.58:8006';

export default function InteractiveStreamPlayer({ STREAM_URL }: { STREAM_URL: string }) {
    const [currentStream, setCurrentStream] = useState(STREAM_URL || INTERACTIVE_STREAM_URL);
    const [streamInput, setStreamInput] = useState(STREAM_URL || INTERACTIVE_STREAM_URL);
    const [reloadKey, setReloadKey] = useState(0);
    const [currentTitle, setCurrentTitle] = useState('Default ID');
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch current title on component mount
    useEffect(() => {
        fetchCurrentTitle();
    }, []);

    const fetchCurrentTitle = async () => {
        try {
            console.log('Fetching current title from:', `${OIL_HOLE_API_BASE_URL}/api/job/current`);
            const response = await fetch(`${OIL_HOLE_API_BASE_URL}/api/job/current`);
            if (response.ok) {
                const data = await response.json();
                setCurrentTitle(data.id);
            }
        } catch (error) {
            console.error('Error fetching current title:', error);
        }
    };

    const updateTitle = async (newTitle: string) => {
        setIsUpdating(true);
        try {
            const url = new URL(`${OIL_HOLE_API_BASE_URL}/api/job/set`);
            url.searchParams.append('job_number', newTitle);

            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentTitle(data.id);
                console.log('Title updated successfully:', data.message);
            } else {
                console.error('Failed to update title');
            }
        } catch (error) {
            console.error('Error updating title:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    function handleDropdownSelect(url: string) {
        setStreamInput(url);
    }

    function handleReload() {
        setCurrentStream(streamInput);
        setReloadKey(prev => prev + 1); // force StreamWindow reload
    }

    return (
        <div>
            <h1 className='font-bold text-2xl ml-6 mt-6'>Interactive Streaming Page</h1>
            <Card className="m-6 p-0 flex items-center w-fit h-fit">
                <CardTitle className="px-6 pt-6">Interactive Live Stream</CardTitle>
                <CardContent className="p-6 pt-0">
                    <StreamWindow key={reloadKey} STREAM_URL={currentStream} />
                    <InteractiveStreamDetails
                        currentStream={currentStream}
                        streamInput={streamInput}
                        setStreamInput={setStreamInput}
                        onDropdownSelect={handleDropdownSelect}
                        onReload={handleReload}
                        currentTitle={currentTitle}
                        onTitleUpdate={updateTitle}
                    />
                    {isUpdating && (
                        <div className="mt-4 text-center">
                            <span className="text-sm text-gray-600">Updating title...</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}