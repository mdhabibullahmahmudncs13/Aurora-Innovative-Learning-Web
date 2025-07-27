import { databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Permission, Role } from 'appwrite';

/**
 * Utility functions to help set up the Appwrite database collections
 * This is mainly for development and debugging purposes
 */

/**
 * Check if a collection exists
 */
export const checkCollectionExists = async (databaseId, collectionId) => {
  try {
    await databases.listDocuments(databaseId, collectionId, []);
    return true;
  } catch (error) {
    if (error.code === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Check if the main database exists
 */
export const checkDatabaseExists = async (databaseId) => {
  try {
    // Test database existence by trying to list documents from users collection
    await databases.listDocuments(databaseId, COLLECTION_IDS.USERS, []);
    return true;
  } catch (error) {
    if (error.code === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Get database and collection status
 */
export const getDatabaseStatus = async () => {
  const status = {
    database: {
      exists: false,
      id: DATABASE_IDS.MAIN
    },
    collections: {
      users: { exists: false, id: COLLECTION_IDS.USERS },
      courses: { exists: false, id: COLLECTION_IDS.COURSES },
      enrollments: { exists: false, id: COLLECTION_IDS.ENROLLMENTS }
    },
    errors: []
  };

  try {
    // Check database by trying to list documents from users collection
    try {
      await databases.listDocuments(DATABASE_IDS.MAIN, COLLECTION_IDS.USERS, []);
      status.database.exists = true;
      status.database.id = DATABASE_IDS.MAIN;
      console.log('✅ Database found');
      console.log('📋 Database ID:', DATABASE_IDS.MAIN);
    } catch (error) {
      status.database.exists = false;
      status.errors.push(`Database not found: ${error.message}`);
      console.error('❌ Database not found:', error);
      console.log('📋 Looking for Database ID:', DATABASE_IDS.MAIN);
    }
    
    if (status.database.exists) {
      // Check collections
      status.collections.users.exists = await checkCollectionExists(DATABASE_IDS.MAIN, COLLECTION_IDS.USERS);
      status.collections.courses.exists = await checkCollectionExists(DATABASE_IDS.MAIN, COLLECTION_IDS.COURSES);
      status.collections.enrollments.exists = await checkCollectionExists(DATABASE_IDS.MAIN, COLLECTION_IDS.ENROLLMENTS);
    } else {
      status.errors.push(`Database '${DATABASE_IDS.MAIN}' does not exist`);
    }
  } catch (error) {
    status.errors.push(`Error checking database status: ${error.message}`);
  }

  return status;
};



/**
 * Test database connectivity and permissions
 */
export const testDatabaseConnection = async () => {
  const results = {
    canConnect: false,
    canRead: false,
    canWrite: false,
    errors: []
  };

  try {
    // Test basic connection by trying to list documents from users collection
    await databases.listDocuments(DATABASE_IDS.MAIN, COLLECTION_IDS.USERS, []);
    results.canConnect = true;

    // Test read permissions
    try {
      await databases.listDocuments(DATABASE_IDS.MAIN, COLLECTION_IDS.USERS, []);
      results.canRead = true;
    } catch (readError) {
      results.errors.push(`Cannot read from users collection: ${readError.message}`);
    }

    // Test write permissions (try to create a test document)
    try {
      const testDoc = await databases.createDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.USERS,
        'test-doc-id',
        {
          email: 'test@example.com',
          name: 'Test User',
          role: 'regular',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      
      // Clean up test document
      await databases.deleteDocument(DATABASE_IDS.MAIN, COLLECTION_IDS.USERS, 'test-doc-id');
      results.canWrite = true;
    } catch (writeError) {
      results.errors.push(`Cannot write to users collection: ${writeError.message}`);
    }
  } catch (error) {
    results.errors.push(`Cannot connect to database: ${error.message}`);
  }

  return results;
};



/**
 * Generate setup instructions based on current status
 */
export const generateSetupInstructions = async () => {
  const status = await getDatabaseStatus();
  const instructions = [];

  if (!status.database.exists) {
    instructions.push({
      step: 1,
      title: 'Create Database',
      description: `Create a database with ID '${DATABASE_IDS.MAIN}' in your Appwrite console`,
      priority: 'high'
    });
  }

  if (!status.collections.users.exists) {
    instructions.push({
      step: 2,
      title: 'Create Users Collection',
      description: `Create a collection with ID '${COLLECTION_IDS.USERS}' with attributes: email (string), name (string), role (string), avatar (string), bio (string), createdAt (datetime), updatedAt (datetime)`,
      priority: 'high'
    });
  }

  if (!status.collections.courses.exists) {
    instructions.push({
      step: 3,
      title: 'Create Courses Collection',
      description: `Create a collection with ID '${COLLECTION_IDS.COURSES}' with appropriate attributes for course data`,
      priority: 'medium'
    });
  }

  if (!status.collections.enrollments.exists) {
    instructions.push({
      step: 4,
      title: 'Create Enrollments Collection',
      description: `Create a collection with ID '${COLLECTION_IDS.ENROLLMENTS}' with appropriate attributes for enrollment data`,
      priority: 'medium'
    });
  }

  instructions.push({
    step: 5,
    title: 'Set Permissions',
    description: 'Set read/write permissions for authenticated users on all collections',
    priority: 'high'
  });

  return {
    status,
    instructions,
    isSetupComplete: status.database.exists && status.collections.users.exists
  };
};

/**
 * Log detailed database information for debugging
 */
export const logDatabaseInfo = async () => {
  console.group('🔍 Database Setup Information');
  
  console.log('📋 Configuration:');
  console.log('- Database ID:', DATABASE_IDS.MAIN);
  console.log('- Users Collection ID:', COLLECTION_IDS.USERS);
  console.log('- Courses Collection ID:', COLLECTION_IDS.COURSES);
  console.log('- Enrollments Collection ID:', COLLECTION_IDS.ENROLLMENTS);
  
  try {
    const setupInfo = await generateSetupInstructions();
    
    console.log('\n📊 Current Status:');
    console.log('- Database exists:', setupInfo.status.database.exists);
    console.log('- Users collection exists:', setupInfo.status.collections.users.exists);
    console.log('- Courses collection exists:', setupInfo.status.collections.courses.exists);
    console.log('- Enrollments collection exists:', setupInfo.status.collections.enrollments.exists);
    console.log('- Setup complete:', setupInfo.isSetupComplete);
    
    if (setupInfo.status.errors.length > 0) {
      console.log('\n❌ Errors:');
      setupInfo.status.errors.forEach(error => console.log('- ' + error));
    }
    
    if (setupInfo.instructions.length > 0) {
      console.log('\n📝 Required Setup Steps:');
      setupInfo.instructions.forEach(instruction => {
        console.log(`${instruction.step}. ${instruction.title} (${instruction.priority} priority)`);
        console.log(`   ${instruction.description}`);
      });
    }
    
    // Test connection
    console.log('\n🔗 Testing Connection...');
    const connectionTest = await testDatabaseConnection();
    console.log('- Can connect:', connectionTest.canConnect);
    console.log('- Can read:', connectionTest.canRead);
    console.log('- Can write:', connectionTest.canWrite);
    
    if (connectionTest.errors.length > 0) {
      console.log('\n⚠️ Connection Issues:');
      connectionTest.errors.forEach(error => console.log('- ' + error));
    }
    
  } catch (error) {
    console.error('❌ Error checking database setup:', error);
  }
  
  console.groupEnd();
};