import { auth, clerkClient } from "@clerk/nextjs";
import { Metadata } from "next";
import React from 'react';
import prisma from "@/lib/db";
import { Medal } from "lucide-react";
import RankedDisplay from "@/components/RankedDisplay";

export const metadata: Metadata = {
  title: 'AssessMe.AI - Ranking Page'
}

type Props = {}

const RankedAssessments = async (props: Props) => {
  const {userId} = auth();
  const userlist = await clerkClient.users.getUserList({limit: 500});
  const userIdArray = userlist.map(user => ({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
  }));
    
  if (!userId) throw Error("userId undefined");
  

  const EveryResult = await prisma.automated_Result.findMany({
    include: {
      questions: {
        include: {
          strengths: true,
          improvements: true,
        },
      },
      analytics: true,
    }, });
  const level = (num:string) => {
    if(num=='1') return 'Beginner'
    else if (num=='2') return 'Intermediate'
    else return 'Expert' 
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto mt-10 p-4">
      <RankedDisplay EveryResult={EveryResult!} userIdArray={userIdArray}/>
      {EveryResult.length === 0 && (
        <p className="col-span-full text-center text-white text-xl font-semibold">
          No Candidate Has Attended The Automated Interview.
        </p>
      )}
    </div>
  )
}

export default RankedAssessments;
