'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface RecorderState {
  isRecording: boolean;
  durationSeconds: number;
  isSupported: boolean;
  error?: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  reset: () => void;
}

export function useRecorder(): RecorderState {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState<string>();
  const isSupported = typeof window !== 'undefined' && !!window.MediaRecorder;

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    clearTimer();
    cleanupStream();
  }, [cleanupStream, clearTimer]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('This browser does not support audio recording.');
      return;
    }

    try {
      setError(undefined);
      clearTimer();
      cleanupStream();
      chunksRef.current = [];
      setDurationSeconds(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorderOptions = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : undefined;
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      intervalRef.current = window.setInterval(() => {
        setDurationSeconds((previous) => previous + 1);
      }, 1000);
    } catch (recordingError) {
      setError(recordingError instanceof Error ? recordingError.message : 'Unable to access microphone.');
      cleanupStream();
    }
  }, [cleanupStream, clearTimer, isSupported]);

  const stopRecording = useCallback(() => {
    return new Promise<Blob | null>((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        clearTimer();
        cleanupStream();
        mediaRecorderRef.current = null;
        setIsRecording(false);
        resolve(new Blob(chunksRef.current, { type: 'audio/webm' }));
      };

      recorder.stop();
    });
  }, [cleanupStream, clearTimer]);

  const reset = useCallback(() => {
    chunksRef.current = [];
    setDurationSeconds(0);
    setError(undefined);
  }, []);

  return {
    isRecording,
    durationSeconds,
    isSupported,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}
