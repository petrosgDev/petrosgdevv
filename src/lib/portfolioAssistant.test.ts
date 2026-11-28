import test from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultPortfolioBundle } from '../data/portfolio';
import {
  answerPortfolioQuestion,
  buildGeminiConversationContents,
  buildPortfolioSystemPrompt,
  normalizeGeminiAssistantReply,
  parseStructuredGeminiJson,
} from './portfolioAssistant';

test('answerPortfolioQuestion rejects off-topic queries instead of dumping unrelated experience', () => {
  const bundle = getDefaultPortfolioBundle();

  const ghana = answerPortfolioQuestion('who is the president of ghna', bundle);
  assert.equal(ghana.offTopic, true);
  assert.match(ghana.answer, /only answer questions about/i);
  assert.doesNotMatch(ghana.answer, /RiseTech|Debre Birhan University|Verified Experience/i);

  const weather = answerPortfolioQuestion('what is the weather in tokyo today?', bundle);
  assert.equal(weather.offTopic, true);
  assert.doesNotMatch(weather.answer, /RiseTech|Sprint Studio/i);

  // Even after talking about Aman Pay, an unrelated short question must NOT falsely hijack prior project context
  const afterProject = answerPortfolioQuestion(
    'capital of france?',
    bundle,
    [
      { role: 'user', content: 'tell me about Aman Pay' },
      { role: 'assistant', content: 'Aman Pay is an escrow payment platform.' },
    ]
  );
  assert.equal(afterProject.offTopic, true);
  assert.doesNotMatch(afterProject.answer, /Aman Pay/i);
});

test('answerPortfolioQuestion answers critical recruiter questions grounded in Petros data', () => {
  const bundle = getDefaultPortfolioBundle();

  const strengths = answerPortfolioQuestion('what is his good side?', bundle);
  assert.match(strengths.answer, /Petros Geto|INSA|Sprint Studio|RiseTech/);
  assert.match(strengths.answer, /PostgreSQL|MySQL|C\+\+17|Next\.js/);
  assert.ok(strengths.links.some((l) => l.href === '/api/resume/'));
  assert.ok((strengths.followUps?.length ?? 0) >= 2);

  const hire = answerPortfolioQuestion('did i hire him? should I hire him?', bundle);
  assert.match(hire.answer, /private employer records|public portfolio/i);
  assert.match(hire.answer, /Sprint Studio|RiseTech|INSA/);
  assert.ok(hire.links.some((l) => l.href === '/contact'));

  const weaknesses = answerPortfolioQuestion('what are his weaknesses or limitations?', bundle);
  assert.match(weaknesses.answer, /Debre Birhan University/);
  assert.doesNotMatch(weaknesses.answer, /Mikiyas/i);

  const backend = answerPortfolioQuestion('tell me about his backend and database skills', bundle);
  assert.match(backend.answer, /PostgreSQL|MySQL/);
  assert.match(backend.answer, /Aman Pay|Event Hub/);

  const projectMatch = answerPortfolioQuestion('tell me about Aman Pay', bundle);
  assert.match(projectMatch.answer, /Aman Pay/);
  assert.ok(projectMatch.links.some((l) => l.href === '/work/aman-pay/'));
  assert.ok((projectMatch.followUps?.length ?? 0) >= 2);
});

test('answerPortfolioQuestion handles compound multi-intent questions without dropping facets', () => {
  const bundle = getDefaultPortfolioBundle();

  const compound = answerPortfolioQuestion(
    'What are his strengths and limitations if I hire him for backend engineering?',
    bundle
  );

  assert.match(compound.answer, /Hiring Assessment/i);
  assert.match(compound.answer, /Core Strengths/i);
  assert.match(compound.answer, /Honest Limitations/i);
  assert.match(compound.answer, /Backend & Database Engineering Fit/i);
  assert.match(compound.answer, /PostgreSQL|MySQL/);
  assert.ok(compound.links.some((l) => l.href === '/work/aman-pay/'));
});

