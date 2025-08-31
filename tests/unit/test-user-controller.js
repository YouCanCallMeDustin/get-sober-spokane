const userController = require('./controllers/userController');

async function testUserController() {
  try {
    const testUserId = 'e84a7281-1aae-4759-969d-26de0ec1435f';
    
    console.log('🔍 Testing userController.getUserProfile...');
    console.log('User ID:', testUserId);
    
    const profile = await userController.getUserProfile(testUserId);
    
    if (profile) {
      console.log('✅ Profile fetched successfully:');
      console.log('  - ID:', profile.id);
      console.log('  - Name:', profile.name);
      console.log('  - Email:', profile.email);
      console.log('  - Sobriety Days:', profile.sobrietyDays);
      console.log('  - Location:', profile.location);
      console.log('  - Milestones:', profile.milestones?.length || 0);
    } else {
      console.log('❌ Profile is null');
    }
    
  } catch (error) {
    console.error('❌ Error in userController:', error);
    console.error('Stack trace:', error.stack);
  }
}

testUserController();
