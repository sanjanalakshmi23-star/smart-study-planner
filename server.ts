import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Syllabus Decomposer & Structure Parser
app.post("/api/ai/parse-syllabus", async (req, res) => {
  try {
    const { syllabusText, courseName = "Course", targetExamDate, dailyAvailableHours = 2 } = req.body;

    if (!syllabusText || typeof syllabusText !== "string") {
      res.status(400).json({ error: "Syllabus text is required." });
      return;
    }

    const ai = getAIClient();

    if (!ai) {
      // Fallback if no API key provided
      res.json({
        success: true,
        source: "algorithmic_fallback",
        topics: null, // Frontend will use client heuristic parser
        message: "Gemini API key not configured; using local algorithmic engine."
      });
      return;
    }

    const prompt = `You are an elite academic curriculum architect and learning scientist.
Analyze this course syllabus for "${courseName}".
Decompose it into granular, bite-sized study topics suitable for a student studying ${dailyAvailableHours} hours/day with an upcoming exam on ${targetExamDate || "soon"}.

Rules:
1. Break broad chapters into distinct 1-2 hour study sessions.
2. Assign difficulty from 1 (fundamental/memorization) to 5 (advanced derivations/synthesis).
3. Recommend an evidence-based study technique (e.g., "Active Recall & Flashcards", "Practice Problem Drills", "Feynman Method Breakdown", "Derivation & Proofs", "Concept Mapping").
4. Extract 2-4 high-yield key terms/concepts for each topic.
5. Provide a strategic high-level study tip for this course.

Syllabus content:
${syllabusText.slice(0, 12000)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            courseSummary: { type: Type.STRING },
            strategicAdvice: { type: Type.STRING },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  moduleName: { type: Type.STRING },
                  estimatedHours: { type: Type.NUMBER, description: "Hours needed between 0.5 and 3.0" },
                  difficulty: { type: Type.INTEGER, description: "Scale 1 to 5" },
                  recommendedTechnique: { type: Type.STRING },
                  keyTerms: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["title", "moduleName", "estimatedHours", "difficulty", "recommendedTechnique", "keyTerms"]
              }
            }
          },
          required: ["courseSummary", "strategicAdvice", "topics"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      source: "gemini_ai",
      ...parsed
    });
  } catch (err: any) {
    console.error("Error in parse-syllabus:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to analyze syllabus with AI",
      fallbackToLocal: true
    });
  }
});

// 2. Dynamic Auto-Adjustment & Re-balancing Advisor
app.post("/api/ai/auto-adjust", async (req, res) => {
  try {
    const { courseName, daysLeft, uncompletedTopics, strugglingTopics, completedCount, totalCount } = req.body;

    const ai = getAIClient();
    if (!ai) {
      res.json({
        success: true,
        source: "local",
        coachAdvice: "We have dynamically redistributed your delayed and high-difficulty topics into upcoming study windows while safeguarding your mock exam buffer days."
      });
      return;
    }

    const prompt = `You are an empathetic, tactical student study coach at a top university.
A student is preparing for an exam in "${courseName}".
Status:
- Days left until exam: ${daysLeft}
- Completed topics: ${completedCount} / ${totalCount}
- Topics needing extra time/struggling: ${JSON.stringify(strugglingTopics || [])}
- Delayed/uncompleted topics: ${JSON.stringify(uncompletedTopics || [])}

Provide:
1. "rebalanceStrategy": Tactical 2-3 sentence explanation of how the schedule is reallocated (shifting hard items to weekend blocks, using buffer days, trimming low-yield filler).
2. "coachAdvice": A brief, inspiring, no-shame psychological booster written in the voice of a student-founder solving student burnout.
3. "highYieldPriority": The #1 topic they should conquer next to regain confidence.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rebalanceStrategy: { type: Type.STRING },
            coachAdvice: { type: Type.STRING },
            highYieldPriority: { type: Type.STRING }
          },
          required: ["rebalanceStrategy", "coachAdvice", "highYieldPriority"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      source: "gemini_ai",
      ...data
    });
  } catch (err: any) {
    console.error("Error in auto-adjust:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      coachAdvice: "Topics have been balanced across your remaining capacity. Stay calm and tackle the highest-yield problem sets first."
    });
  }
});

