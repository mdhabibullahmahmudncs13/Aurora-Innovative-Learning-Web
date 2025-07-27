// Test script to diagnose database connection issues
const { Client, Databases, ID } = require('appwrite');
require('dotenv').config({ path: '.env.local' });

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS_ID;

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    console.log('📋 Database ID:', DATABASE_ID);
    console.log('📋 Collection ID:', COLLECTION_ID);
    console.log('📋 Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('📋 Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    
    try {
        // Test 1: List documents to check if collection exists
        console.log('\n🧪 Test 1: Checking if collection exists...');
        const documents = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, []);
        console.log('✅ Collection exists! Found', documents.documents.length, 'documents');
        
        // Test 2: Try to create a test document
        console.log('\n🧪 Test 2: Testing document creation...');
        const testDoc = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                email: 'test@example.com',
                name: 'Test User',
                role: 'regular',
                avatar: null,
                bio: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );
        console.log('✅ Document created successfully:', testDoc.$id);
        
        // Clean up test document
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, testDoc.$id);
        console.log('✅ Test document cleaned up');
        
        console.log('\n🎉 All tests passed! Database is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Database test failed:');
        console.error('Error code:', error.code);
        console.error('Error type:', error.type);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        
        // Provide specific guidance based on error type
        if (error.code === 404) {
            if (error.message.includes('database')) {
                console.log('\n💡 Solution: Create a database with ID "' + DATABASE_ID + '" in your Appwrite console');
            } else if (error.message.includes('collection')) {
                console.log('\n💡 Solution: Create a collection with ID "' + COLLECTION_ID + '" in your database');
            }
        } else if (error.code === 401) {
            console.log('\n💡 Solution: Check your API key permissions or authentication settings');
        }
    }
}

testDatabaseConnection();