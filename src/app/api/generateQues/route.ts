import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI();

export const runtime = "edge";

const diflevel = (value: string) => {
  const intValue = parseInt(value, 10);
  switch (intValue) {
    case 1:
      return "Beginner";
    case 2:
      return "Intermediate";
    case 3:
      return "Expert/Hard";
    default:
      return "Beginner";
  }
};

const firstMessageContext =
  "You are an interviewer interviewing a candidate for the role of a *insert_job_here* at your company *insert_company_here*. The candidate's name is *insert_name_here*. Speak only from the perspective of the interviewer. Do not include the time of day. Welcome the candidate to the interview and ask them the first question of: ";
const subsequentMessageContext =
  "You are an interviewer interviewing a candidate for the role of a *insert_job_here* at your company *insert_company_here*. The candidate's name is *insert_name_here*. Make sure to give your a concise evaluation based on their previous answer.Then make sure to ask them the next question of: ";
const lastMessageContext =
  "You are an interviewer interviewing a candidate for the role of a *insert_job_here* at your company *insert_company_here*. The candidate's name is *insert_name_here*. Make sure to give your a concise evaluation based on their previous answer .Then make sure to thank them for joining you for the interview.";

const generateAnalytics = `
Your task is to provide a detailed performance assessment for a candidate who recently completed an interview. The candidate was asked the following question by the interviewer: "*insert_question_here*". The candidate's response to this question is: "*insert_answer_here*".

For context, the candidate is applying for the position of *insert_title_here* at *insert_company_here*. The positions they are applying for fall under the category of *insert_type_here*. The job requirements are as follows: "*insert_reqs_here*".

Evaluate the candidate's performance in six specific areas, each with a maximum score. Provide your assessment in the form of a JSON object under the "interviewFeedbackAnalyticsRadar" section. The six parameters to be assessed are:
1. Communication Skills
2. Technical Proficiency
3. Adaptability
4. Team Collaboration
5. Leadership Potential
6. Cultural Fit

For each parameter, assign points based on your assessment of the candidate's performance, considering the points they received out of the maximum points possible.

The response should follow this JSON format:

{
  "interviewFeedbackAnalyticsRadar": [
    { "parameter": "Communication Skills", "points": pointsNumber_1, "maxPoints": maxPointsNumber_1 },
    { "parameter": "Technical Proficiency", "points": pointsNumber_2, "maxPoints": maxPointsNumber_2 },
    { "parameter": "Adaptability", "points": pointsNumber_3, "maxPoints": maxPointsNumber_3 },
    { "parameter": "Team Collaboration", "points": pointsNumber_4, "maxPoints": maxPointsNumber_4 },
    { "parameter": "Leadership Potential", "points": pointsNumber_5, "maxPoints": maxPointsNumber_5 },
    { "parameter": "Cultural Fit", "points": pointsNumber_6, "maxPoints": maxPointsNumber_6 }
  ]
}

Replace maxPointsNumber_* with the maximum points you allocate for each parameter and pointsNumber_* with the points the candidate deserves based on your interview assessment.

Example:

{
  "interviewFeedbackAnalyticsRadar": [
    { "parameter": "Communication Skills", "points": 110, "maxPoints": 150 },
    { "parameter": "Technical Proficiency", "points": 130, "maxPoints": 150 },
    { "parameter": "Adaptability", "points": 130, "maxPoints": 150 },
    { "parameter": "Team Collaboration", "points": 100, "maxPoints": 150 },
    { "parameter": "Leadership Potential", "points": 90, "maxPoints": 150 },
    { "parameter": "Cultural Fit", "points": 85, "maxPoints": 150 }
  ]
}


`;

