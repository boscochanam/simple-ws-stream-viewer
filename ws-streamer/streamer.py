
from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
import cv2
import time
from rtsp_handler import rtsp_streamer

app = FastAPI()

def cv2_streamer(video_path):
    cap = cv2.VideoCapture(video_path)
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])  # Lower quality
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.033)
    finally:
        cap.release()

@app.get("/cv2_stream")
def cv2_stream(path: str = "video.mp4"):
    return StreamingResponse(cv2_streamer(path), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/rtsp_stream")
def rtsp_stream(rtsp_url: str = "rtsp://10.7.30.50:554/profile2/media.smp"):
    return StreamingResponse(rtsp_streamer(rtsp_url), media_type="multipart/x-mixed-replace; boundary=frame")