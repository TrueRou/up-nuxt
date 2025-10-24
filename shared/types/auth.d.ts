declare module '#auth-utils' {
    interface User {
        id: number
        username: string
        email: string
        permissions: string[]
    }

    interface UserSession {
        // Add your own fields
    }

    interface SecureSessionData {
        // Add your own fields
    }
}

export { };