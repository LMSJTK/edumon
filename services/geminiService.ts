
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, QuizQuestion } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBattleQuestion = async (
  subject: Subject,
  playerLevel: number
): Promise<QuizQuestion | null> => {
  const ai = getClient();
  if (!ai) return null;

  // Approximate grade level based on player level (1-100 scales to Grade 2-12)
  const gradeLevel = Math.min(12, Math.max(2, Math.floor(playerLevel / 5) + 2));

  const prompt = `Generate a multiple-choice question about ${subject} suitable for a Grade ${gradeLevel} student.
  The question should test their knowledge to cast a powerful spell.
  Provide 4 options.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctIndex: { type: Type.INTEGER, description: "Zero-based index of the correct answer" },
            explanation: { type: Type.STRING, description: "Short explanation of why it is correct" }
          },
          required: ["question", "options", "correctIndex", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as QuizQuestion;

  } catch (error) {
    console.error("Gemini Quiz Generation Error:", error);
    // Fallback question if API fails
    return {
      question: `What is the essence of ${subject}?`,
      options: ["Knowledge", "Magic", "Power", "Luck"],
      correctIndex: 0,
      explanation: "Knowledge is the key to this game."
    };
  }
};

export const generateQuizBatch = async (subjects: Subject[], level: number): Promise<QuizQuestion[]> => {
  const promises = subjects.map(s => generateBattleQuestion(s, level));
  const results = await Promise.all(promises);
  return results.filter((q): q is QuizQuestion => q !== null);
};

export const getCompanionAdvice = async (
  locationName: string,
  questState: any,
  lastAction: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "I'm having trouble connecting to the archives.";

  const prompt = `You are 'Sparky', a helpful AI floating robot companion in a game called EduMon. 
  The player is currently at: ${locationName}.
  Quest State: ${JSON.stringify(questState)}.
  Last Action: ${lastAction}.
  
  Give a short, 1-sentence helpful hint or encouraging remark in the style of a pokedex/guide.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 60,
      }
    });
    return response.text || "Keep exploring!";
  } catch (error) {
    return "My sensors are fuzzy, but I believe in you!";
  }
};

export const generateMap = async (
    theme: string,
    width: number,
    height: number,
    exits: { x: number, y: number }[]
  ): Promise<number[][] | null> => {
    const ai = getClient();
    if (!ai) return null;
  
    const prompt = `Generate a 2D grid (array of arrays) for a top-down RPG map.
    Dimensions: ${width}x${height}.
    Theme: ${theme}.
    
    Legend:
    0: Walkable Path / Floor
    1: Wall / Obstacle / Tree
    2: Tall Grass (Battle Area)
    3: Door / Exit
  
    Requirements:
    1. The map must be surrounded by Walls (1) on the outer edges, EXCEPT at the specific coordinates provided below.
    2. Place a Door (3) at these exact coordinates: ${JSON.stringify(exits)}.
    3. Create a clear, walkable path (0) connecting all exits.
    4. Fill open space with a mix of Path (0) and Tall Grass (2) to create a maze-like but navigable environment.
    5. IMPORTANT: Ensure the path is continuous and NOT blocked.
    
    Return JSON with a 'tiles' property containing the 2D array.`;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tiles: {
                type: Type.ARRAY,
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      });
  
      const text = response.text;
      if (!text) return null;
      const json = JSON.parse(text);
      return json.tiles;
  
    } catch (error) {
      console.error("Gemini Map Gen Error:", error);
      return null;
    }
  };
