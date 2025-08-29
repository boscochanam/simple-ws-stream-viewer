import cv2
import time
import threading
from typing import Dict

# Improved RTSP frame grabber with better resource management
class RTSPFrameGrabber:
    def __init__(self, rtsp_url):
        self.rtsp_url = rtsp_url
        self.cap = None
        self.latest_frame_jpeg = None
        self.running = True
        self.lock = threading.Lock()
        self.client_count = 0
        self.last_frame_time = 0
        self._init_capture()
        self.thread = threading.Thread(target=self._grab_frames, daemon=True)
        self.thread.start()

    def _init_capture(self):
        import os
        
        # Set FFmpeg environment variables for minimal latency with the recommended flags
        os.environ['OPENCV_FFMPEG_CAPTURE_OPTIONS'] = (
            'rtsp_transport;tcp|'
            'max_delay;500000|'
            'fflags;nobuffer+discardcorrupt|'
            'flags;low_delay|'
            'probesize;32|'
            'analyzeduration;0|'
            'vsync;0'
        )
        
        # Create capture with FFmpeg backend explicitly
        self.cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
        
        # Additional OpenCV optimizations for minimal latency
        if self.cap.isOpened():
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 0)        # No buffering
            self.cap.set(cv2.CAP_PROP_FPS, 30)              # Higher FPS for responsiveness
        
    def _grab_frames(self):
        frame_skip_counter = 0
        while self.running:
            if self.client_count == 0:
                time.sleep(0.1)  # Sleep longer if no clients
                continue
                
            if self.cap is None:
                time.sleep(0.1)
                continue
                
            ret, frame = self.cap.read()
            if not ret:
                # Try to reconnect
                if self.cap:
                    self.cap.release()
                time.sleep(1)
                self._init_capture()
                continue
                
            # Skip fewer frames for lower latency
            frame_skip_counter += 1
            if frame_skip_counter % 1 != 0:  # Process every frame for minimal latency
                continue
                
            # Resize frame to reduce bandwidth and processing
            height, width = frame.shape[:2]
            if width > 640:
                scale = 640 / width
                new_width = int(width * scale)
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height))
            
            # Encode with lower quality
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
            
            with self.lock:
                self.latest_frame_jpeg = buffer.tobytes()
                self.last_frame_time = time.time()
            
            time.sleep(0.01)  # Minimal sleep for maximum responsiveness

    def get_jpeg(self):
        with self.lock:
            # Return cached frame if recent enough
            if (self.latest_frame_jpeg is not None and 
                time.time() - self.last_frame_time < 1.0):
                return self.latest_frame_jpeg
        return None

    def add_client(self):
        with self.lock:
            self.client_count += 1

    def remove_client(self):
        with self.lock:
            self.client_count = max(0, self.client_count - 1)

    def stop(self):
        self.running = False
        if self.thread.is_alive():
            self.thread.join(timeout=2)
        if self.cap:
            self.cap.release()

# Store grabbers by URL with weak references for cleanup
rtsp_grabbers: Dict[str, RTSPFrameGrabber] = {}

def rtsp_streamer(rtsp_url):
    if rtsp_url not in rtsp_grabbers:
        rtsp_grabbers[rtsp_url] = RTSPFrameGrabber(rtsp_url)
    
    grabber = rtsp_grabbers[rtsp_url]
    grabber.add_client()
    
    try:
        last_yield_time = 0
        while True:
            current_time = time.time()
            # Higher FPS for minimal latency (30 FPS)
            if current_time - last_yield_time < 0.033:
                time.sleep(0.001)  # Very short sleep
                continue
                
            frame_bytes = grabber.get_jpeg()
            if frame_bytes:
                yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                last_yield_time = current_time
            else:
                time.sleep(0.001)  # Minimal wait if no frame available
    except GeneratorExit:
        pass
    finally:
        grabber.remove_client()
