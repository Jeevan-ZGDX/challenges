'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { fetchStage, analyzeAudio } from '@/services/api';
import { AnalysisResponse, Stage } from '@/types';
import { useProgress } from '@/hooks/useProgress';

interface Params {
  params: { id: string };
}

export default function PracticePage({ params }: Params) {
  const stageId = Number(params.id);
  const [stage, setStage] = useState<Stage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaSupported, setMediaSupported] = useState(true);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const router = useRouter();
  const { saveAttempt, selectedRole } = useProgress();

  useEffect(() => {
    fetchStage(stageId)
      .then(setStage)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [stageId]);

  useEffect(() => {
    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
      setMediaSupported(false);
    }
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const durationSeconds = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0;
        try {
          const analysis = await analyzeAudio({ stageId, audioBlob: blob, durationSeconds, role: selectedRole });
          saveAttempt(analysis);
          setResult(analysis);
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e));
        }
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      // stop all tracks
      const tracks = (recorder as any).stream?.getTracks?.();
      if (tracks) tracks.forEach((t: MediaStreamTrack) => t.stop());
    }
    setIsRecording(false);
  }

  if (!stage) {
    return (
      <AppShell title="Practice" subtitle="Loading stage...">
        <div className="glass-panel rounded-3xl p-8 text-center">{error ? error : 'Loading...'}</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Practice — Stage ${stage.id}`} subtitle={stage.title}>
      <div className="space-y-6">
        <div className="glass-panel rounded-3xl p-8">
          <h4 className="mb-4 text-sm uppercase text-slate-400">Read the passage aloud</h4>
          <p className="whitespace-pre-wrap rounded-md border border-white/8 bg-white/3 p-4 text-slate-200">{stage.paragraph}</p>

          <div className="mt-6 flex gap-3">
            {!mediaSupported ? (
              <div className="text-sm text-red-300">Your browser does not support microphone access.</div>
            ) : isRecording ? (
              <button onClick={stopRecording} className="btn-cta">Stop recording</button>
            ) : (
              <button onClick={startRecording} className="btn-cta">Start recording</button>
            )}
            <button onClick={() => router.push('/')} className="btn-ghost">Back</button>
          </div>

          {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}

          {result ? (
            <div className="mt-6 space-y-6 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-slate-200">
              <div>
                <h5 className="mb-2 font-semibold">Analysis results</h5>
                <p className="font-medium">Final score: {result.final_score}%</p>
                <p className={result.passed ? 'text-emerald-300' : 'text-amber-300'}>
                  {result.passed ? 'Passed! Next stage unlocked.' : 'Not yet passed. Aim for 90% or above with good pace to unlock the next stage.'}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <h6 className="mb-2 text-sm font-semibold text-slate-100">Original passage</h6>
                  <p className="whitespace-pre-wrap text-slate-300">{stage.paragraph}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <h6 className="mb-2 text-sm font-semibold text-slate-100">Transcribed speech</h6>
                  <p className="whitespace-pre-wrap text-slate-300">{result.transcript || 'No transcription available.'}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Missing words</p>
                  <p className="text-slate-300">{result.missing_words.length ? result.missing_words.join(', ') : 'None'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Extra words</p>
                  <p className="text-slate-300">{result.extra_words.length ? result.extra_words.join(', ') : 'None'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Repeated words</p>
                  <p className="text-slate-300">{result.repeated_words.length ? result.repeated_words.join(', ') : 'None'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Difficult words</p>
                  <p className="text-slate-300">{result.difficult_words.length ? result.difficult_words.map((item) => item.word).join(', ') : 'None'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">Suggestions</p>
                <ul className="list-disc pl-5 text-slate-300">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
