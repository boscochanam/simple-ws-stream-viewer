import Image from "next/image";
import StreamPlayer from "./StreamPlayer/StreamPlayer";
import InteractiveStreamPlayer from "./InteractiveStreamPlayer/InteractiveStreamPlayer";

const INTERACTIVE_STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL || 'http://localhost:8000/interactive_cv2_stream';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-8">Stream Viewer Dashboard</h1>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <StreamPlayer />
          <InteractiveStreamPlayer STREAM_URL={INTERACTIVE_STREAM_URL} />
        </div>
      </div>
    </div>
  );
}
