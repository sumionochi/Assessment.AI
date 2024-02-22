import React from 'react'
import prisma from "@/lib/db";
import FeedbackDisplay from '@/components/FeedbackDisplay';

type Props = {}

export default async function Feedback ({searchParams}:{
  searchParams:{
    id: string;
  }
}){
  const {id} = searchParams;
  const resultInfo = await prisma.automated_Result.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          strengths: true,
          improvements: true,
        },
      },
      analytics: true,
    },
  });
  console.log("here is assessment result",resultInfo)
  return (
    <div><FeedbackDisplay resultInfo={resultInfo!}/></div>
  )
}