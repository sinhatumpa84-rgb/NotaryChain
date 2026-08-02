import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineXMark as CloseIcon,
  HiOutlineCamera as CamIcon,
  HiOutlineCheckCircle as CheckIcon,
  HiOutlineExclamationTriangle as WarnIcon,
  HiOutlineShieldCheck as ShieldIcon,
  HiOutlineSparkles as SparkleIcon
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const FaceScannerModal = ({ isOpen, onClose, mode = 'login', onSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Align your face inside the circle');
  const [matchResult, setMatchResult] = useState(null);
  
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const startCamera = useCallback(async () => {
    try {
      setCameraActive(false);
      setStatusMsg('Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          setStatusMsg(mode === 'register' ? 'Click Capture to Register Face ID' : 'Position face to Login with Face ID');
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setStatusMsg('Camera access denied or unavailable');
      toast.error('Unable to access camera. Please allow webcam permissions.');
    }
  }, [mode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setMatchResult(null);
    }
    return () => stopCamera();
  }, [isOpen]);

  const captureFrameBase64 = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handleProcessScan = async () => {
    const imageBase64 = captureFrameBase64();
    if (!imageBase64) {
      toast.error('Could not capture frame from webcam');
      return;
    }

    setScanning(true);
    setStatusMsg('Extracting Face Vectors & Computing Similarity...');

    try {
      if (mode === 'register') {
        const { data } = await axiosInstance.post('/face/register', { imageBase64 });
        setMatchResult({ success: true, message: 'Face ID Enrolled Successfully!' });
        toast.success('Face ID Registered!');
        if (onSuccess) onSuccess(data);
        setTimeout(() => onClose(), 1500);
      } else {
        // Face ID Login
        const { data } = await axiosInstance.post('/face/login', { imageBase64 });
        const resultData = data?.data || data;

        if (resultData?.tokens?.accessToken) {
          localStorage.setItem('accessToken', resultData.tokens.accessToken);
          localStorage.setItem('refreshToken', resultData.tokens.refreshToken || '');
          if (resultData.user) updateUser(resultData.user);
          
          setMatchResult({
            success: true,
            name: resultData.user?.name || resultData.user?.firstName || 'User',
            score: resultData.faceMatch?.confidencePercentage || 95.0
          });
          
          toast.success(`Face ID Authenticated! Welcome ${resultData.user?.firstName || ''}`);
          setTimeout(() => {
            onClose();
            navigate('/dashboard');
          }, 1200);
        } else {
          setMatchResult({ success: false, message: 'Face Not Recognized' });
          setStatusMsg('Face Match Failed. Try again or log in with password.');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Face recognition failed';
      setMatchResult({ success: false, message: msg });
      setStatusMsg(msg);
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldIcon size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {mode === 'register' ? 'Enroll Face ID' : 'Face ID Authentication'}
                </h3>
                <p className="text-xs text-slate-400">AI Vector Similarity Matching</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          {/* Webcam Viewport */}
          <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className={`w-52 h-64 rounded-[50%] border-2 transition-all duration-300 ${
                scanning
                  ? 'border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.6)] animate-pulse'
                  : matchResult?.success
                  ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.6)]'
                  : matchResult?.success === false
                  ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]'
                  : 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
              }`}>
                {/* Laser scan line when scanning */}
                {scanning && (
                  <motion.div
                    className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_#818cf8]"
                    animate={{ y: [0, 240, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  />
                )}
              </div>
            </div>

            {/* Overlay Status Badge */}
            <div className="absolute bottom-3 left-3 right-3 py-1.5 px-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-center text-xs text-slate-300">
              {statusMsg}
            </div>
          </div>

          {/* Result Alert */}
          {matchResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-xl border flex items-center gap-3 text-sm ${
                matchResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {matchResult.success ? <CheckIcon size={20}/> : <WarnIcon size={20}/>}
              <div>
                <p className="font-semibold">{matchResult.message || (matchResult.success ? 'Verified' : 'Access Denied')}</p>
                {matchResult.score && <p className="text-xs opacity-80">Cosine Confidence: {matchResult.score}%</p>}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessScan}
              disabled={!cameraActive || scanning}
              className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {scanning ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing Vector...</>
              ) : (
                <><CamIcon size={18}/> {mode === 'register' ? 'Capture & Register' : 'Scan & Login'}</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FaceScannerModal;
