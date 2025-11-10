import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { signIn, signOut, getCurrentUser, confirmSignIn } from 'aws-amplify/auth'

interface User {
  username: string
  userId: string
  signInDetails?: unknown
}

interface LoginResult {
  requiresNewPassword: boolean
  requiredAttributes?: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (
    username: string,
    password: string,
    newPassword?: string,
    attributes?: Record<string, string>
  ) => Promise<LoginResult>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Component exported separately to avoid fast-refresh issues
// eslint-disable-next-line react-refresh/only-export-components
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(
    username: string,
    password: string,
    newPassword?: string,
    attributes?: Record<string, string>,
  ): Promise<LoginResult> {
    try {
      const response = await signIn({ username, password })
      console.debug('[Auth] signIn response:', response)

      const nextStep = response.nextStep?.signInStep
      const requiredAttributes =
        (response.nextStep as { additionalInfo?: { requiredAttributes?: string[] } })?.additionalInfo
          ?.requiredAttributes ?? []

      if (nextStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        if (!newPassword) {
          return { requiresNewPassword: true, requiredAttributes }
        }

        const userAttributes: Record<string, string> = { ...(attributes ?? {}) }

        console.debug('[Auth] required attributes:', requiredAttributes)
        if (requiredAttributes.includes('email') && !userAttributes.email && username.includes('@')) {
          userAttributes.email = username
        }

        if (requiredAttributes.includes('name') && !userAttributes.name) {
          userAttributes.name = attributes?.name || username
        }
        if (requiredAttributes.includes('given_name') && !userAttributes.given_name) {
          userAttributes.given_name = attributes?.given_name || userAttributes.name || username
        }
        if (requiredAttributes.includes('family_name') && !userAttributes.family_name) {
          userAttributes.family_name = attributes?.family_name || userAttributes.name || username
        }

        if (requiredAttributes.includes('preferred_username') && !userAttributes.preferred_username) {
          userAttributes.preferred_username = username
        }

        console.debug('[Auth] confirmSignIn userAttributes:', userAttributes)

        await confirmSignIn({
          challengeResponse: newPassword,
          options: {
            userAttributes,
          },
        })
      }

      await checkUser()
      return { requiresNewPassword: false }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function logout() {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook exported separately - this is intentional for the auth pattern
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
