"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Mic,
  MonitorCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SystemCheckPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.code as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissions, setPermissions] = useState({
    camera: false,
    mic: false,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [virtualCameraError, setVirtualCameraError] = useState("");

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");

  // Function to request hardware access and switch devices
  const requestPermissions = async (cameraId?: string, micId?: string) => {
    setIsChecking(true);
    try {
      // Stop old tracks if re-requesting
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const videoConfig = cameraId ? { deviceId: { exact: cameraId } } : true;
      const audioConfig = micId ? { deviceId: { exact: micId } } : true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConfig,
        audio: audioConfig,
      });

      // Store the stream in a separate ref so we can attach it when the video mounts and clean it up safely later
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);

      // Block known virtual cameras
      let activeVideoDevice: MediaDeviceInfo | undefined;

      if (!cameraId) {
        const vTracks = stream.getVideoTracks();
        if (vTracks.length > 0) {
          const trackDeviceId = vTracks[0].getSettings().deviceId;
          activeVideoDevice = allDevices.find(
            (d) => d.deviceId === trackDeviceId,
          );
          setSelectedCamera(trackDeviceId || "");
        }
      } else {
        activeVideoDevice = allDevices.find((d) => d.deviceId === cameraId);
        setSelectedCamera(cameraId);
      }

      if (
        activeVideoDevice &&
        activeVideoDevice.label.toLowerCase().includes("camo")
      ) {
        setVirtualCameraError(
          "Virtual cameras like Camo are not permitted. Please select your physical webcam.",
        );
        setPermissions({ camera: false, mic: !!micId });
        setIsChecking(false);
        // Clean up the rejected virtual stream
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      setVirtualCameraError("");

      if (!cameraId) {
        const vTracks = stream.getVideoTracks();
        if (vTracks.length > 0)
          setSelectedCamera(vTracks[0].getSettings().deviceId || "");
      } else {
        setSelectedCamera(cameraId);
      }

      if (!micId) {
        const aTracks = stream.getAudioTracks();
        if (aTracks.length > 0)
          setSelectedMic(aTracks[0].getSettings().deviceId || "");
      } else {
        setSelectedMic(micId);
      }

      setPermissions({ camera: true, mic: true });
      if (!cameraId && !micId) {
        toast.success("Hardware access granted.");
      }
    } catch (error) {
      console.error("Permission denied:", error);
      toast.error("You must allow camera and microphone access to proceed.");
      if (!permissions.camera) {
        setPermissions({ camera: false, mic: false });
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const handleDeviceChange = async () => {
      if (permissions.camera) {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(allDevices);
      }
    };
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [permissions.camera]);

  // Attach the stream to the video element once it mounts
  useEffect(() => {
    if (permissions.camera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [permissions.camera]);

  // Clean up the media stream when they leave the setup page
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const proceedToExam = () => {
    if (!permissions.camera || !permissions.mic) {
      toast.error("Complete the system check first.");
      return;
    }
    if (virtualCameraError) {
      toast.error(virtualCameraError);
      return;
    }
    // Push them to the actual locked-down exam interface
    router.push(`/student/exam/live/${inviteCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Pre-Exam System Check
          </h1>
          <p className="text-muted-foreground">
            Exam Code:{" "}
            <span className="font-mono font-bold text-blue-600">
              {inviteCode}
            </span>
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <MonitorCheck className="text-blue-600" /> Environment
              Verification
            </CardTitle>
            <CardDescription>
              ProctoGuard requires access to your webcam and microphone to
              monitor the exam. Your feed is processed locally and securely.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 grid md:grid-cols-2 gap-8">
            {/* Left Side: The Video Preview */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-full aspect-video bg-slate-900 rounded-lg overflow-hidden relative flex items-center justify-center border-4 border-slate-200 dark:border-slate-800">
                {isChecking && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm space-y-4">
                    <Loader2 className="animate-spin text-white size-10" />
                    <p className="text-white text-sm font-medium animate-pulse">
                      Initializing Hardware...
                    </p>
                  </div>
                )}
                {!permissions.camera ? (
                  isChecking ? (
                    <Skeleton className="w-full h-full" />
                  ) : (
                    <Camera className="text-slate-600 size-12 opacity-50" />
                  )
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                    style={{ transform: "scaleX(-1)" }} // Mirrors the video like a standard webcam
                  />
                )}
              </div>

              <Button
                onClick={() => requestPermissions()}
                disabled={isChecking || (permissions.camera && permissions.mic)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white transition-all h-11"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : permissions.camera ? (
                  "Hardware Verified"
                ) : (
                  "Grant Access"
                )}
              </Button>

              {/* Device Selectors */}
              {permissions.camera && devices.length > 0 && (
                <div className="w-full space-y-3 mt-4 text-left px-1">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Camera Source
                    </label>
                    <select
                      value={selectedCamera}
                      onChange={(e) =>
                        requestPermissions(e.target.value, selectedMic)
                      }
                      disabled={isChecking}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950"
                    >
                      {devices
                        .filter((d) => d.kind === "videoinput")
                        .map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || "Unknown Camera"}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Microphone Source
                    </label>
                    <select
                      value={selectedMic}
                      onChange={(e) =>
                        requestPermissions(selectedCamera, e.target.value)
                      }
                      disabled={isChecking}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950"
                    >
                      {devices
                        .filter((d) => d.kind === "audioinput")
                        .map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || "Unknown Microphone"}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: The Checklist */}
            <div className="space-y-6 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                  <div
                    className={`p-3 rounded-full ${
                      permissions.camera
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <Camera
                      className={`size-6 ${
                        permissions.camera
                          ? "text-green-600 dark:text-green-400"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        Webcam Access
                      </p>
                      {permissions.camera && !virtualCameraError ? (
                        <CheckCircle2 className="text-green-500 size-5" />
                      ) : virtualCameraError ? (
                        <AlertCircle className="text-red-500 size-5" />
                      ) : (
                        <AlertCircle className="text-amber-500 size-5" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {virtualCameraError ? (
                        <span className="text-red-500 font-medium">
                          {virtualCameraError}
                        </span>
                      ) : (
                        "Required for identity verification"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                  <div
                    className={`p-3 rounded-full ${
                      permissions.mic
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <Mic
                      className={`size-6 ${
                        permissions.mic
                          ? "text-green-600 dark:text-green-400"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        Microphone Access
                      </p>
                      {permissions.mic ? (
                        <CheckCircle2 className="text-green-500 size-5" />
                      ) : (
                        <AlertCircle className="text-amber-500 size-5" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Required for audio environment monitoring
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t dark:border-slate-800">
                <Button
                  onClick={proceedToExam}
                  disabled={!permissions.camera || !permissions.mic}
                  className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 transition-all"
                >
                  Start Proctored Exam
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
