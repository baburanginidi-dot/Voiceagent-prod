import { useState, useEffect, useRef, useCallback } from 'react';
// Fix: Removed import for non-existent 'LiveSession' type.
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../utils/audioUtils';
import type { AgentState, Message, StageId, User } from '../types';
import { STAGES } from '../constants';
import { saveSession } from '../utils/sessionManager';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const BUFFER_SIZE = 2048;

const getSystemInstruction = (
    userName: string, 
    currentStageId: StageId,
    history: Message[]
) => {
    const currentStage = STAGES.find(s => s.id === currentStageId) ?? STAGES[0];

    const historySummary = history.length > 0 
        ? `\n\n**Conversation History Summary:**\n${history.map(m => `${m.speaker}: ${m.text}`).join('\n')}`
        : '';

    const SCRIPTS: Record<StageId, { goal: string; script: string; transition: string; }> = {
        'INTRO': {
            goal: "Welcome the user and explain the process.",
            script: `Hi ${userName}! I'm Maya, your onboarding assistant. Nenu meeku anni quick ga and easy ga finish cheyyadaniki help chestanu. Congratulations on taking the next step toward your career journey! Ee process konni minutes matrame teesukuntundi – and by the end, you'll be fully ready to start learning. Start cheddama?`,
            transition: `If they agree, signal completion for the 'PROGRAM_VALUE_L1' stage.`
        },
        'PROGRAM_VALUE_L1': {
            goal: "Explain the practical learning approach at NxtWave.",
            script: `Chala colleges lo, students theory nerchukuntaru – like drawing an engine instead of driving it. But ikkada, we make learning practical. At NxtWave, students build projects that companies actually value. They gain real-world coding experience. Maa 6 Growth Cycles students ni beginner nunchi job-ready ki, step-by-step ga teesukeltayi. Would you like to hear more details, or shall we move on?`,
            transition: `Based on the user's answer, signal completion for 'PROGRAM_VALUE_L2' (if they want more details) or 'PAYMENT_STRUCTURE' (if they want to move on).`
        },
        'PROGRAM_VALUE_L2': {
             goal: "Provide more details on the practical skills and job outcomes.",
             script: `Great! Maa structured path ensure chestundi, prathi student ki practical skills hands-on experience vastundani. Students course ayyelopu 8-10 real-world projects chestaru. By the end of the course, mee pillalu 4.0 skills tho ready ga untaru, with salaries up to 12–18 LPA. Does that help you understand how this program stands out? Inka detail ga telusukovalante I can connect you to one of our human experts.`,
             transition: `After this, ask to proceed to the next step. If they agree, signal completion for the 'PAYMENT_STRUCTURE' stage.`
        },
        'PAYMENT_STRUCTURE': {
            goal: "Present the available payment options.",
            script: `We have four flexible payment options: Full Payment, Credit Card, Personal Loan, and 0% EMI through RBI-approved partners. Ee options lo meeku edi suit avuthundo cheppagalara?`,
            transition: `If the user selects 0% EMI, signal completion for 'NBFC'. For any other option, signal for 'END_FLOW'.`
        },
        'NBFC': {
            goal: "Explain what NBFCs are and how they help with 0% EMI.",
            script: `NBFCs, ante Non-Banking Financial Companies, RBI-approved partners, ivi students ki monthly 0% interest EMI plans tho pay cheyyadaniki help chestayi. Ee process antha fully digital, quick, and requires no physical documents. మీకు ఇది అర్థమైందా?`,
            transition: `After explaining and answering questions, ask to proceed. If they agree, signal completion for 'RCA'. If they seem very confused, explain an expert will call and then signal for 'END_FLOW'.`
        },
        'RCA': {
            goal: "Explain the need for a Right Co-Applicant for the EMI process.",
            script: `To complete the EMI process, we'll need a Right Co-Applicant – someone with a steady income and good credit history, CIBIL score above 750. Usually, idi a parent, guardian, or sibling who has a regular income. Do you have someone in your family with a stable income?`,
            transition: `If they say yes, signal completion for 'KYC'. If they are unsure or say no, explain that an expert will contact them and signal for 'END_FLOW'.`
        },
        'KYC': {
            goal: "Guide the user on the final KYC step.",
            script: `We're almost done! You'll soon receive a WhatsApp message with a link to our KYC portal. Please collect the required co-applicant documents – Aadhaar, PAN, and bank proof – before opening it. Once the KYC is submitted, it will be verified instantly, and your course activation won't be delayed. Do you have any questions about this?`,
            transition: `After answering questions, confirm they are ready to end the call. If they agree, signal completion for 'END_FLOW'.`
        },
        'END_FLOW': {
            goal: "Conclude the conversation.",
            script: `Thank you for your time, ${userName}. Your onboarding is complete, and an expert will contact you shortly if any follow-up is needed. Have a great day!`,
            transition: `This is the final step. End the conversation naturally.`
        }
    };
    
    const stageInfo = SCRIPTS[currentStageId];
    
    return `
You are Maya, a friendly, confident, and warm onboarding assistant for NxtWave. Your goal is to guide new user ${userName} through the onboarding process smoothly.

**Core Instructions:**
1.  **Language & Persona:** You MUST speak in "Tenglish" (70% Telugu, 30% English). Be encouraging, clear, and build trust.
2.  **Context is Key:** Ground your responses in the conversation history provided below. Avoid repeating information.
3.  **Active Listening:** If the user interrupts, pause, listen, answer concisely, and gently return to the current topic.

**Current Situation:**
*   **User:** ${userName}
*   **Current Stage:** ${currentStage.title}
*   **Goal for this Stage:** ${stageInfo.goal}
${historySummary}

**Your Task for this Stage:**
1.  Deliver the following information conversationally:
    > ${stageInfo.script}
2.  After delivering the information and answering any questions, you MUST ask the user if they are ready to proceed. Use a Tenglish phrase like "Manam next step ki veldama?".
3.  **Crucially, wait for a "yes" or affirmative response.** Once you get it, generate a natural, smooth transition sentence to the next stage.
4.  Immediately after your transition sentence, you MUST end your response with the special signal: \`[STAGE_COMPLETE:NEXT_STAGE_ID]\`. Replace NEXT_STAGE_ID with the appropriate ID based on the user's response and the logic provided here: ${stageInfo.transition}

**Example Flow:**
*   **You:** (delivers stage script) ... and that's how it works. మీకు ఇది అర్థమైందా?
*   **User:** Yes, I understand.
*   **You:** Manam next step ki veldama?
*   **User:** Yes.
*   **You:** Great, let's move on to the payment options now. [STAGE_COMPLETE:PAYMENT_STRUCTURE] 
`;
};


