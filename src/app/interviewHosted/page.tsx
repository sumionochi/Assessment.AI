import Interview from "@/components/Interview";
import React from "react";
import prisma from "@/lib/db";
import InterviewHosted from "@/components/InterviewHosted";

export default async function InterviewPage ({searchParams}:{
  searchParams:{
    id: string;
  }
}){
  console.log(searchParams.id)
  const {id} = searchParams;
  const interviewInfo = await prisma.automated_Assess.findUnique({ where: { id } });
  console.log(interviewInfo)
  return (
    <div>
      <InterviewHosted interviewInfo={interviewInfo!}/>
    </div>
  )
}