
from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
import cv2
import time

app = FastAPI()

def mjpeg_stream():
    cap = cv2.VideoCapture("video.mp4")
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.033)
    finally:
        cap.release()

@app.get("/video_stream")
def video_stream():
    return StreamingResponse(mjpeg_stream(), media_type="multipart/x-mixed-replace; boundary=frame")