const feedbackContext = `
Your role is to give feedback to a candidate who just did an interview. The question they were asked by the interviewer is "*insert_question_here*". 
  The candidate's answer to this question is "*insert_answer_here*". 
  Don't mention or repeat the question or answer in your response. Never mention question or answer as undefined in your response. 
  For context, the candidate is applying for the position *insert_title_here* at the company *insert_company_here*. The type of positions they are applying for 
  are the following: *insert_type_here*. The requirements for this job are the following: "*insert_reqs_here*". 
  Please limit the feedback to 200 words and do not repeat the question or the answer. You are speaking to the candidate in the second person. 
  Please organize your answer into two sections: "strengths" and "improvements", where the "strengths" section talks about what the candidate did well and 
  the "improvements" section talks about areas of improvement for the candidate's answer. For each section, add a heading that highlights each point made. 
  The response should be in a JSON format like the following

{
  "strengths": [
    {
      "feedbackHeading": "feedback_heading_1",
      "feedback": "feedback_1"
    },
    {
      "feedbackHeading": "feedback_heading_2",
      "feedback": "feedback_2"
    }
  ],
  "improvements": [
    {
      "feedbackHeading": "feedback_heading_1",
      "feedback": "feedback_1"
    },
    {
      "feedbackHeading": "feedback_heading_2",
      "feedback": "feedback_2"
    },
    {
      "feedbackHeading": "feedback_heading_3",
      "feedback": "feedback_3"
    }
  ]
}
}

where feedback_heading_* is replaced by the heading that the category of the feedback you have, and feedback_* is replaced by the content of the feedback. The "strengths" and "improvements" sections can have anywhere between three to five feedback points. 

Here is an example:

{
  "strengths": [
    {
      "feedbackHeading": "Personalized answers",
      "feedback": "Good job in making the company personal to you by providing examples!"
    },
    {
      "feedbackHeading": "Adding your impact",
      "feedback": "It's great to always say what impact you had in the previous companies you worked at. What you said was great!"
    }
  ],
  "improvements": [
    {
      "feedbackHeading": "Be more specific",
      "feedback": "Add more details in your answers by recounting a specific scenario or example that you remember from the past. This will make your answer more authentic"
    }
  ]
}
`;

const overallFeedbackContext = `
Your role is to give overall feedback to a candidate who just did an interview.
For context, the candidate is applying for the position *insert_title_here* at the company *insert_company_here*. The type of positions they are applying for 
are the following: *insert_type_here*. The requirements for this job are the following: "*insert_reqs_here*".
The questions of the interviewer and the answers by the candidate are in an array of objects provided below, where each object in the array represents one question/answer pair.
The question field in each object is the question asked by the interviewer and the answer field in each object is the candidate's answer to that respective question.
Here is the array of objects:
*insert_questions_here*

Please limit the feedback to 150 words, the feedback should be in form of 6 distinct feedback separated with "." and do not repeat the question or the answer. You are speaking to the candidate in second person. Your answer should be in the format of 
a JSON with key named feedback.
`;

const generateQuestionsContext = `
Your role is to generate an interview question for a candidate doing an interview. 
For context, the candidate is applying for the position *insert_title_here* at the company *insert_company_here*. The type of positions they are applying for 
are the following: *insert_type_here*. The requirements for this job are the following: "*insert_reqs_here*".
The questions the candidate is already being asked is provided in an array here: *insert_questions_here*
Make sure that the question you generate is not a repeat of any of the questions that are already being asked.
Difficulty level of question will be : *insert_level_here*
Please limit the question to one sentence. The question should be directed to the candidate in the second person. Your answer should be in the form of a valid JSON with only the question.
`;

