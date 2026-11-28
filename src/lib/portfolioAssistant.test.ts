import test from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultPortfolioBundle } from '../data/portfolio';
import {
  answerPortfolioQuestion,
  buildPortfolioSystemPrompt,
} from './portfolioAssistant';

test('answerPortfolioQuestion answers critical recruiter questions grounded in Petros data', () => {
  const bundle = getDefaultPortfolioBundle();

  const strengths = answerPortfolioQuestion('what is his good side?', bundle);
  assert.match(strengths.answer, /Petros Geto/);
  assert.match(strengths.answer, /INSA|Sprint Studio|RiseTech/);
  assert.ok(strengths.links.some((l) => l.href === '/api/resume/'));

  const hire = answerPortfolioQuestion('did i hire him? should I hire him?', bundle);
  assert.match(hire.answer, /Petros Geto/);
  assert.match(hire.answer, /Next\.js|TypeScript|Node\.js/);
  assert.ok(hire.links.some((l) => l.href === '/contact'));

  const weaknesses = answerPortfolioQuestion('what are his weaknesses or limitations?', bundle);
  assert.match(weaknesses.answer, /Debre Birhan University/);
  assert.doesNotMatch(weaknesses.answer, /Mikiyas/i);

  const backend = answerPortfolioQuestion('tell me about his backend and database skills', bundle);
  assert.match(backend.answer, /PostgreSQL|MySQL|Firestore/);

  const projectMatch = answerPortfolioQuestion('tell me about Aman Pay', bundle);
  assert.match(projectMatch.answer, /Aman Pay/);
  assert.ok(projectMatch.links.some((l) => l.href === '/work/aman-pay/'));
});

test('buildPortfolioSystemPrompt includes verified portfolio facts and grounding rules', () => {
  const bundle = getDefaultPortfolioBundle();
  const prompt = buildPortfolioSystemPrompt(bundle);
  assert.match(prompt, /Petros Geto/);
  assert.match(prompt, /Aman Pay/);
  assert.match(prompt, /RiseTech/);
  assert.match(prompt, /Sprint Studio/);
});
