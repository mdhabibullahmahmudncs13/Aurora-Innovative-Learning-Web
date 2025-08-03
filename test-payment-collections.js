// Test script to verify payment collections setup
const { databases, DATABASE_IDS, COLLECTION_IDS } = require('./src/lib/appwrite.js');
const { Query } = require('appwrite');

async function testPaymentCollections() {
  console.log('🔍 Testing Payment Collections Setup...');
  console.log('=====================================\n');

  try {
    // Test Payment Methods Collection
    console.log('📋 Testing Payment Methods Collection...');
    try {
      const paymentMethods = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_METHODS,
        [Query.limit(1)]
      );
      console.log('✅ PAYMENT_METHODS collection exists');
      console.log(`   Found ${paymentMethods.total} payment methods\n`);
    } catch (error) {
      if (error.code === 404) {
        console.log('❌ PAYMENT_METHODS collection does not exist');
        console.log('   Collection ID expected:', COLLECTION_IDS.PAYMENT_METHODS);
        console.log('   Please create this collection in Appwrite Console\n');
      } else {
        console.log('❌ Error accessing PAYMENT_METHODS:', error.message);
        console.log('   This might be a permissions issue\n');
      }
    }

    // Test Payment Requests Collection
    console.log('📋 Testing Payment Requests Collection...');
    try {
      const paymentRequests = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_REQUESTS,
        [Query.limit(1)]
      );
      console.log('✅ PAYMENT_REQUESTS collection exists');
      console.log(`   Found ${paymentRequests.total} payment requests\n`);
    } catch (error) {
      if (error.code === 404) {
        console.log('❌ PAYMENT_REQUESTS collection does not exist');
        console.log('   Collection ID expected:', COLLECTION_IDS.PAYMENT_REQUESTS);
        console.log('   Please create this collection in Appwrite Console\n');
      } else {
        console.log('❌ Error accessing PAYMENT_REQUESTS:', error.message);
        console.log('   This might be a permissions issue\n');
      }
    }

    // Test other required collections
    console.log('📋 Testing Other Required Collections...');
    const requiredCollections = [
      { name: 'USERS', id: COLLECTION_IDS.USERS },
      { name: 'COURSES', id: COLLECTION_IDS.COURSES },
      { name: 'ENROLLMENTS', id: COLLECTION_IDS.ENROLLMENTS }
    ];

    for (const collection of requiredCollections) {
      try {
        await databases.listDocuments(
          DATABASE_IDS.MAIN,
          collection.id,
          [Query.limit(1)]
        );
        console.log(`✅ ${collection.name} collection exists`);
      } catch (error) {
        if (error.code === 404) {
          console.log(`❌ ${collection.name} collection does not exist`);
        } else {
          console.log(`⚠️  ${collection.name} collection access issue:`, error.message);
        }
      }
    }

    console.log('\n=====================================');
    console.log('🎯 Next Steps:');
    console.log('1. Create missing collections in Appwrite Console');
    console.log('2. Set proper permissions for each collection');
    console.log('3. Ensure your user has admin role');
    console.log('4. Restart the development server');
    console.log('\n📖 See PAYMENT-COLLECTIONS-SETUP.md for detailed instructions');

  } catch (error) {
    console.log('❌ Failed to connect to Appwrite:', error.message);
    console.log('\n🔧 Check your .env.local file:');
    console.log('- NEXT_PUBLIC_APPWRITE_ENDPOINT');
    console.log('- NEXT_PUBLIC_APPWRITE_PROJECT_ID');
    console.log('- NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID');
  }
}

// Run the test
testPaymentCollections().catch(console.error);