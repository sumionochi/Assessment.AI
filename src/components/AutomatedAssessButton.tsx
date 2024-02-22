"use client"
import React, { useState } from 'react'
import { Button } from './ui/button'
import NewAssessment from './NewAssessment';
import { Assess } from '@prisma/client';
import NewAutomatedAssessment from './NewAutomatedAssessment';

interface props {
  userName : string | null | undefined
}

export default function AutomatedAssessmentButton({userName}:props) {
  const [addDialog, setAddDialog] = useState(false);
  const name = userName;
  return (
    <>
        <Button className='p-3 shadow-md shadow-black border-none bg-gradient-to-br from-violet-500 to-violet-300 text-white rounded-xl' onClick={()=>setAddDialog(true)}>Host Assessment</Button>
        <NewAutomatedAssessment userName={name} open={addDialog} setOpen={setAddDialog}/>
    </>    
  )
}