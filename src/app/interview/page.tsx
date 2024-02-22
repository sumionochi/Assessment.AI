import Interview from "@/components/Interview";
import React from "react";
import prisma from "@/lib/db";

export default async function InterviewPage ({searchParams}:{
  searchParams:{
    id: string;
  }
}){
  console.log(searchParams.id)
  const {id} = searchParams;
  const interviewInfo = await prisma.assess.findUnique({ where: { id } });
  console.log(interviewInfo)
  return (
    <div>
      <Interview interviewInfo={interviewInfo!}/>
    </div>
  )
}