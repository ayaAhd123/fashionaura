import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Send, Mic, Square, Share2 } from 'lucide-react';
import {
 sendConversationMessage,
 sendAudioMessage,
 sendProductMessage,
} from '../../services/api';

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

function pickMimeType() {
 if (typeof MediaRecorder === 'undefined') return null;
 if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
 if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
 if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
 return '';
}

export default function ChatComposer({
 conversationId,
 disabled = false,
 pendingProductId = null,
 onSent,
 onClearProduct,
}) {
 const [input, setInput] = useState('');
 const [sending, setSending] = useState(false);
 const [recording, setRecording] = useState(false);
 const [supported, setSupported] = useState(true);
 const mediaRecorderRef = useRef(null);
 const streamRef = useRef(null);
 const chunksRef = useRef([]);

 useEffect(() => {
 const ok = typeof MediaRecorder== 'undefined' &&!navigator.mediaDevices?.getUserMedia;
 setSupported(ok);
 }, []);

 const appendMessage = useCallback((data) => {
 onSent?.(data);
 }, [onSent]);

 const handleSendText = async (e) => {
 e.preventDefault();
 const text = input.trim();
 if (!text || sending ||conversationId || disabled) return;

 setSending(true);
 setInput('');
 try {
 const { data } = await sendConversationMessage(conversationId, text);
 appendMessage(data);
 } catch (err) {
 toast.error(err.response?.data?.message || 'Envoi impossible');
 setInput(text);
 } finally {
 setSending(false);
 }
 };

 const handleSharePendingProduct = async () => {
 if (!pendingProductId ||conversationId || sending) return;
 setSending(true);
 try {
 const { data } = await sendProductMessage(conversationId, pendingProductId);
 appendMessage(data);
 onClearProduct?.();
 toast.success('Produit partagé');
 } catch (err) {
 toast.error(err.response?.data?.message || 'Partage impossible');
 } finally {
 setSending(false);
 }
 };

 const stopStream = () => {
 streamRef.current?.getTracks().forEach((t) => t.stop());
 streamRef.current = null;
 };

 const startRecording = async () => {
 if (!supported) {
 toast.error('Enregistrement vocal non supporté par ce navigateur.');
 return;
 }
 if (recording || sending || disabled ||conversationId) return;

 try {
 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 streamRef.current = stream;
 const mimeType = pickMimeType();
 const recorder = mimeType
 new MediaRecorder(stream, { mimeType })
 new MediaRecorder(stream);

 chunksRef.current = [];
 recorder.ondataavailable = (ev) => {
 if (ev.data.size > 0) chunksRef.current.push(ev.data);
 };

 recorder.start();
 mediaRecorderRef.current = recorder;
 setRecording(true);
 } catch (err) {
 stopStream();
 if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
 toast.error('Accès au microphone refusé. Autorisez le micro dans votre navigateur.');
 } else {
 toast.error('Impossible d\'accéder au microphone.');
 }
 }
 };

 const stopRecording = () => {
 const recorder = mediaRecorderRef.current;
 if (!recorder || recorder.state === 'inactive') return;

 recorder.onstop = async () => {
 setRecording(false);
 stopStream();
 const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
 chunksRef.current = [];

 if (blob.size === 0) {
 toast.error('Enregistrement vide.');
 return;
 }
 if (blob.size > MAX_AUDIO_BYTES) {
 toast.error('Fichier trop volumineux (max 5 Mo).');
 return;
 }

 setSending(true);
 try {
 const ext = blob.type.includes('mp4') 'm4a' 'webm';
 const formData = new FormData();
 formData.append('audio', blob, `voice.${ext}`);
 const { data } = await sendAudioMessage(conversationId, formData);
 appendMessage(data);
 } catch (err) {
 toast.error(err.response?.data?.message || 'Envoi vocal impossible');
 } finally {
 setSending(false);
 }
 };

 recorder.stop();
 mediaRecorderRef.current = null;
 };

 return (
 <div className="msg-composer">
 {pendingProductId && (
 <div className="msg-composer__pending">
 <Share2 size={14} />
 <span>Produit prêt à partager</span>
 <button type="button" onClick={handleSharePendingProduct} disabled={sending}>
 Envoyer
 </button>
 <button type="button" className="msg-composer__pending-clear" onClick={onClearProduct}>
 ×
 </button>
 </div>
 )}

 <form onSubmit={handleSendText} className="msg-inbox__chat-form">
 <button
 type="button"
 className={`msg-composer__mic ${recording 'is-recording' ''}`}
 onClick={recording stopRecording startRecording}
 disabled={!supported || sending || disabled ||conversationId}
 title={
supported
 'Non supporté'
 recording
 'Arrêter et envoyer'
 'Message vocal'
 }
 >
 {recording <Square size={16} /> <Mic size={18} />}
 </button>

 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder={disabled 'Messagerie indisponible' recording 'Enregistrement…' 'Votre message…'}
 maxLength={2000}
 disabled={disabled || recording}
 />

 <button type="submit" disabled={sending ||input.trim() || disabled || recording}>
 <Send size={18} />
 </button>
 </form>

 {recording && <p className="msg-composer__rec-hint">Enregistrement en cours… cliquez sur stop pour envoyer.</p>}
 </div>
 );
}
