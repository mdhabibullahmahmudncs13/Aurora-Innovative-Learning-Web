# Payment Collections Setup Guide

## ⚠️ Required: Create Payment Collections in Appwrite

The bKash/Nagad payment system requires two new collections to be created in your Appwrite database. Follow these steps to resolve the authorization error:

## 🗄️ Step 1: Create Payment Methods Collection

1. **Navigate to Appwrite Console**
   - Go to your Appwrite Console
   - Select your project
   - Go to **Databases** → **Main Database**

2. **Create Collection**
   - Click **"Create Collection"**
   - **Collection ID**: `payment_methods`
   - **Collection Name**: `Payment Methods`
   - Click **"Create"**

3. **Add Attributes**
   Click **"Create Attribute"** for each of the following:

   | Attribute | Type | Size | Required | Default | Array |
   |-----------|------|------|----------|---------|-------|
   | methodType | String | 50 | ✅ Yes | - | ❌ No |
   | accountNumber | String | 100 | ✅ Yes | - | ❌ No |
   | accountName | String | 255 | ✅ Yes | - | ❌ No |
   | isActive | Boolean | - | ❌ No | true | ❌ No |
   | instructions | String | 1000 | ❌ No | - | ❌ No |
   | createdBy | String | 255 | ✅ Yes | - | ❌ No |
   | createdAt | DateTime | - | ✅ Yes | - | ❌ No |
   | updatedAt | DateTime | - | ✅ Yes | - | ❌ No |

4. **Set Permissions**
   - Go to **Settings** → **Permissions**
   - Add these permissions:
     - **Read**: `users` (all authenticated users)
     - **Create**: `role:admin` (admin users only)
     - **Update**: `role:admin` (admin users only)
     - **Delete**: `role:admin` (admin users only)

## 🗄️ Step 2: Create Payment Requests Collection

1. **Create Collection**
   - Click **"Create Collection"**
   - **Collection ID**: `payment_requests`
   - **Collection Name**: `Payment Requests`
   - Click **"Create"**

2. **Add Attributes**
   Click **"Create Attribute"** for each of the following:

   | Attribute | Type | Size | Required | Default | Array |
   |-----------|------|------|----------|---------|-------|
   | userId | String | 255 | ✅ Yes | - | ❌ No |
   | courseId | String | 255 | ✅ Yes | - | ❌ No |
   | paymentMethodId | String | 255 | ✅ Yes | - | ❌ No |
   | amount | Float | - | ✅ Yes | - | ❌ No |
   | transactionId | String | 255 | ✅ Yes | - | ❌ No |
   | senderNumber | String | 50 | ✅ Yes | - | ❌ No |
   | status | String | 50 | ❌ No | pending | ❌ No |
   | adminNotes | String | 1000 | ❌ No | - | ❌ No |
   | verifiedBy | String | 255 | ❌ No | - | ❌ No |
   | verifiedAt | DateTime | - | ❌ No | - | ❌ No |
   | expiresAt | DateTime | - | ✅ Yes | - | ❌ No |
   | createdAt | DateTime | - | ✅ Yes | - | ❌ No |
   | updatedAt | DateTime | - | ✅ Yes | - | ❌ No |

3. **Set Permissions**
   - Go to **Settings** → **Permissions**
   - Add these permissions:
     - **Read**: `users` (all authenticated users)
     - **Create**: `users` (all authenticated users)
     - **Update**: `role:admin` (admin users only)
     - **Delete**: `role:admin` (admin users only)

## 🔧 Step 3: Verify Setup

1. **Check Collections Exist**
   - In Appwrite Console, verify both collections are listed
   - Ensure all attributes are created correctly

2. **Test Permissions**
   - Make sure your user account has admin role
   - Restart your development server: `npm run dev`

3. **Access Payment Features**
   - Go to Admin Dashboard → Payment Methods tab
   - Go to Admin Dashboard → Payment Verification tab
   - Try creating a payment method

## 🎯 Quick Verification Commands

Run these in your project directory to test the collections:

```bash
# Navigate to front-end directory
cd front-end

# Test database connection
node -e "console.log('Testing collections...'); require('./src/lib/appwrite.js')"
```

## ⚡ Expected Results

After creating the collections, you should be able to:

✅ Access the Payment Methods tab in admin dashboard  
✅ Access the Payment Verification tab in admin dashboard  
✅ Create new bKash/Nagad payment methods  
✅ Students can submit payment requests  
✅ Admins can verify and approve payments  

## 🚨 Troubleshooting

### Still Getting Authorization Errors?

1. **Check Collection IDs**: Ensure they match exactly:
   - `payment_methods`
   - `payment_requests`

2. **Verify User Role**: Make sure your user has `role: "admin"` in the users collection

3. **Check Permissions**: Ensure permissions are set correctly for each collection

4. **Clear Cache**: Clear browser cache and restart development server

### Common Issues:

- **Collection doesn't exist**: Create the missing collection with proper attributes
- **Wrong permissions**: Update collection permissions as specified above
- **User not admin**: Change your user's role to "admin" in the users collection
- **Case sensitivity**: Collection IDs are case-sensitive, use lowercase

## 📞 Need Help?

If you continue to experience issues:

1. Check the detailed setup guide in `README-APPWRITE-SETUP.md`
2. Verify your `.env.local` file has correct Appwrite configuration
3. Ensure your Appwrite project is properly configured

---

**Note**: These collections are required for the bKash/Nagad payment system to function. Without them, you'll continue to see authorization errors when trying to access payment features.