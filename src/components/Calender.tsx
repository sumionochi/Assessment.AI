"use client";
import React from "react";
import dayjs from "dayjs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Assess, Automated_Assess, Result } from '@prisma/client'

interface Props {
  EveryResolve: {
    id: string;
    name: string;
    jobProfile: string;
    jobtype: string;
    companyName: string;
    jobRequirements: string;
    userId: string;
    createdAt: Date;
    level: string;
    questions: {
      id: string;
      question: string;
      answer: string;
      isAI: boolean;
      strengths: {
        id: string;
        feedbackHeading: string;
        feedback: string;
      }[];
      improvements: {
        id: string;
        feedbackHeading: string;
        feedback: string;
      }[];
    }[];
    overview: string;
    analytics: {
      id: string;
      parameter: string;
      points: number;
      maxPoints: number;
    }[];
  }[];
  EveryAssessment: Assess[];
  EveryAutoAssessment: Automated_Assess[];
}

export default function Calendar({EveryResolve, EveryAssessment, EveryAutoAssessment}: Props) {
  function getDateInYear(year = dayjs().year(), month = dayjs().month()) {
    const startDate = dayjs().year(year).month(month).date(1).startOf('year');
    const endDate = dayjs().year(year).month(month).date(1).endOf("year");
    const datesArray = [];

    for (let currentDay = startDate.clone(); currentDay.isBefore(endDate) || currentDay.isSame(endDate); currentDay = currentDay.add(1, 'day')) {
      datesArray.push(currentDay.format("YYYY-MM-DD"));
    }
    return datesArray;
  }

  const getColor = (score: number) => {
    if (score === 0) {
      return 'bg-gray-300';
    } else if (score < 30) {
      return "bg-gradient-to-br from-violet-300 to-orange-300";
    } else if (score < 60) {
      return "bg-gradient-to-br from-violet-400 to-orange-500";
    } else {
      return "bg-gradient-to-br from-violet-700 to-orange-500";
    }
  };

  const calculateAveragePoints = (analytics: { id: string; parameter: string; points: number; maxPoints: number }[]) => {
    if (analytics.length === 0) return 0;
    const totalPoints = analytics.reduce((acc, item) => acc + item.points, 0);
    return totalPoints / analytics.length;
  };

  return (
    <div className="bg-secondary rounded-lg p-6 text-center space-y-4 shadow-md shadow-black">
      <h1 className="text-4xl font-bold">Candidate Dashboard {dayjs().year()}</h1>
      <div className="flex flex-wrap gap-1 justify-center rounded-md">
        {getDateInYear().map((day, index) => {
          const matchingEvent = EveryResolve.find((event) => dayjs(event.createdAt).isSame(day, 'day'));
          const matchingEvent2 = EveryAssessment.find((event) => dayjs(event.createdAt).isSame(day, 'day'));
          const matchingEvent3 = EveryAutoAssessment.find((event) => dayjs(event.createdAt).isSame(day, 'day'));
          const score = matchingEvent ? calculateAveragePoints(matchingEvent!.analytics) : 0; 
          const hosted = matchingEvent3 ? 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-700' : 'bg-gray-300'; 
          const assess = matchingEvent2 ? 'bg-gradient-to-br from-green-200 to-green-500' : 'bg-gray-300'; 
          return (
            <HoverCard key={index}>
              <HoverCardTrigger className="">
                <div
                  className={cn(
                    "h-4 w-4 rounded-sm cursor-pointer",
                    assess, getColor(score | 0), hosted, 
                  )}
                ></div>
              </HoverCardTrigger>
              <HoverCardContent className="flex text-sm text-start flex-col">
                {matchingEvent &&
                  <div className="mb-2">
                    <p className="underline">Self Assessment Result</p>
                    <p>Company: <span className="font-semibold">{matchingEvent.companyName}</span></p>
                    <p>Job Profile: <span className="font-semibold">{matchingEvent.jobProfile}</span></p>
                    <p>Job Type: <span className="font-semibold">{matchingEvent.jobtype}</span></p>
                    <p>Score: <span className="font-semibold">{calculateAveragePoints(matchingEvent.analytics)}</span></p>
                  </div>}
                  {matchingEvent2 &&
                  <div className="mb-2">
                    <p className="underline">Self Assessment</p>
                    <p>Company: <span className="font-semibold">{matchingEvent2.companyName}</span></p>
                    <p>Job Profile: <span className="font-semibold">{matchingEvent2.jobProfile}</span></p>
                    <p>Job Type: <span className="font-semibold">{matchingEvent2.jobtype}</span></p>
                    <p>Posted On: <span className="font-semibold">{matchingEvent2.createdAt.toLocaleString()}</span></p>
                  </div>}
                  {matchingEvent3 &&
                  <div className="mb-2">
                    <p className="underline">Hosted Assessment</p>
                    <p>Company: <span className="font-semibold">{matchingEvent3.companyName}</span></p>
                    <p>Job Profile: <span className="font-semibold">{matchingEvent3.jobProfile}</span></p>
                    <p>Job Type: <span className="font-semibold">{matchingEvent3.jobtype}</span></p>
                    <p>Created On: <span className="font-semibold">{matchingEvent3.createdAt.toLocaleString()}</span></p>
                  </div>}
                {(!matchingEvent && !matchingEvent2 && !matchingEvent3) &&
                  <div className="mb-2">
                    <p className="underline">No Assessment Was Created Or Attended</p>
                    <p>On <span className="font-semibold">{day}</span></p>
                  </div>}
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    </div>
  );
}