test('answerPortfolioQuestion resolves multi-turn conversation history and synonyms', () => {
  const bundle = getDefaultPortfolioBundle();

  const synonymReply = answerPortfolioQuestion('show his fintech escrow payment work', bundle);
  assert.match(synonymReply.answer, /Aman Pay/);

  const bankingTurn1 = answerPortfolioQuestion('tell me about Banking System', bundle);
  assert.match(bankingTurn1.answer, /Banking System/);

  const bankingChallengeFollowUp = answerPortfolioQuestion(
    'what challenges did he solve there?',
    bundle,
    [
      { role: 'user', content: 'tell me about Banking System' },
      { role: 'assistant', content: bankingTurn1.answer },
    ]
  );
  assert.match(bankingChallengeFollowUp.answer, /Banking System/);
  assert.match(bankingChallengeFollowUp.answer, /Engineering Challenge|Problem Statement/);
  assert.ok(bankingChallengeFollowUp.links.some((l) => l.href === '/work/banking-system/'));

  const nexusTurn1 = answerPortfolioQuestion('tell me about Nexus Campus Services', bundle);
  const nexusStackFollowUp = answerPortfolioQuestion(
    'what tech stack did it use?',
    bundle,
    [
      { role: 'user', content: 'tell me about Nexus Campus Services' },
      { role: 'assistant', content: nexusTurn1.answer },
    ]
  );
  assert.match(nexusStackFollowUp.answer, /Nexus Campus Services/);
  assert.match(nexusStackFollowUp.answer, /JavaFX/);
  assert.match(nexusStackFollowUp.answer, /MySQL/);
  assert.ok(nexusStackFollowUp.links.some((l) => l.href === '/work/nexus-campus-services/'));
});

test('normalizeGeminiAssistantReply verifies slugs strictly and handles off-topic replies cleanly', () => {
  const bundle = getDefaultPortfolioBundle();

  const parsed = parseStructuredGeminiJson(
    '```json\n{"answer":"Aman Pay uses Next.js and Chapa escrow.","offTopic":false,"referencedProjectSlugs":["aman-pay","fake-hallucinated-slug"],"includeResumeLink":true,"includeContactLink":false,"includeWorkLink":false,"includeBlogLink":false,"followUps":["What challenges did Aman Pay solve?","Compare his backend stack"]}\n```'
  );
  assert.ok(parsed);

  const normalized = normalizeGeminiAssistantReply(parsed, bundle, 'Tell me about Aman Pay');
  assert.equal(normalized.mode, 'llm');
  assert.equal(normalized.offTopic, false);
  assert.ok(normalized.links.some((l) => l.href === '/work/aman-pay/'));
  assert.ok(normalized.links.some((l) => l.href === '/api/resume/'));
  assert.ok(!normalized.links.some((l) => l.href.includes('fake-hallucinated-slug')));

  const offTopicNormalized = normalizeGeminiAssistantReply(
    {
      answer: "I only answer questions about Petros Geto's engineering portfolio.",
      offTopic: true,
      referencedProjectSlugs: ['aman-pay'],
      followUps: ['Should I hire Petros?'],
    },
    bundle,
    'who is the president of ghna'
  );
  assert.equal(offTopicNormalized.offTopic, true);
  assert.ok(!offTopicNormalized.links.some((l) => l.href === '/work/aman-pay/'));
  assert.ok(offTopicNormalized.links.some((l) => l.href === '/work'));
});

test('buildGeminiConversationContents produces alternating turns ending with user question', () => {
  const contents = buildGeminiConversationContents(
    [
      { role: 'assistant', content: 'Stale leading message' },
      { role: 'user', content: 'Tell me about Aman Pay' },
      { role: 'assistant', content: 'Aman Pay is a fintech escrow app.' },
    ],
    'What stack did it use?'
  );

  assert.equal(contents.length, 3);
  assert.equal(contents[0].role, 'user');
  assert.equal(contents[1].role, 'model');
  assert.equal(contents[2].role, 'user');
  assert.equal(contents[2].parts[0].text, 'What stack did it use?');
});

test('buildPortfolioSystemPrompt includes strict off-topic rules, slugs, and grounding', () => {
  const bundle = getDefaultPortfolioBundle();
  const prompt = buildPortfolioSystemPrompt(bundle);
  assert.match(prompt, /Petros Geto/);
  assert.match(prompt, /\[slug: aman-pay\]/);
  assert.match(prompt, /STRICT SCOPE & OFF-TOPIC POLICY/);
  assert.match(prompt, /Architecture:/);
  assert.match(prompt, /Challenge Solved:/);
  assert.match(prompt, /Never invent employers/);
});