// 3. Daily Email & WhatsApp Reminder Generator
app.post("/api/ai/generate-reminder", async (req, res) => {
  try {
    const { courseName, dayOfWeek, date, allocatedHours, topics, daysUntilExam } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // Deterministic generation
      const topicsList = (topics || []).map((t: any, idx: number) => `${idx + 1}. ${t.title} (~${t.estimatedHours}h - ${t.recommendedTechnique})`).join("\n");
      const waText = `📚 *StudyPulse Daily Agenda | ${dayOfWeek}*\n\n🎯 *Course:* ${courseName}\n⏳ *Exam Countdown:* ${daysUntilExam} days\n⏱️ *Today's Focus:* ${allocatedHours} hrs\n\n*Tasks for Today:*\n${topicsList}\n\n💡 *Tip:* Start with 25m Pomodoro on Topic #1.\nReport progress: Tap your StudyPulse dashboard!`;
      res.json({
        success: true,
        source: "local",
        whatsappMessage: waText,
        emailSubject: `🎯 Today's Study Plan: ${courseName} (${allocatedHours} hrs)`,
        emailBody: `<div style="font-family: sans-serif; max-width: 600px; padding: 20px;"><h2>StudyPulse Morning Briefing</h2><p>Course: <strong>${courseName}</strong> (${daysUntilExam} days to exam)</p><p>Today's Target: <strong>${allocatedHours} hours</strong></p><ul>${(topics || []).map((t: any) => `<li><strong>${t.title}</strong> (${t.estimatedHours}h) - <em>${t.recommendedTechnique}</em></li>`).join("")}</ul></div>`
      });
      return;
    }

    const prompt = `Generate a high-converting, crisp daily study dispatch for a student:
Course: ${courseName}
Day: ${dayOfWeek}, ${date}
Exam Countdown: ${daysUntilExam} days remaining
Daily study time budgeted: ${allocatedHours} hours
Topics scheduled: ${JSON.stringify(topics || [])}

Generate:
1. "whatsappMessage": Formatted with bolding (*text*), bullet points, and relevant emojis, ready to be sent via WhatsApp. Include a quick 1-sentence motivation and check-in prompt.
2. "emailSubject": Compelling, motivating subject line with course and time.
3. "emailHeadline": Inspiring opening headline.
4. "actionTip": A concrete cognitive learning tactic for today's specific topics.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatsappMessage: { type: Type.STRING },
            emailSubject: { type: Type.STRING },
            emailHeadline: { type: Type.STRING },
            actionTip: { type: Type.STRING }
          },
          required: ["whatsappMessage", "emailSubject", "emailHeadline", "actionTip"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      source: "gemini_ai",
      ...parsed
    });
  } catch (err: any) {
    console.error("Error generating reminder:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 4. Topic Study Buddy (Feynman breakdown, flashcards, formula mnemonic)
app.post("/api/ai/topic-coach", async (req, res) => {
  try {
    const { topicTitle, moduleName, keyTerms, difficulty } = req.body;
    const ai = getAIClient();

    if (!ai) {
      res.json({
        success: true,
        source: "local",
        feynmanSummary: `Break down ${topicTitle} into plain everyday terms. Identify the core inputs, transformational rules, and edge cases.`,
        keyQuestions: [
          `Can you explain the main mechanism of ${topicTitle} in 2 sentences?`,
          `What happens in ${topicTitle} when constraints or inputs change?`,
          `How does ${topicTitle} relate to ${keyTerms?.[0] || 'the core module'}?`
        ],
        mnemonic: "P-A-C-E: Principles, Application, Core Mechanism, Edge Cases"
      });
      return;
    }

    const prompt = `You are an elite peer tutor.
Topic: "${topicTitle}" (Module: ${moduleName})
Difficulty: ${difficulty}/5
Key terms: ${(keyTerms || []).join(", ")}

Generate:
1. "feynmanSummary": A 3-sentence intuitive, jargon-free explanation using an intuitive analogy.
2. "keyQuestions": 3 rapid active-recall test questions a student can quiz themselves with.
3. "mnemonic": A clever memory anchor or acronym to remember this topic for exam day.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feynmanSummary: { type: Type.STRING },
            keyQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            mnemonic: { type: Type.STRING }
          },
          required: ["feynmanSummary", "keyQuestions", "mnemonic"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      source: "gemini_ai",
      ...parsed
    });
  } catch (err: any) {
    console.error("Error in topic coach:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Vite Middleware integration for Full-Stack App
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
