const mongoose = require('mongoose');
const Assessment = require('./models/Assessment');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Simulate getAdaptiveQuestion for each language
    const languages = ['python', 'java', 'c'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    for (const lang of languages) {
      console.log(`\n=== Testing ${lang.toUpperCase()} ===`);
      const questions = new Set();
      const duplicates = [];
      
      // Get 10 questions per language using aggregation pipeline (same as API)
      for (let i = 0; i < 10; i++) {
        const result = await Assessment.aggregate([
          { $match: { language: lang, difficulty: difficulties[Math.floor(Math.random() * 3)] } },
          { $group: { _id: '$questionNumber', doc: { $first: '$$ROOT' } } },
          { $sample: { size: 1 } },
          { $replaceRoot: { newRoot: '$doc' } }
        ]);
        
        if (result.length > 0) {
          const q = result[0];
          const qKey = `${q.language}-${q.questionNumber}`;
          
          if (questions.has(qKey)) {
            duplicates.push(qKey);
          } else {
            questions.add(qKey);
            console.log(`  Q${i+1}: #${q.questionNumber} - "${q.question.substring(0, 50)}..."`);
          }
        }
      }
      
      console.log(`  Total unique: ${questions.size}, Duplicates: ${duplicates.length}`);
      if (duplicates.length > 0) {
        console.log(`  ⚠ Duplicate questions: ${duplicates.join(', ')}`);
      }
    }
    
    // Verify no cross-language repetition
    console.log('\n=== Cross-language check ===');
    for (const lang1 of languages) {
      for (const lang2 of languages) {
        if (lang1 < lang2) {
          const q1Topics = await Assessment.find({ language: lang1 }).distinct('topic');
          const q2Topics = await Assessment.find({ language: lang2 }).distinct('topic');
          const commonTopics = q1Topics.filter(t => q2Topics.includes(t));
          console.log(`${lang1.toUpperCase()} vs ${lang2.toUpperCase()}: ${commonTopics.length} common topics`);
        }
      }
    }
    
    console.log('\n✓ Assessment test complete!');
    await mongoose.connection.close();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
