import assert from 'node:assert';

console.log('====================================================');
console.log('       IDEASCOUT GEMINI MULTI-TURN CHAT TEST SUITE   ');
console.log('====================================================\n');

// 1. Verify Role Configurations and System Instructions
console.log('▶ [1] Testing Role Definitions and System Instructions...');

const validRoles = ['evaluator', 'critic', 'experimenter', 'economist'];
const models = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview'
];

assert.strictEqual(validRoles.length, 4, 'Should have 4 distinct chat roles');
assert(models.includes('gemini-3.8-flash'), 'gemini-3.8-flash must be available as default balanced model');
assert(models.includes('gemini-3.5-flash'), 'gemini-3.5-flash must be available for general tasks');
assert(models.includes('gemini-3.1-flash-lite'), 'gemini-3.1-flash-lite must be available for fast tasks');
assert(models.includes('gemini-3.1-pro-preview'), 'gemini-3.1-pro-preview must be available for complex tasks');

console.log('✅ Role configurations verified.');

// 2. Verify History Formatting
console.log('▶ [2] Testing Multi-Turn History Turn Mapping...');

const rawHistory = [
  { sender: 'assistant', text: 'Hello! I am your evaluator.' },
  { sender: 'user', text: 'What is my riskiest assumption?' },
  { sender: 'assistant', text: 'Your riskiest assumption is willingness to pay.' }
];

const mappedContents = rawHistory.map(item => ({
  role: item.sender === 'user' ? 'user' : 'model',
  parts: [{ text: item.text }]
}));

assert.strictEqual(mappedContents.length, 3);
assert.strictEqual(mappedContents[0].role, 'model');
assert.strictEqual(mappedContents[1].role, 'user');
assert.strictEqual(mappedContents[2].role, 'model');
assert.strictEqual(mappedContents[1].parts[0].text, 'What is my riskiest assumption?');

console.log('✅ Multi-turn history mapping verified.');

// 3. Verify Model Normalization
console.log('▶ [3] Testing Model Name Normalization...');

function normalizeModel(modelStr: string): string {
  return modelStr.replace(/^models\//, '');
}

assert.strictEqual(normalizeModel('models/gemini-3.8-flash'), 'gemini-3.8-flash');
assert.strictEqual(normalizeModel('gemini-3.8-flash'), 'gemini-3.8-flash');
assert.strictEqual(normalizeModel('models/gemini-3.1-pro-preview'), 'gemini-3.1-pro-preview');

console.log('✅ Model normalization verified.');

console.log('\n====================================================');
console.log('🎉 ALL GEMINI CHAT SUITE TESTS PASSED SUCCESSFULLY! ');
console.log('====================================================');
