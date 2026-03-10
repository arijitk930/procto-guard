"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Maximize, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { examApi } from "@/api/exam.api";

// 1. Define the expected shape of your Exam Data
interface ExamDetails {
  title: string;
  timeLimit: number;
  questions: Array<{
    questionText: string;
    options: string[];
    marks?: number;
  }>;
  [key: string]: unknown;
}

// 2. Define the expected Error shape from Axios
interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function LiveExamSandbox() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.code as string;

  const [isSecureMode, setIsSecureMode] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [examData, setExamData] = useState<ExamDetails | null>(null);
  const sandboxRef = useRef<HTMLDivElement>(null);

  // NEW: Exam Interactive States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const joinMutation = useMutation({
    mutationFn: (code: string) => examApi.joinExam(code),
    // FIX: Replaced 'any' with a Record type to satisfy strict ESLint rules
    onSuccess: async (payload: Record<string, unknown>) => {
      // FIX: Tell TypeScript to treat the extracted data as ExamDetails
      const actualExam = (payload?.data || payload) as ExamDetails;

      setExamData(actualExam);

      // FIX: Initialize the timer state right here, avoiding the useEffect cascade!
      if (actualExam.timeLimit) {
        setTimeLeft(actualExam.timeLimit * 60);
      }

      try {
        await document.documentElement.requestFullscreen();
        setIsSecureMode(true);
        toast.success(
          `Secure mode activated. Starting: ${actualExam?.title || "Exam"}`,
        );
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to enter fullscreen. Please ensure your browser allows it.",
        );
      }
    },
    onError: (error: ApiError) => {
      const msg =
        error.response?.data?.message || "Invalid or expired exam code.";
      toast.error(msg);
    },
  });

  const handleLaunch = () => {
    joinMutation.mutate(inviteCode);
  };

  // The Anti-Cheat Event Listeners
  useEffect(() => {
    if (!isSecureMode) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsSecureMode(false);
        setWarnings((prev) => prev + 1);
        toast.error("You exited fullscreen! This has been logged.", {
          duration: 5000,
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setWarnings((prev) => prev + 1);
        toast.error("Tab switch detected! Return to the exam immediately.", {
          duration: 5000,
        });
      }
    };

    const handleWindowBlur = () => {
      setWarnings((prev) => prev + 1);
      toast.error("Window focus lost! Return to the exam immediately.", {
        duration: 5000,
      });
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isSecureMode]);

  // NEW: The Live Countdown Timer (Fixed Cascading Renders)
  useEffect(() => {
    // If we aren't in secure mode, or the timer is finished/uninitialized, do nothing
    if (!isSecureMode || timeLeft === null || timeLeft <= 0) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timerInterval);
          toast.info("Time is up! Auto-submitting exam...");
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000); // Ticks every 1000ms (1 second)

    // Cleanup the interval when the component unmounts or secure mode stops
    return () => clearInterval(timerInterval);
  }, [isSecureMode, timeLeft]); // Notice we removed timeLeft from the dependency array to prevent rapid re-renders

  // Helper to format seconds into MM:SS
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // UI State 1: The Gatekeeper
  if (!isSecureMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-center space-y-6 p-8">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-900/30 rounded-full">
              <Maximize className="text-blue-500 size-10" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2 text-white">
              Ready to Begin?
            </h1>
            <p className="text-slate-400 text-sm">
              This exam requires a secure, fullscreen environment. Closing the
              tab, exiting fullscreen, or switching applications will be logged
              as an academic violation.
            </p>
          </div>
          {warnings > 0 && (
            <div className="bg-red-950/50 text-red-400 p-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2">
              <AlertTriangle size={18} />
              You have {warnings} security warning(s).
            </div>
          )}
          <Button
            onClick={handleLaunch}
            disabled={joinMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg transition-all"
          >
            {joinMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting to Secure Server...
              </>
            ) : (
              "Launch Secure Mode"
            )}
          </Button>
        </Card>
      </div>
    );
  }

  // UI State 2: The Locked-Down Exam Interface
  return (
    <div
      ref={sandboxRef}
      className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden"
    >
      {/* Exam Header */}
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="font-bold text-lg flex items-center gap-2">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm tracking-widest">
            PG
          </span>
          Exam Session: {inviteCode}
        </div>

        {/* Anti-Cheat Status & Live Timer */}
        <div className="flex items-center gap-6">
          {warnings > 0 && (
            <div className="flex items-center gap-2 text-red-600 font-bold animate-pulse">
              <ShieldAlert size={20} />
              {warnings} Warning(s)
            </div>
          )}
          <div
            className={`font-mono text-xl font-bold ${
              timeLeft !== null && timeLeft < 300
                ? "text-red-500 animate-pulse"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              // Later: Replace with real submit logic
              document.exitFullscreen();
              toast.success("Exam submitted manually!");
            }}
          >
            Submit & Exit
          </Button>
        </div>
      </header>

      {/* Main Exam Content Area (Interactive UI) */}
      <main className="flex-1 p-4 md:p-8 flex justify-center overflow-y-auto">
        <div className="w-full max-w-4xl flex flex-col h-full">
          {examData?.questions && examData.questions.length > 0 ? (
            <>
              {/* Question Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-500">
                  Question {currentQuestionIndex + 1} of{" "}
                  {examData.questions.length}
                </h2>
                <div className="text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full">
                  Marks: {examData.questions[currentQuestionIndex].marks || 1}
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-8 leading-relaxed">
                {examData.questions[currentQuestionIndex].questionText}
              </h3>

              {/* Options Grid */}
              <div className="space-y-4 mb-8 flex-1">
                {examData.questions[currentQuestionIndex].options.map(
                  (option: string, idx: number) => (
                    <label
                      key={idx}
                      className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        answers[currentQuestionIndex] === option
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option}
                        checked={answers[currentQuestionIndex] === option}
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [currentQuestionIndex]: option,
                          }))
                        }
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-4 text-lg font-medium text-slate-700 dark:text-slate-300">
                        {option}
                      </span>
                    </label>
                  ),
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 border-t dark:border-slate-800 mt-auto">
                <Button
                  variant="outline"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="w-32"
                >
                  Previous
                </Button>

                {currentQuestionIndex === examData.questions.length - 1 ? (
                  <Button
                    className="w-32 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      // 1. Exit fullscreen
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      }

                      // 2. In the future: await api.submitExam(answers, warnings)

                      // 3. Redirect to success page
                      toast.success("Exam submitted successfully!");
                      router.push(
                        `/student/exam/success/${inviteCode}?warnings=${warnings}`,
                      );
                    }}
                  >
                    Finish Exam
                  </Button>
                ) : (
                  <Button
                    className="w-32 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xl text-slate-500">
                No questions found for this exam.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