export async function POST(request: Request) {
  const body = await request.json();
  const queryType = body.prompt.queryType;

  console.log("generating response :)", queryType);

  let context: any[] = [];

  if (queryType == "firstMessage") {
    const jobProfile = body.prompt.jobProfile;
    const companyName = body.prompt.companyName;
    const questions = body.prompt.question;
    const name = body.prompt.name;

    const systemContext = firstMessageContext
      .replace("*insert_company_here*", companyName)
      .replace("*insert_job_here*", jobProfile)
      .replace("*insert_name_here*", name)
      .concat(questions);

    context.push({
      role: "system",
      content: systemContext,
    });
  } else if (queryType == "subsequentMessage") {
    const jobProfile = body.prompt.jobProfile;
    const companyName = body.prompt.companyName;
    const prevQuestion = body.prompt.prevQuestion;
    const prevAnswer = body.prompt.prevAnswer;
    const questions = body.prompt.question;
    const name = body.prompt.name;

    const systemContext = subsequentMessageContext
      .replace("*insert_job_here*", jobProfile)
      .replace("*insert_prevAnswer_here*", prevAnswer)
      .replace("*insert_company_here*", companyName)
      .replace("*insert_name_here*", name)
      .concat(questions);

    context.push({
      role: "system",
      content: systemContext,
    });

    context.push({
      role: "assistant",
      content: prevQuestion,
    });

    context.push({
      role: "user",
      content: prevAnswer,
    });
  } else if (queryType == "lastMessage") {
    const jobProfile = body.prompt.jobProfile;
    const companyName = body.prompt.companyName;
    const prevQuestion = body.prompt.prevQuestion;
    const prevAnswer = body.prompt.prevAnswer;
    const name = body.prompt.name;

    const systemContext = lastMessageContext
      .replace("*insert_job_here*", jobProfile)
      .replace("*insert_company_here*", companyName)
      .replace("*insert_prevAnswer_here*", prevAnswer)
      .replace("*insert_name_here*", name);

    context.push({
      role: "system",
      content: systemContext,
    });

    context.push({
      role: "assistant",
      content: prevQuestion,
    });

    context.push({
      role: "user",
      content: prevAnswer,
    });
  } else if (queryType == "feedback") {
    const question = body.prompt.question;
    const answer = body.prompt.answer;
    const jobProfile = body.prompt.jobProfile;
    const jobtype = body.prompt.jobtype;
    const companyName = body.prompt.companyName;
    const jobRequirements = body.prompt.jobRequirements;

    const systemContext = feedbackContext
      .replace("*insert_question_here*", question)
      .replace("*insert_answer_here*", answer)
      .replace("*insert_title_here*", jobProfile)
      .replace("*insert_type_here*", jobtype)
      .replace("*insert_company_here*", companyName)
      .replace("*insert_reqs_here*", jobRequirements);

    context.push({
      role: "system",
      content: systemContext,
    });
  } else if (queryType == "generateAnalytics") {
    const question = body.prompt.question;
    const answer = body.prompt.answer;
    const jobProfile = body.prompt.jobProfile;
    const jobtype = body.prompt.jobtype;
    const companyName = body.prompt.companyName;
    const jobRequirements = body.prompt.jobRequirements;

    const systemContext = generateAnalytics
      .replace("*insert_question_here*", question)
      .replace("*insert_answer_here*", answer)
      .replace("*insert_title_here*", jobProfile)
      .replace("*insert_type_here*", jobtype)
      .replace("*insert_company_here*", companyName)
      .replace("*insert_reqs_here*", jobRequirements);

    context.push({
      role: "system",
      content: systemContext,
    });
  } else if (queryType == "overall") {
    const questions = body.prompt.questions;
    const jobProfile = body.prompt.jobProfile;
    const jobtype = body.prompt.jobtype;
    const companyName = body.prompt.companyName;
    const jobRequirements = body.prompt.jobRequirements;

    const systemContext = overallFeedbackContext
      .replace("*insert_questions_here*", questions)
      .replace("*insert_title_here*", jobProfile)
      .replace("*insert_type_here*", jobtype)
      .replace("*insert_company_here*", companyName)
      .replace("*insert_reqs_here*", jobRequirements);

    context.push({
      role: "system",
      content: systemContext,
    });
  } else if (queryType == "generateQuestion") {
    const questions = body.prompt.questions;
    const jobProfile = body.prompt.jobProfile;
    const jobtype = body.prompt.jobtype;
    const companyName = body.prompt.companyName;
    const jobRequirements = body.prompt.jobRequirements;
    const level = body.prompt.level;

    const systemContext = generateQuestionsContext
      .replace("*insert_questions_here*", questions)
      .replace("*insert_title_here*", jobProfile)
      .replace("*insert_type_here*", jobtype)
      .replace("*insert_company_here*", companyName)
      .replace("*insert_reqs_here*", jobRequirements)
      .replace("*insert_level_here*", diflevel(level));

    context.push({ role: "system", content: systemContext });
  }

  const completion = await openai.chat.completions.create({
    messages: context,
    model: "gpt-3.5-turbo",
    stream: true,
  });

  console.log("response generated :)", queryType);

  const stream = OpenAIStream(completion);

  return new StreamingTextResponse(stream);
}
