import { Amplify } from 'aws-amplify'

// Extract env vars (Vite exposes only those prefixed with VITE_)
const { VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID, VITE_AWS_REGION } = import.meta.env

// Basic runtime validation to help detect misconfiguration early
if (!VITE_COGNITO_USER_POOL_ID || !VITE_COGNITO_CLIENT_ID) {
  // Provide a clear, actionable error in the browser console
  console.error('[Auth] Missing required Cognito environment variables.', {
    VITE_COGNITO_USER_POOL_ID,
    VITE_COGNITO_CLIENT_ID,
    hint: 'Ensure Amplify Console (or Terraform) defines VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID. For local dev, create a .env file based on .env.example.',
  })
}

const authConfig = {
  Auth: {
    Cognito: {
      userPoolId: VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: VITE_COGNITO_CLIENT_ID || '',
      region: VITE_AWS_REGION || 'us-east-1',
    },
  },
}

// Configure Amplify once at app startup
Amplify.configure(authConfig)

export default authConfig
