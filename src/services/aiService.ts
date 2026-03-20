import { GoogleGenAI } from "@google/genai";
import { Grade, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const askMathGuru = async (userMessage: string, grade: Grade = '6eme') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: `Tu es MathOS IA, un assistant mathématique expert pour les élèves de collège (6ème, 5ème, 4ème). 
        L'élève est actuellement en classe de ${grade === '6eme' ? '6ème' : grade === '5eme' ? '5ème' : '4ème'}.
        Réponds de manière pédagogique, encourageante et concise. 
        Utilise des emojis pour rendre la conversation agréable. 
        Si la question n'est pas liée aux mathématiques ou à l'école, rappelle poliment que tu es là pour l'aider en maths.`,
      },
    });
    return response.text || "Désolé, je n'ai pas pu générer de réponse. Peux-tu reformuler ?";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Une erreur est survenue lors de la connexion au cortex neural. Réessaie plus tard !";
  }
};

export const explainMathError = async (question: Question, wrongAnswer: string | number, grade: Grade) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `L'élève a répondu "${wrongAnswer}" à la question "${question.text}". La bonne réponse était "${question.answer}". Explique-lui pourquoi il s'est trompé et comment arriver au bon résultat pour un élève de ${grade}.`,
      config: {
        systemInstruction: "Tu es un professeur de mathématiques bienveillant. Explique l'erreur de manière simple et pédagogique. Sois encourageant et utilise des emojis. Réponse courte.",
      },
    });
    return response.text || `La bonne réponse était ${question.answer}. Continue tes efforts !`;
  } catch (error) {
    return `La bonne réponse était ${question.answer}. Continue tes efforts !`;
  }
};

export const generateTeacherContent = async (prompt: string, type: 'quiz' | 'lesson' | 'exercises') => {
  try {
    const systemInstructions = {
      quiz: "Génère un quiz de mathématiques structuré avec questions et réponses. Format clair.",
      lesson: "Génère un plan de cours de mathématiques détaillé avec objectifs, introduction, développement et conclusion.",
      exercises: "Génère une série d'exercices de mathématiques progressifs (facile, moyen, difficile) avec corrigés."
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: `Tu es le Cortex Administratif IA de MathOS. ${systemInstructions[type]} Utilise un ton professionnel mais innovant.`,
      },
    });
    return response.text || "Erreur lors de la génération du contenu.";
  } catch (error) {
    console.error('Error generating teacher content:', error);
    return "Désolé, le Cortex IA est surchargé. Réessayez plus tard.";
  }
};
