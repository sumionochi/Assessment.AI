"use client";

import { Automated_Assess } from "@prisma/client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewAutomatedAssessment from "./NewAutomatedAssessment";

interface Props {
  autoAssess: Automated_Assess;
  userName: string | undefined | null
}

export default function AutomatedAssessmentDisplay({ autoAssess, userName }: Props) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const router = useRouter();

  const wasUpdated = autoAssess.updatedAt > autoAssess.createdAt;

  const createdUpdatedAtTimestamp = (
    wasUpdated ? autoAssess.updatedAt : autoAssess.createdAt
  ).toDateString();

  const diflevel = (value : string) => {
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

  return (
    <>
      <Card className="cursor-pointer shadow-md shadow-black bg-secondary transition-shadow hover:shadow-lg">
        <CardHeader onClick={() => setShowEditDialog(true)}>
          <CardTitle>{autoAssess.name}</CardTitle>
          <CardDescription onClick={() => setShowEditDialog(true)}>
            {createdUpdatedAtTimestamp}
            {wasUpdated && " (updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent onClick={() => setShowEditDialog(true)} className="mb-0 pb-0">
          <div className="mb-4">
            <p className="font-bold text-gray-600 dark:text-gray-400">Company : <span className="text-primary font-normal">{autoAssess.companyName}</span></p>
          </div>
          <div className="mb-4">
          <p className="font-bold text-gray-600 dark:text-gray-400">Title : <span className="text-primary font-normal">{autoAssess.jobtype}</span></p>
          </div>
          <div className="mb-4">
            <p className="font-bold text-gray-600 dark:text-gray-400">Difficulty Level : <span className="text-primary font-normal">{diflevel(autoAssess.level)}</span></p>
          </div>
          <div className="mb-4">
            <p className="font-bold text-gray-600 dark:text-gray-400">Example Question:</p>
            <ul className="list-disc pl-6">
              <li>{autoAssess.questions[0]}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      <NewAutomatedAssessment open={showEditDialog} setOpen={setShowEditDialog} toEdit={autoAssess} userName={userName}/>
    </>
  );
}