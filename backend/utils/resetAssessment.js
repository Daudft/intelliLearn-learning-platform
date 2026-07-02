/*
 * DEV UTILITY — reset a user's initial assessment so they can take it again.
 *
 * Usage (from the backend folder):
 *   node utils/resetAssessment.js <email>
 *
 * It:
 *   1. Sets hasCompletedAssessment = false (so sign-in routes to /assessment)
 *   2. Clears assessmentLanguage / proficiencyLevel
 *   3. Deletes the user's LearningPath  (so a FRESH path is generated with the
 *      new difficulty logic instead of reusing the old same-level tasks)
 *   4. Deletes the user's past UserAssessment attempts (clean slate)
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const LearningPath = require('../models/LearningPath');
const UserAssessment = require('../models/UserAssessment');

dotenv.config();

const email = (process.argv[2] || '').trim().toLowerCase();

if (!email) {
  console.error('❌ Please pass an email:  node utils/resetAssessment.js <email>');
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ MongoDB connected');

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    user.hasCompletedAssessment = false;
    user.assessmentLanguage = undefined;
    user.proficiencyLevel = undefined;
    await user.save();
    console.log(`✓ Reset flags for ${email}`);

    const lp = await LearningPath.deleteOne({ userId: user._id });
    console.log(`✓ Deleted learning path (${lp.deletedCount})`);

    const ua = await UserAssessment.deleteMany({ userId: user._id });
    console.log(`✓ Deleted ${ua.deletedCount} past assessment attempt(s)`);

    console.log('\n🎉 Done. Sign in again → you will be sent to the initial assessment.');
  } catch (err) {
    console.error('❌ Reset error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
