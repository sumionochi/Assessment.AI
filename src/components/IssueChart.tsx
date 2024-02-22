'use client'
import React from 'react'
import { Card } from './ui/card'
import {ResponsiveContainer, BarChart, XAxis, YAxis, Bar} from 'recharts'
import { Assess, Automated_Assess, Result } from '@prisma/client'

interface Props {
  EveryResolve: Result[];
  EveryAssessment: Assess[];
  EveryAutoAssessment: Automated_Assess[];
}

const IssueChart = ({EveryResolve, EveryAssessment, EveryAutoAssessment}: Props) => {
  const res = EveryResolve.length;
  const cs = EveryAssessment.length;
  const is = EveryAutoAssessment.length;
  const data = [
    { label: 'Attended Assessments', value: res },
    { label: 'Self Assessments', value: cs },
    { label: 'Hosted Assessments', value: is },
  ];
    return (
    <Card className='w-full p-4 pt-10 pr-10 bg-secondary shadow-md shadow-black'>
        <ResponsiveContainer width={'100%'} height={300}>
            <BarChart data={data}>
                <XAxis className=' bg-cyan-800' dataKey={"label"}/>
                <YAxis className=' bg-cyan-800'/>
                <Bar fill="#C667FC" dataKey={'value'} barSize={100}/>
            </BarChart>
        </ResponsiveContainer>
    </Card>
    )
}

export default IssueChart