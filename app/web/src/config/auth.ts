import { Amplify } from 'aws-amplify'

// Extract env vars (Vite exposes only those prefixed with VITE_)
const { VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID, VITE_AWS_REGION, VITE_DEBUG } =
  import.meta.env

// Basic runtime validation to help detect misconfiguration early
if (!VITE_COGNITO_USER_POOL_ID || !VITE_COGNITO_CLIENT_ID) {
  console.error('[Auth] Missing required Cognito environment variables.', {
    VITE_COGNITO_USER_POOL_ID,
    VITE_COGNITO_CLIENT_ID,
    hint: 'Ensure Amplify Console (or Terraform) defines VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID. For local dev, create .env based on .env.example.',
  })
}

// Build config object
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

// Lightweight cache inspection & clearing utilities to combat stale pool/client IDs.
// Usage in browser console (when VITE_DEBUG=true):
//   window.__MERIDA_AUTH_DEBUG.inspect()
//   window.__MERIDA_AUTH_DEBUG.clearAll()
declare global {
  interface Window {
    __MERIDA_AUTH_DEBUG?: {
      inspect: () => void
      clearAll: (opts?: { reconfigure?: boolean }) => void
    }
  }
}

function buildReport() {
  const config = Amplify.getConfig()?.Auth?.Cognito || {}
  const keys = Object.keys(localStorage)
  const cognitoKeys = keys.filter((k) => k.includes('CognitoIdentityServiceProvider'))
  return {
    env: { VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID, VITE_AWS_REGION },
    configured: config,
    cognitoLocalStorageKeys: cognitoKeys,
  }
}

function clearAll(opts?: { reconfigure?: boolean }) {
  const before = buildReport()
  // Remove Amplify/Cognito related localStorage & sessionStorage keys
  const removeMatch = (store: Storage) => {
    Object.keys(store).forEach((k) => {
      if (k.includes('CognitoIdentityServiceProvider')) {
        store.removeItem(k)
      }
    })
  }
  removeMatch(localStorage)
  removeMatch(sessionStorage)
  // Attempt to clear old hosted UI state markers
  ;['amplify-signin-with-hostedUI'].forEach((k) => localStorage.removeItem(k))
  const after = buildReport()
  console.info('[Auth Debug] Cleared cached Cognito items.', { before, after })
  if (opts?.reconfigure) {
    Amplify.configure(authConfig)
    console.info('[Auth Debug] Reconfigured Amplify with current authConfig.')
  }
}

function inspect() {
  console.info('[Auth Debug] Current Cognito configuration & cache', buildReport())
}

if (VITE_DEBUG === 'true') {
  // Expose helper only when debugging is enabled.
  window.__MERIDA_AUTH_DEBUG = { inspect, clearAll }
  inspect()
}

export default authConfig