export const useConversationManager = (
    user: User, 
    initialStageId: StageId, 
    initialTranscripts: Message[]
) => {
    const [agentState, setAgentState] = useState<AgentState>('CONNECTING');
    const [isMuted, setIsMuted] = useState(false);
    const [transcripts, setTranscripts] = useState<Message[]>(initialTranscripts);
    const [currentStageId, setCurrentStageId] = useState<StageId>(initialStageId);

    const isMutedRef = useRef(isMuted);
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const stageIdRef = useRef(currentStageId);
    useEffect(() => {
        stageIdRef.current = currentStageId;
    }, [currentStageId]);
    
    const transcriptsRef = useRef(transcripts);
    useEffect(() => {
        transcriptsRef.current = transcripts;
    }, [transcripts]);

    // Fix: Replaced non-exported 'LiveSession' type with 'any'.
    const sessionPromise = useRef<Promise<any> | null>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const microphoneStream = useRef<MediaStream | null>(null);
    const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
    const sourceNode = useRef<MediaStreamAudioSourceNode | null>(null);

    const nextStartTime = useRef(0);
    const audioPlaybackQueue = useRef<AudioBufferSourceNode[]>([]);
    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');

    const stopMicrophone = useCallback(() => {
        if (microphoneStream.current) {
            microphoneStream.current.getTracks().forEach(track => track.stop());
            microphoneStream.current = null;
        }
        if (scriptProcessor.current) {
            scriptProcessor.current.disconnect();
            scriptProcessor.current = null;
        }
        if (sourceNode.current) {
            sourceNode.current.disconnect();
            sourceNode.current = null;
        }
        if (inputAudioContext.current && inputAudioContext.current.state !== 'closed') {
            inputAudioContext.current.close().catch(console.error);
            inputAudioContext.current = null;
        }
    }, []);

    const startMicrophone = useCallback(async () => {
        if (!sessionPromise.current) return;
        try {
            if (inputAudioContext.current && inputAudioContext.current.state !== 'closed') {
                await inputAudioContext.current.close();
            }
            inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
            microphoneStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            sourceNode.current = inputAudioContext.current.createMediaStreamSource(microphoneStream.current);
            scriptProcessor.current = inputAudioContext.current.createScriptProcessor(BUFFER_SIZE, 1, 1);
            
            scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
                if (isMutedRef.current) return;
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.current?.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };
            
            sourceNode.current.connect(scriptProcessor.current);
            scriptProcessor.current.connect(inputAudioContext.current.destination);
        } catch (error) {
            console.error("Error starting microphone:", error);
            setAgentState('ERROR');
        }
    }, [setAgentState]);


    const playAudio = useCallback(async (base64Audio: string) => {
        if (!outputAudioContext.current) return;
        
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            outputAudioContext.current,
            OUTPUT_SAMPLE_RATE,
            1,
        );

        nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current.currentTime);
        const source = outputAudioContext.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContext.current.destination);
        
        source.start(nextStartTime.current);
        nextStartTime.current += audioBuffer.duration;
        audioPlaybackQueue.current.push(source);

        source.onended = () => {
            audioPlaybackQueue.current = audioPlaybackQueue.current.filter(s => s !== source);
            if (audioPlaybackQueue.current.length === 0) {
                 setAgentState('LISTENING');
            }
        };

    }, []);

    const interruptAgent = useCallback(() => {
        audioPlaybackQueue.current.forEach(source => source.stop());
        audioPlaybackQueue.current = [];
        nextStartTime.current = 0;
        if(outputAudioContext.current) {
           nextStartTime.current = outputAudioContext.current.currentTime;
        }
        setAgentState('LISTENING');
    }, []);
    
    const disconnect = useCallback(() => {
        sessionPromise.current?.then(session => session.close()).catch(console.error);
        sessionPromise.current = null;
        stopMicrophone();
        if (outputAudioContext.current && outputAudioContext.current.state !== 'closed') {
            outputAudioContext.current.close().catch(console.error);
            outputAudioContext.current = null;
        }
        setAgentState('IDLE');
    }, [stopMicrophone]);

    const connect = useCallback(async (userName: string, stageId: StageId, history: Message[]) => {
        setAgentState('CONNECTING');
        
        if (!process.env.API_KEY) {
            console.error("Gemini API Key is missing. Please select an API key from the top right menu.");
            setAgentState('ERROR');
            return;
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            if (!outputAudioContext.current || outputAudioContext.current.state === 'closed') {
                outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
            }
            
            sessionPromise.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: getSystemInstruction(userName, stageId, history),
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: async () => {
                        setAgentState('LISTENING');
                        await startMicrophone();
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription.current += message.serverContent.inputTranscription.text;
                        }

                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                            if(agentState !== 'SPEAKING') setAgentState('SPEAKING');
                        }

                        if(message.serverContent?.interrupted){
                            interruptAgent();
                        }

                        if(message.serverContent?.turnComplete) {
                            const userText = currentInputTranscription.current.trim();
                            const agentText = currentOutputTranscription.current.trim();

                            const messagesToAdd: Message[] = [];
                            if (userText) {
                                messagesToAdd.push({ speaker: 'User', text: userText, timestamp: new Date().toLocaleTimeString() });
                            }
                            if (agentText) {
                                messagesToAdd.push({ speaker: 'Maya', text: agentText, timestamp: new Date().toLocaleTimeString() });
                            }
                            
                            if (messagesToAdd.length > 0) {
                                setTranscripts(prev => [...prev, ...messagesToAdd]);
                            }
                            
                            const stageMatch = agentText.match(/\[STAGE_COMPLETE:(.+)\]/);
                            if (stageMatch && stageMatch[1]) {
                                const nextStage = stageMatch[1].trim() as StageId;
                                if (nextStage !== stageIdRef.current) {
                                    setCurrentStageId(nextStage);
                                }
                            }

                            currentInputTranscription.current = '';
                            currentOutputTranscription.current = '';
                        }

                        const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audio) {
                            if(agentState !== 'SPEAKING') setAgentState('SPEAKING');
                            await playAudio(audio);
                        }
                    },
                    onclose: () => {
                        // The session can be closed by the server.
                        // We rely on the main useEffect cleanup for intentional disconnects.
                        if (agentState !== 'IDLE') {
                           setAgentState('IDLE');
                           stopMicrophone();
                        }
                    },
                    onerror: (e) => {
                        console.error('Gemini Live API Error:', e);
                        setAgentState('ERROR');
                        stopMicrophone();
                    }
                }
            });
            await sessionPromise.current;
        } catch (error) {
            console.error("Failed to connect to Gemini Live API", error);
            setAgentState('ERROR');
        }
    }, [startMicrophone, stopMicrophone, playAudio, interruptAgent, agentState]);


    useEffect(() => {
        // This effect manages the connection lifecycle, creating a new session for each stage.
        if (currentStageId === 'END_FLOW' && transcriptsRef.current.length > 0) {
            // Let the final message play out from the previous stage's connection if necessary
            // Or just show finish state.
            return;
        }

        connect(user.name, currentStageId, transcriptsRef.current);

        return () => {
            disconnect();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStageId, user.name]);

     useEffect(() => {
        saveSession({
            user,
            currentStageId,
            transcripts
        });
    }, [user, currentStageId, transcripts]);


    const toggleMute = () => setIsMuted(prev => !prev);

    return { agentState, isMuted, transcripts, currentStageId, toggleMute, disconnect };
};
