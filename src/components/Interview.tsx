"use client"
import React from 'react'
import { useEffect, useContext, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCompletion } from 'ai/react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import TextTransition from 'react-text-transition';
import WebCamera from '@/components/webcam';
import { Player } from '@lottiefiles/react-lottie-player';
import controlsImage from '@/../public/controls.svg';
import { Assess } from '@prisma/client'
import { useSearchParams } from 'next/navigation';
import { DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  interviewInfo : Assess
}

const Interview = ({interviewInfo}: Props) => {
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [redo, setRedo] = useState(false);
  const [interviewerTalking, setInterviewerTalking] = useState(false);
  const [questionDisplay, setQuestionDisplay] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);

  const router = useRouter();
  const speech = useRef<HTMLAudioElement | null>(null);
  const interviewerPlayer = useRef<any | null>(null);
  const ready = useRef(false);

  const [loading, setLoading] = useState(false);


  const [questions, setQuestions] = useState(
    interviewInfo.questions.map(question => ({
      question,
      answer: "",
      isAI: true,
      strengths: [], 
      improvements: [],
    }))
  );
  
  const { complete } = useCompletion({
    api: '/api/generateQues',
    onFinish: (prompt, completion) => {
      textToSpeech(completion);
    },
  });

  const parseAudio = async (blob : Blob) => {
    const res = await fetch('/api/speechToText', {
      method: 'POST',
      body: blob,
    });

    const result = await res.json();

    console.log(result, questions)
    
    const newQuestions = questions.slice();

    console.log(questions.slice())
    console.log(":}")
    console.log(newQuestions)

    newQuestions[questionsAnswered]['answer'] = result.answer;

    setQuestions(newQuestions);
    setQuestionsAnswered(questionsAnswered + 1);

    console.log(result.answer);
  };

  const askQuestion = () => {
    let requestBody: any = {};
    if (questionsAnswered == 0) {
      requestBody = {
        queryType: 'firstMessage',
        jobProfile: interviewInfo.jobProfile,
        companyName: interviewInfo.companyName,
        name: interviewInfo.name,
        question: questions[0].question,
      };
    } else if (questionsAnswered < interviewInfo.questions.length) {
      requestBody = {
        queryType: 'subsequentMessage',
        jobProfile: interviewInfo.jobProfile,
        companyName: interviewInfo.companyName,
        name: interviewInfo.name,
        question: questions[questionsAnswered].question,
        prevQuestion: questions[questionsAnswered - 1].question,
        prevAnswer: questions[questionsAnswered - 1].answer,
      };
    } else {
      requestBody = {
        queryType: 'lastMessage',
        jobProfile: interviewInfo.jobProfile,
        companyName: interviewInfo.companyName,
        name: interviewInfo.name,
        prevQuestion: questions[questionsAnswered - 1].question,
        prevAnswer: questions[questionsAnswered - 1].answer,
      };
    }
    complete(requestBody);
  };

  const textToSpeech = async (input: string) => {
    const res = await fetch('/api/textToSpeech', {
      method: 'POST',
      body: JSON.stringify({
        text: input,
      }),
    });

    const result = await res.arrayBuffer();

    const blob = new Blob([result], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);

    audio.addEventListener('ended', function () {
      setInterviewerTalking(false);
      interviewerPlayer.current.setSeeker(239, false);
      if (questionsAnswered < questions.length) {
        startRecording();
        setQuestionDisplay(questions[questionsAnswered].question);
      } else {
        setInterviewComplete(true);
      }
    });

    if (ready.current) {
      audio.play();
      interviewerPlayer.current.play();
      setInterviewerTalking(true);
    } else {
      speech.current = audio;
    }
  };

  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder,
  } = useAudioRecorder({
    noiseSuppression: true,
    echoCancellation: true,
  });

  const redoQuestion = () => {
    setRedo(true);
    stopRecording();
  };

  useEffect(() => {
    setQuestionDisplay(
      'Welcome to your Interview, ' + interviewInfo.name.replace(/ .*/, '')
    );
  }, []);

  useEffect(() => {
    if (!recordingBlob) {
      return;
    }

    if (redo) {
      setRedo(false);
      startRecording();
      return;
    }

    parseAudio(recordingBlob);
  }, [recordingBlob]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      askQuestion();
    }, 1000); 
  
    return () => clearTimeout(timeoutId); 
  }, [questionsAnswered]);
  
  
  function delay(time : number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  const onSubmit = async () => {
    try {
        setLoading(true);
        console.log("reached the submission area")
        console.log(questions)
        const response1 = await fetch("/api/generateQues", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: {
              queryType: "overall",
              jobProfile: interviewInfo.jobProfile,
              companyName: interviewInfo.companyName,
              jobtype: interviewInfo.jobtype,
              jobRequirements: interviewInfo.jobRequirements,
              questions: questions,
            },
          }),
        });
        const response2 = questions.map((q) => {
          console.log(q.question, q.answer, ":)")
          return fetch("/api/generateQues", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: {
                queryType: "feedback",
                jobProfile: interviewInfo.jobProfile,
                companyName: interviewInfo.companyName,
                jobtype: interviewInfo.jobtype,
                jobRequirements: interviewInfo.jobRequirements,
                questions: [{
                  question: q.question,
                  answer: q.answer,
                }],
              },
            }),
          });
        });
        // Promise.all to wait for all fetch requests to complete
        const response2Promise = await Promise.all(response2);
        const response3 = await fetch("/api/generateQues", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: {
              queryType: "generateAnalytics",
              jobProfile: interviewInfo.jobProfile,
              companyName: interviewInfo.companyName,
              jobtype: interviewInfo.jobtype,
              jobRequirements: interviewInfo.jobRequirements,
              questions: questions.map((q) => ({
                question: q.question,
                answer: q.answer,
              })),
            },
          }),
        });
        console.log(response1.ok)
        response2.forEach(async (res, index) => {
          const response = await res; // Await the promise to get the actual Response
          console.log(`Response for question ${index + 1}:`, response.ok);
        });        
        console.log(response3.ok)
        const overallData = await response1.json();
        const feedbackData = await Promise.all(response2.map(async (resPromise) => {
          const res = await resPromise;
          return await res.json();
        }));        
        const analyticsData = await response3.json();
        console.log(overallData)
        console.log(feedbackData)
        console.log(analyticsData)

        const combinedQuestions = questions.map((question, index) => ({
          ...question,
          ...feedbackData[index],
        }));

        const response = await fetch('/api/feedbackStore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: interviewInfo.name,
            jobProfile: interviewInfo.jobProfile,
            companyName: interviewInfo.companyName,
            jobtype: interviewInfo.jobtype,
            jobRequirements: interviewInfo.jobRequirements,
            questions: combinedQuestions,
            level: interviewInfo.level,
            overview: overallData.feedback, // Assuming 'feedback' contains the overview string
            analytics: analyticsData.interviewFeedbackAnalyticsRadar,
          }),
        });        
        if (response.ok) {
          console.log("Request was successful!");
          await new Promise(resolve => setTimeout(resolve, 1000));
          const responseData = await response.json();
          console.log("Response:", responseData);
        
          const { results } = responseData;
          const { id } = results;
          
          if (id) {
            console.log("Extracted id:", id);
            router.push(`/feedback?id=${id}`);
          } else {
            console.error("Error: Unable to extract id from the response.");
          }
        } else {
          console.error("Request failed with status:", response.status);
        }
      } catch (error) {
      console.error('Error submitting interview data:', error);
      console.error(error);
      alert("Error submitting interview data.");
    } finally {
      setLoading(false); // Set loading to false when the submission completes (either success or failure)
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    ready.current = true;
  
    if (speech.current !== null) {
      delay(1000).then(() => {
        speech.current?.play();
        if (interviewerPlayer.current !== null) {
          interviewerPlayer.current?.play();
          setInterviewerTalking(true);
        }
      });
    }
  };

  return (
      <div className='p-8 flex flex-col max-w-6xl mx-auto'>
       {loading ? (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-tl from-violet-400 to-violet-300 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-violet-600 bg-opacity-75 flex items-center justify-center">
          <p className="text-white text-5xl">Submitting...</p>
        </div>
       ):(
        <div className='flex flex-col'>
           <div className="flex bg-secondary mx-6 mt-6 items-center rounded-3xl p-4">
          <div className="max-w-full max-h-120px flex flex-col-reverse">
            <div className="w-20vw border-b-0.5rem border-tl-gradient"></div>
            <h5 className="font-bold text-3xl">
              <span className="transition text-primary">{questionDisplay}</span>
            </h5>
          </div>
          <div className="ml-auto bg-gradient-tr-bl rounded-l-md flex items-center justify-center h-3rem w-10.45rem">
            <p className='p-3 whitespace-nowrap px-4 mr-3 font-semibold shadow-sm shadow-black border-none bg-gradient-to-tl from-pink-400 via-purple-400 to-indigo-500 text-white rounded-xl'>{interviewInfo.questions.length - questionsAnswered} {interviewInfo.questions.length - questionsAnswered === 1 ? 'question' : 'questions'} left</p>
            <Dialog open={modalOpen}>
          <DialogTrigger asChild className='p-3 px-4 font-semibold shadow-md shadow-black border-none bg-gradient-to-tl from-pink-400 via-purple-400 to-indigo-500 text-white rounded-xl h-12'>
            <Button className=''><Info className=''/></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className='text-2xl'>Welcome To Your Virtual Interview Style Assessment</DialogTitle>
            <DialogHeader>
              <div className='flex flex-col gap-2'>
                <p>Once the interview starts, the interviewer will begin by welcoming
                you and asking you the first question. Here are some tips for the
                best interview experience:
                </p>
                <ul className="list-disc pl-6">
                  <li>Ensure you are in an environment with minimal background noise.</li>
                  <li>Talk clearly at a regular pace in the direction of your microphone.</li>
                  <li>Answer the questions appropriately and stay on topic.</li>
                </ul>
                <p>Best of luck! We'll see you afterwards with your feedback.</p>
              </div>
            </DialogHeader> 
            <DialogFooter>
              <DialogClose>
                <Button className={'p-5 shadow-md shadow-black border-none bg-gradient-to-br from-violet-300 to-violet-500 text-white rounded-xl'} onClick={closeModal}>
                    Let's Begin
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
            </Dialog>
          </div>
            </div>
            <div className='rounded-lg flex justify-center flex-row p-6 px-0 gap-6'>
            <div className='bg-secondary relative rounded-3xl p-6 flex flex-col justify-center items-center'>
              <Player loop src='/Speech.json' className='w-80' ref={interviewerPlayer} speed={1.25}></Player>
              <Button className='absolute bottom-6 left-6 p-3 px-4 font-semibold shadow-sm shadow-black border-none bg-gradient-to-tl from-pink-400 via-purple-400 to-indigo-500 text-white rounded-xl'>AI Interviewer</Button>
            </div>
              <div className='relative'>
                <WebCamera/>
                <Button className={cn('absolute top-6 right-6 p-3 px-4 font-semibold shadow-sm shadow-black border-none bg-gradient-to-tl from-pink-400 via-purple-400 to-indigo-500 text-white rounded-xl', { hidden: interviewerPlayer ? '' : 'hidden' })}>
                  {interviewerTalking ? 'Please wait for the Interviewer to finish speaking' : 'You may answer the question now'}
                </Button>
                <Button className='absolute bottom-6 left-6 p-3 px-4 font-semibold shadow-sm shadow-black border-none bg-gradient-to-tl from-pink-400 via-purple-400 to-indigo-500 text-white rounded-xl'>
                  {interviewInfo.name}
                </Button>
              </div>
            </div>
            <div className="flex flex-row justify-between w-full">
              <div className="mt-4 ml-6 gap-4 flex flex-row">
                <Button className='p-5 shadow-md shadow-black border-none bg-gradient-to-r text-white rounded-xl from-rose-700 to-pink-600'  onClick={redoQuestion}>
                  Redo
                </Button>
                <Button type='submit' className='p-5 shadow-md shadow-black border-none bg-gradient-to-r text-white rounded-xl from-teal-700 to-teal-600'  onClick={interviewComplete ? () => onSubmit : stopRecording}>
                  {questionsAnswered === interviewInfo.questions.length ? 'Next Question' : 'Submit Answer'}
                </Button>
                <Button className='p-5 shadow-md shadow-black border-none bg-gradient-to-r text-white rounded-xl from-purple-700 to-pink-400' onClick={onSubmit} type='submit'>
                  End Interview
                </Button>
              </div>
            </div>
        </div>
       )}
      </div>
  );
}

export default Interview