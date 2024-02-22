import React from "react";
import { Medal, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface Props {
  EveryResult: {
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
  userIdArray: { userId: string; firstName: string | null; lastName: string | null }[];
}

export default function RankedDisplay({ EveryResult, userIdArray }: Props) {
  const level = (value: string) => {
    const intValue = parseInt(value, 10);
    switch (intValue) {
      case 1:
        return 'Beginner';
      case 2:
        return 'Intermediate';
      case 3:
        return 'Expert/Hard';
      default:
        return 'Intermediate';
    }
  };

  console.log(EveryResult, userIdArray)

  const calculateAveragePoints = (analytics: { id: string; parameter: string; points: number; maxPoints: number }[]) => {
    if (analytics.length === 0) return 0;
    const totalPoints = analytics.reduce((acc, item) => acc + item.points, 0);
    return totalPoints / analytics.length;
  };

  const getUserDetails = (userId: string) => {
    const user = userIdArray.find(user => user.userId === userId);
    return user ? { userId: user.userId, firstName: user.firstName, lastName: user.lastName } : null;
  };

  const sortedEveryResult = EveryResult.slice().sort((a, b) => {
    const avgPointsA = calculateAveragePoints(a.analytics);
    const avgPointsB = calculateAveragePoints(b.analytics);
    return avgPointsB - avgPointsA;
  });

  return (
    <>
      <h1 className="bg-secondary mb-4 flex flex-row gap-2 w-fit p-2 px-4 shadow-md shadow-black text-lg text-start rounded-lg text-gray-600 dark:text-gray-400 items-center">
        <Medal className="w-5 h-5" />
        Top Scoring Assessment Results
      </h1>
      <div className="bg-secondary mb-4 rounded-lg shadow-md shadow-black flex flex-col sm:flex-row p-4 gap-4 w-full">
        {sortedEveryResult.slice(0, 3).map((result, index) => (
          <div key={result.id} className={`flex relative rounded-lg gap-2 items-center flex-col w-full p-4 text-center shadow-md shadow-black ${index === 0 ? 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-700' : (index === 1 ? 'bg-gradient-to-tl from-slate-500 to-yellow-100' : 'bg-gradient-to-tl from-rose-400 to-orange-300')}`}>
            <div className={`text-6xl text-center rounded-full shadow-sm w-24 p-4 shadow-black ${index === 0 ? 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-700' : (index === 1 ? 'bg-gradient-to-tl from-slate-500 to-yellow-100' : 'bg-gradient-to-tl from-rose-400 to-orange-300')}`}>
              {index + 1}
            </div>
            <div className="flex flex-col items-center mt-2">
              <h1 className="">{`${getUserDetails(result.userId)?.firstName} ${getUserDetails(result.userId)?.lastName}`}</h1>
              <h3>Score - {calculateAveragePoints(result.analytics).toFixed(2)}</h3>
            </div>
            <Link href={`feedbackHosted?id=${result.id}`} className="flex top-4 left-4 absolute items-center flex-row text-violet-500">
                Feedback
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
          </div>
        ))}
      </div>
      <div className="bg-secondary rounded-lg shadow-md shadow-black flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Rank</TableHead>
              <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Name</TableHead>
              <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Job Profile</TableHead>
              <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Job Type</TableHead>
              <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Attempted At</TableHead>
              <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Score</TableHead>
              <TableHead className="font-semibold whitespace-nowrap text-black dark:text-white">Feedbacks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEveryResult.slice(3).map((result, index) => (
              <TableRow key={result.id}>
                <TableCell className="whitespace-nowrap text-black dark:text-white">{index+4}</TableCell>
                <TableCell className="whitespace-nowrap text-black dark:text-white">{`${getUserDetails(result.userId)?.firstName} ${getUserDetails(result.userId)?.lastName}`} </TableCell>
                <TableCell className="whitespace-nowrap text-black dark:text-white">{result.jobProfile}</TableCell>
                <TableCell className="whitespace-nowrap text-black dark:text-white">{result.jobtype}</TableCell>
                <TableCell className="whitespace-nowrap text-black dark:text-white">{result.createdAt.toLocaleString()}</TableCell>
                <TableCell className="whitespace-nowrap text-black dark:text-white">{calculateAveragePoints(result.analytics).toFixed(2)}</TableCell>
                <TableCell className="whitespace-nowrap text-black dark:text-white">
                  {getUserDetails(result.userId) && (
                    <Link href={`feedbackHosted?id=${result.id}`} className="flex flex-row text-violet-700 dark:text-violet-400">
                      Feedback
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
