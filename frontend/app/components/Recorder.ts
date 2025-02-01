import io, { Socket } from "socket.io-client";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const Backend_url = process.env.Backend_url;
// Socket.io initialization
const socket: Socket = io(Backend_url, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 5000,
  transports: ["websocket", "polling"],
});
const time_Intervel = 1000;

export class RecordingHandler {
  private videoChunks: Blob[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;

  private sessionId: string | null = null;
  private socket = socket;

  private recordingStatus: string = "Initializing...";
  private playbackStatus: string = "Waiting for stream...";

  public getRecordingStatus(): string {
    return this.recordingStatus;
  }

  public requestSessionId(): void {
    // Emit a request to the backend for the session ID
    this.socket.emit("get_session_id", {}, (response: { session_id: string }) => {
      if (response?.session_id) {
        this.sessionId = response.session_id;
        console.log("Session ID received:", this.sessionId);
        this.updateRecordingStatus("Session ID received");
      } else {
        console.error("Failed to retrieve session ID");
        this.updateRecordingStatus("Failed to retrieve session ID");
      }
    });
  }
  

  public getPlaybackStatus(): string {
    return this.playbackStatus;
  }

  private updateRecordingStatus(status: string): void {
    this.recordingStatus = status;
    console.log(`Recording Status: ${status}`);
  }

  private updatePlaybackStatus(status: string): void {
    this.playbackStatus = status;
    console.log(`Playback Status: ${status}`);
  }

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.updateRecordingStatus("Connected and Ready");
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
      this.updateRecordingStatus(`Connection Error: ${error.message}`);
    });

    this.socket.on("disconnect", (reason: string) => {
      console.warn("Socket disconnected:", reason);
      this.updateRecordingStatus(`Disconnected: ${reason}`);
      if (reason === "io server disconnect") {
        this.socket.connect();
      }
    });

    this.socket.io.on("reconnect", (attempt: number) => {
      console.log(`Reconnected on attempt: ${attempt}`);
      this.updateRecordingStatus("Reconnected");
    });

    this.socket.io.on("reconnect_attempt", (attempt: number) => {
      console.log(`Attempting reconnection: ${attempt}`);
      this.updateRecordingStatus(`Reconnecting (Attempt ${attempt})...`);
    });

    this.socket.io.on("reconnect_error", (error: Error) => {
      console.error("Reconnection failed:", error);
      this.updateRecordingStatus("Reconnection failed");
    });

    this.socket.on("playback-chunk", (data: { chunk: string }) => {
      this.handlePlaybackChunk(data.chunk);
    });
  }

  public async checkMediaSupport(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: 30 },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      this.updateRecordingStatus("Media Devices Ready");
      stream.getTracks().forEach((track) => track.stop());
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.updateRecordingStatus(`Media Error: ${errorMessage}`);
      console.error("Media device access error:", err);
    }
  }

  public async startStreaming(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });

      this.mediaStream = stream;
      this.videoChunks = [];
      this.socket.emit("start-recording", {}, (response: { session_id: string }) => {
        if (response?.session_id) {
          this.sessionId = response.session_id;
          this.initializeRecording(stream);
        } else {
          this.updateRecordingStatus("Failed to initialize session");
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updateRecordingStatus(`Error: ${errorMessage}`);
      console.error("Start streaming error:", error);
    }
  }

  private initializeRecording(stream: MediaStream): void {
    try {
      const recorderOptions = { mimeType: "video/webm;codecs=vp8,opus" };
      const recorder = new MediaRecorder(
        stream,
        MediaRecorder.isTypeSupported(recorderOptions.mimeType) ? recorderOptions : { mimeType: "video/webm" }
      );

      this.mediaRecorder = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.videoChunks.push(event.data);
          this.sendChunkToServer(event.data);
        }
      };

      recorder.onstart = () => this.updateRecordingStatus("Recording...");
      recorder.onerror = () => this.updateRecordingStatus("Recording error");
      recorder.onstop = () => this.finalizeRecording();

      recorder.start(time_Intervel);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updateRecordingStatus(`Recording error: ${errorMessage}`);
      console.error("Initialize recording error:", error);
    }
  }
 
  public stopRecording(): void {
    if (this.mediaRecorder) {
      // Log the state for debugging purposes
      console.log("MediaRecorder state:", this.mediaRecorder.state);
  
      if (this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
        console.log("Recording stopped.");
      }
    }
  
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        console.log("Stopping track:", track);
        track.stop();
      });
    }
  
    // Update recording status
    this.updateRecordingStatus("Recording stopped");
  }
  

  private finalizeRecording(): void {
    if (this.sessionId) {
      this.socket.emit("stop-recording", { session_id: this.sessionId }, (response: { status: string }) => {
        if (response.status === "success") {
          this.updateRecordingStatus("Recording saved successfully");
        } else {
          this.updateRecordingStatus("Error saving recording");
        }
      });
    }
  }

  private sendChunkToServer(chunk: Blob): void {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (!this.sessionId) return;

      this.socket.emit(
        "stream-chunk",
        { session_id: this.sessionId, chunk: reader.result, timestamp: Date.now() },
        (ack: unknown) => {
          if (ack) console.log("Chunk sent successfully");
        }
      );
    };

    reader.readAsArrayBuffer(chunk);
  }

  private handlePlaybackChunk(dataURI: string): void {
    try {
      const byteString = atob(dataURI.split(",")[1]);
      const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }

      const videoBlob = new Blob([arrayBuffer], { type: mimeString });
      this.videoChunks.push(videoBlob);
      this.updatePlaybackStatus("Receiving stream...");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updatePlaybackStatus(`Playback error: ${errorMessage}`);
    }
  }
  
}
