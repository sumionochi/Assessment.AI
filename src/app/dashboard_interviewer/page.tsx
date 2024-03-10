import { auth, clerkClient } from "@clerk/nextjs";
import React from 'react';
import prisma from "@/lib/db";
import AssessmentDisplay from "@/components/AssessmentDisplay";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, PencilRuler, ScrollIcon, ScrollTextIcon, StickyNote, Text } from "lucide-react";
import AutomatedAssessmentButton from "@/components/AutomatedAssessButton";
import { User } from "@clerk/nextjs/server";
import AutomatedAssessmentDisplay from "@/components/AutomatedAssessmentDisplay";
import InputImg from "@/components/InputImg";
import InputPdf from "@/components/InputPdf";

type Props = {
}

const InterviewerDashboard = async({}: Props) => {
  const {userId} = auth();
  const userlist = await clerkClient.users.getUserList();
  const currentUser = userlist.find(user => user.id === userId);
  const userName = `${currentUser?.firstName} ${currentUser?.lastName}` || undefined;
  
  if (!userId) throw Error("userId undefined");
  const EveryAssessment = await prisma.automated_Assess.findMany({ where: { userId } });
  const EveryResult = await prisma.result.findMany({  where: { userId },
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
    <div className="flex flex-col max-w-6xl mx-auto mt-10 gap-8 p-4 mb-10">

      <div>
        <h1 className="bg-secondary flex flex-row gap-2 w-fit mb-4 p-2 px-4 shadow-md shadow-black text-lg text-start rounded-lg text-gray-600 dark:text-gray-400 items-center"><Text className="w-5 h-5"/>Extract Context for Assessment</h1>
        <div className="w-full flex flex-col sm:flex-row gap-4">
          <InputImg/>
          <InputPdf/>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* <Calendar EveryAssessment={EveryAssessment}/>
        <IssueChart EveryAssessment={EveryAssessment}/> */}
        {/* {EveryResult.map((result) => (
                <ResultDisplay result={result} key={result.id} />
              ))} */}

      </div>

      {/* <AIChatButton/> */}

      <div className="w-full flex flex-col sm:flex-row gap-4">
        <div className="bg-secondary p-6 rounded-lg shadow-md shadow-black flex flex-col gap-4">
          <h1 className="font-semibold">Create Or Join An Interview</h1>
          <p>As an interviewer, empower candidates by furnishing the meeting Id for a seamless interview experience. Foster a connection effortlessly in the recruitment journey.</p>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md shadow-black gap-4 flex flex-col">
          <h1 className="font-semibold">Host An Automated Assessment</h1>
          <p>Find the right candidate out of millions, host an automated interview and receive feedback with analytics to make the evidence based choice in selection.</p>
          <div><AutomatedAssessmentButton userName={userName}/></div>
        </div>
      </div>

      <div>
        <h1 className="bg-secondary flex flex-row gap-2 w-fit mb-4 p-2 px-4 shadow-md shadow-black text-lg text-start rounded-lg text-gray-600 dark:text-gray-400 items-center"><BookOpenCheck className="w-5 h-5"/>Automated Assessments</h1>
        <div className="bg-secondary p-4 rounded-lg shadow-md shadow-black flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Company</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Job Profile</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Job Type</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Interview Level</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Created At</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Rankings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EveryAssessment.map((result)=>(
                <TableRow key={result.id}>
                  <TableCell className="whitespace-nowrap text-black dark:text-white">{result.companyName}</TableCell>
                  <TableCell className="whitespace-nowrap text-black dark:text-white">{result.jobProfile}</TableCell>
                  <TableCell className="whitespace-nowrap text-black dark:text-white">{result.jobtype}</TableCell>
                  <TableCell className="whitespace-nowrap text-black dark:text-white">{level(result.level)}</TableCell>
                  <TableCell className="whitespace-nowrap text-black dark:text-white">{result.createdAt.toLocaleString()}</TableCell>
                  <TableCell className="whitespace-nowrap text-black dark:text-white"><Link href={`/rankedAssessments`} className="flex flex-row text-violet-700 dark:text-violet-400">Rankings <ArrowRight className="ml-2 w-5 h-5"/></Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h1 className="bg-secondary flex flex-row gap-2 w-fit mb-4 p-2 px-4 shadow-md shadow-black text-lg text-start rounded-lg text-gray-600 dark:text-gray-400 items-center"><ScrollTextIcon className="w-5 h-5"/>Automated Assessment Cards</h1>
        <div className="grid gap-4 place-content-start grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {EveryAssessment.map((assessment) => (
          <AutomatedAssessmentDisplay autoAssess={assessment} key={assessment.id} userName={userName}/>
        ))}
        </div>
      </div>

    </div>
  )
}

export default InterviewerDashboard