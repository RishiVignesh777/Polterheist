import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // Helper to initialize Google Gen AI client with required telemetry
  function getGenAIClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured. Please set your key in Settings > Secrets.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      app: 'Polterheist Godot 4 Studio',
    });
  });

  // Multi-turn Chat Endpoint for Godot 4 Architecture Co-Pilot
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages, model = 'gemini-3.5-flash', systemInstruction } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      const ai = getGenAIClient();

      const defaultSystemInstruction = `You are a Principal Game Engine Architect and Godot 4 specialist focusing on 2D physics, stealth mechanics, and GDScript optimization.
You are assisting a developer in building "Polterheist", a 2D physics-based stealth puzzle game where the player controls a ghost possessing objects to knock out guards without causing a 100% Panic lockdown.
Your answers should be:
1. Precise, idiomatic Godot 4.x GDScript with type annotations (e.g., Vector2, RigidBody2D, CharacterBody2D, Area2D, etc.).
2. Explaining node tree connections, physics layers/masks, and signal pipelines.
3. Concise, production-ready, and formatted in clean markdown code blocks with comments.`;

      // Transform messages to Gemini SDK contents format
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }],
      }));

      // Allow models specified by user prompt: gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3.1-pro-preview, gemini-3.8-flash
      const selectedModel = model || 'gemini-3.5-flash';

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: systemInstruction || defaultSystemInstruction,
        },
      });

      const replyText = response.text || 'No response generated.';
      return res.json({ text: replyText });
    } catch (err: unknown) {
      console.error('Error in /api/chat:', err);
      const message = err instanceof Error ? err.message : 'Unknown chat error';
      return res.status(500).json({ error: message });
    }
  });

  // Image Generation Endpoint (using gemini-3-pro-image-preview with 1K, 2K, 4K size affordance)
  app.post('/api/generate-image', async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        imageSize = '1K',
        aspectRatio = '1:1',
        model = 'gemini-3-pro-image-preview',
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt string is required.' });
      }

      const validSizes = ['1K', '2K', '4K'];
      const resolvedSize = validSizes.includes(imageSize) ? imageSize : '1K';
      const validRatios = ['1:1', '16:9', '4:3', '3:4', '9:16'];
      const resolvedRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

      const ai = getGenAIClient();

      // Preferred model as instructed: gemini-3-pro-image-preview; fallback to gemini-3.1-flash-image if unavailable
      let targetModel = model || 'gemini-3-pro-image-preview';

      let response;
      try {
        response = await ai.models.generateContent({
          model: targetModel,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: resolvedRatio,
              imageSize: resolvedSize,
            },
          },
        });
      } catch (primaryErr: unknown) {
        console.warn(`Primary image generation with ${targetModel} failed, trying fallback gemini-3.1-flash-image:`, primaryErr);
        targetModel = 'gemini-3.1-flash-image';
        response = await ai.models.generateContent({
          model: targetModel,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: resolvedRatio,
              imageSize: resolvedSize,
            },
          },
        });
      }

      let imageUrl = '';
      let textFeedback = '';

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textFeedback += part.text;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({
          error: 'No image data returned from model.',
          feedback: textFeedback,
        });
      }

      return res.json({
        imageUrl,
        modelUsed: targetModel,
        imageSize: resolvedSize,
        aspectRatio: resolvedRatio,
        feedback: textFeedback,
      });
    } catch (err: unknown) {
      console.error('Error in /api/generate-image:', err);
      const message = err instanceof Error ? err.message : 'Unknown image generation error';
      return res.status(500).json({ error: message });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Polterheist Dev Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
