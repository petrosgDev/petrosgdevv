import { NextRequest, NextResponse } from 'next/server';
import { getDefaultPortfolioBundle, type PortfolioBundle } from '@/data/portfolio';
import { getPublishedPortfolioServer } from '@/lib/serverPortfolio';
import {
  answerPortfolioQuestion,
  buildPortfolioSystemPrompt,
  type AssistantReply,
} from '@/lib/portfolioAssistant';

export const dynamic = 'force-dynamic';

interface HistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

async function tryOptionalLlmAnswer(
  question: string,
  history: HistoryTurn[],
  bundle: PortfolioBundle
): Promise<string | null> {
  const systemPrompt = buildPortfolioSystemPrompt(bundle);
  const geminiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();
  const openaiKey =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.AI_GATEWAY_API_KEY?.trim();

  if (geminiKey) {
    try {
      const contents = [
        ...history.slice(-6).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: question }] },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(7000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 360,
            },
          }),
        }
      );

      if (res.ok) {
        const json = (await res.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch {
      // Fall back seamlessly to local grounded engine
    }
  }

  if (openaiKey) {
    try {
      const endpoint = process.env.AI_GATEWAY_API_KEY?.trim()
        ? 'https://ai-gateway.vercel.sh/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const model = process.env.AI_GATEWAY_API_KEY?.trim()
        ? 'openai/gpt-4o-mini'
        : 'gpt-4o-mini';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        signal: AbortSignal.timeout(7000),
        body: JSON.stringify({
          model,
          temperature: 0.35,
          max_tokens: 360,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-6),
            { role: 'user', content: question },
          ],
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = json.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // Fall back seamlessly to local grounded engine
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      question?: unknown;
      history?: unknown;
    } | null;

    const question =
      typeof body?.question === 'string' ? body.question.trim().slice(0, 600) : '';

    if (!question) {
      return NextResponse.json(
        { error: 'Please enter a question about Petros Geto.' },
        { status: 400 }
      );
    }

    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const history: HistoryTurn[] = rawHistory
      .slice(-6)
      .filter(
        (item): item is HistoryTurn =>
          Boolean(item) &&
          typeof item === 'object' &&
          ((item as HistoryTurn).role === 'user' ||
            (item as HistoryTurn).role === 'assistant') &&
          typeof (item as HistoryTurn).content === 'string'
      )
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 800),
      }));

    const snapshot = await getPublishedPortfolioServer();
    const bundle = snapshot?.data ?? getDefaultPortfolioBundle();

    // Always compute contextual links via grounded engine; use optional LLM text if configured
    const engineReply = answerPortfolioQuestion(question, bundle);
    const llmAnswer = await tryOptionalLlmAnswer(question, history, bundle);

    const payload: AssistantReply = llmAnswer
      ? {
          answer: llmAnswer,
          links: engineReply.links,
          mode: 'llm',
        }
      : engineReply;

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Unable to answer right now. Please try again.' },
      { status: 500 }
    );
  }
}

