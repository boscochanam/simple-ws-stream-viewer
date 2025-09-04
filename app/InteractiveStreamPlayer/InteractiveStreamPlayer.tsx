'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import StreamWindow from './components/StreamWindow';
import InteractiveStreamDetails from './components/InteractiveStreamDetails';

const INTERACTIVE_STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL || 'http://localhost:8000/interactive_cv2_stream';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
            const response = await fetch(`${API_BASE_URL}/get_id`);
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
            const response = await fetch(`${API_BASE_URL}/update_id`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: newTitle }),
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