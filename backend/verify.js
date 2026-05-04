const mongoose = require('mongoose');
const Assessment = require('./models/Assessment');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Count by language
    const pythonCount = await Assessment.countDocuments({ language: 'python' });
    const javaCount = await Assessment.countDocuments({ language: 'java' });
    const cCount = await Assessment.countDocuments({ language: 'c' });
    const total = await Assessment.countDocuments({});
    
    console.log('Database Statistics:');
    console.log(`✓ Python questions: ${pythonCount}`);
    console.log(`✓ Java questions: ${javaCount}`);
    console.log(`✓ C questions: ${cCount}`);
    console.log(`✓ Total questions: ${total}`);
    
    // Sample from each language
    console.log('\nSample questions from each language:');
    
    const pythonSample = await Assessment.findOne({ language: 'python' });
    console.log(`Python sample: "${pythonSample.question.substring(0, 60)}..."`);
    
    const javaSample = await Assessment.findOne({ language: 'java' });
    console.log(`Java sample: "${javaSample.question.substring(0, 60)}..."`);
    
    const cSample = await Assessment.findOne({ language: 'c' });
    console.log(`C sample: "${cSample.question.substring(0, 60)}..."`);
    
    console.log('\n✓ Database verification complete!');
    await mongoose.connection.close();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
