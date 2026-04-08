import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const scenarios = [
  // 1. Self Introduction
  {
    id: "scn_intro_01",
    category: "self-introduction",
    title: "30-Second Self Introduction",
    prompt:
      "Introduce yourself in 30 seconds. Cover who you are, your current role, and one key achievement.",
    targetPoints: [
      "clear name and role",
      "specific achievement",
      "confident tone",
    ],
    suggestedMinute: 10,
  },
  {
    id: "scn_intro_02",
    category: "self-introduction",
    title: "Describe Your Current Responsibilities",
    prompt:
      "Explain what you do in your current role to someone who is not in your field.",
    targetPoints: [
      "plain language",
      "scope of work",
      "team context",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_intro_03",
    category: "self-introduction",
    title: "Talk About a Recent Project",
    prompt:
      "Tell me about a project you recently completed. What was the goal, what did you do, and what was the result?",
    targetPoints: [
      "clear goal statement",
      "your specific contribution",
      "measurable result",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_intro_04",
    category: "self-introduction",
    title: "Strengths and Areas for Improvement",
    prompt:
      "Share one of your key strengths and one area you are actively working to improve.",
    targetPoints: [
      "specific strength with evidence",
      "honest improvement area",
      "growth mindset phrasing",
    ],
    suggestedMinute: 10,
  },
  {
    id: "scn_intro_05",
    category: "self-introduction",
    title: "Introduce Your Work Style to a New Colleague",
    prompt:
      "A new colleague just joined your team. Describe how you prefer to work and collaborate.",
    targetPoints: [
      "communication preferences",
      "collaboration style",
      "professional and welcoming tone",
    ],
    suggestedMinute: 10,
  },

  // 2. Meeting Update
  {
    id: "scn_meeting_01",
    category: "meeting-update",
    title: "Weekly Progress Sync",
    prompt:
      "You are in a weekly standup. Share what you finished last week, what you are working on now, and any blockers.",
    targetPoints: [
      "clear structure",
      "time reference",
      "specific blocker ask",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_meeting_02",
    category: "meeting-update",
    title: "Report a Delay Risk",
    prompt:
      "One of your tasks is at risk of missing the deadline. Inform your team and suggest a mitigation plan.",
    targetPoints: [
      "proactive communication",
      "clear risk description",
      "solution proposal",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_meeting_03",
    category: "meeting-update",
    title: "Explain a Blocker and Request Support",
    prompt:
      "You are blocked on a task. Explain what the blocker is and ask your manager or team for specific help.",
    targetPoints: [
      "precise blocker description",
      "what you have already tried",
      "specific ask",
    ],
    suggestedMinute: 10,
  },
  {
    id: "scn_meeting_04",
    category: "meeting-update",
    title: "Explain Priority Changes",
    prompt:
      "Your task priorities have shifted. Explain to your team why certain items are now higher or lower priority.",
    targetPoints: [
      "clear reasoning",
      "impact explanation",
      "alignment language",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_meeting_05",
    category: "meeting-update",
    title: "Wrap Up a Meeting",
    prompt:
      "It is the end of a team meeting. Summarize the key decisions made and the next steps with owners.",
    targetPoints: [
      "action item clarity",
      "ownership assignment",
      "concise summary",
    ],
    suggestedMinute: 10,
  },

  // 3. Suggestion and Disagreement
  {
    id: "scn_suggest_01",
    category: "suggestion-disagreement",
    title: "Propose an Improvement",
    prompt:
      "You have noticed a process inefficiency in your team. Propose an improvement in a team meeting.",
    targetPoints: [
      "problem framing",
      "solution specifics",
      "positive and constructive tone",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_suggest_02",
    category: "suggestion-disagreement",
    title: "Politely Disagree",
    prompt:
      "A colleague proposed an approach you do not agree with. Express your disagreement politely and offer an alternative.",
    targetPoints: [
      "acknowledge their view",
      "clear disagreement phrasing",
      "alternative suggestion",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_suggest_03",
    category: "suggestion-disagreement",
    title: "Request Clarification on an Ambiguous Requirement",
    prompt:
      "A product requirement is unclear to you. Ask the product manager for clarification in a constructive way.",
    targetPoints: [
      "specific question",
      "clarify impact",
      "professional curiosity",
    ],
    suggestedMinute: 10,
  },
  {
    id: "scn_suggest_04",
    category: "suggestion-disagreement",
    title: "Push Back on an Unrealistic Deadline",
    prompt:
      "You have been given a deadline you cannot meet. Decline it politely and propose a realistic alternative.",
    targetPoints: [
      "reason explanation",
      "firm but respectful tone",
      "counter-proposal",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_suggest_05",
    category: "suggestion-disagreement",
    title: "Justify a Change of Approach",
    prompt:
      "You want to change the technical approach for a feature. Explain why and get buy-in from your team.",
    targetPoints: [
      "data or evidence",
      "risk acknowledgment",
      "alignment ask",
    ],
    suggestedMinute: 12,
  },

  // 4. Cross-team Collaboration
  {
    id: "scn_collab_01",
    category: "cross-team",
    title: "Confirm Requirements with a Product Manager",
    prompt:
      "You are about to start a new feature. Align with the PM on the scope, success criteria, and edge cases.",
    targetPoints: [
      "scope confirmation",
      "edge case discussion",
      "agreement confirmation",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_collab_02",
    category: "cross-team",
    title: "Explain a Technical Constraint to a Designer",
    prompt:
      "A designer proposed a UI that has technical limitations. Explain the constraint and offer a feasible alternative.",
    targetPoints: [
      "non-technical language",
      "clear constraint explanation",
      "collaborative solution",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_collab_03",
    category: "cross-team",
    title: "Align Acceptance Criteria with QA",
    prompt:
      "You are handing off a feature to QA. Walk through the acceptance criteria and answer their questions.",
    targetPoints: [
      "clear criteria list",
      "edge case coverage",
      "handoff clarity",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_collab_04",
    category: "cross-team",
    title: "Request Help Debugging from Another Team",
    prompt:
      "You suspect a bug is caused by another team's service. Ask them for help investigating the issue.",
    targetPoints: [
      "clear problem description",
      "evidence provided",
      "collaborative ask",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_collab_05",
    category: "cross-team",
    title: "Address an External Dependency Delay",
    prompt:
      "A vendor or partner team is late. Communicate the impact to your stakeholders and propose a contingency.",
    targetPoints: [
      "impact clarity",
      "no blame language",
      "contingency plan",
    ],
    suggestedMinute: 12,
  },

  // 5. Interview and Career
  {
    id: "scn_interview_01",
    category: "interview-career",
    title: "Why Do You Want This Role?",
    prompt:
      "You are in a job interview. Answer the question: Why do you want this specific role at this company?",
    targetPoints: [
      "specific motivation",
      "company research evidence",
      "career alignment",
    ],
    suggestedMinute: 12,
  },
  {
    id: "scn_interview_02",
    category: "interview-career",
    title: "Tell Me About a Challenge You Solved",
    prompt:
      "Describe a significant technical or professional challenge you faced and how you resolved it.",
    targetPoints: [
      "STAR structure",
      "concrete actions",
      "quantified result",
    ],
    suggestedMinute: 15,
  },
  {
    id: "scn_interview_03",
    category: "interview-career",
    title: "Describe a Conflict and How You Handled It",
    prompt:
      "Give an example of a workplace conflict and explain how you navigated it professionally.",
    targetPoints: [
      "neutral framing",
      "your specific actions",
      "positive outcome",
    ],
    suggestedMinute: 15,
  },
  {
    id: "scn_interview_04",
    category: "interview-career",
    title: "Explain a Project With Measurable Impact",
    prompt:
      "Walk through a project where you had a measurable business or technical impact.",
    targetPoints: [
      "clear project context",
      "your contribution",
      "numbers and results",
    ],
    suggestedMinute: 15,
  },
  {
    id: "scn_interview_05",
    category: "interview-career",
    title: "Ask Thoughtful Questions to the Interviewer",
    prompt:
      "At the end of an interview, you have time to ask questions. Ask two or three thoughtful questions.",
    targetPoints: [
      "genuine curiosity",
      "company or team specific",
      "career growth angle",
    ],
    suggestedMinute: 10,
  },
];

async function main() {
  console.log("Seeding scenarios...");

  for (const scenario of scenarios) {
    await prisma.scenario.upsert({
      where: { id: scenario.id },
      update: scenario,
      create: scenario,
    });
  }

  // Create a default guest user
  await prisma.user.upsert({
    where: { id: "user_guest" },
    update: {},
    create: {
      id: "user_guest",
      email: "guest@example.com",
    },
  });

  console.log(`Seeded ${scenarios.length} scenarios and default user.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
