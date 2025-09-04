import InteractiveStreamPlayer from "./OilHoleStreamPlayer/InteractiveStreamDetails";


export default function OilHolePage() {
  return (
    <div>
      <InteractiveStreamPlayer STREAM_URL={'http://10.7.30.58:8006/video_feed'} />
    </div>
  );
}
