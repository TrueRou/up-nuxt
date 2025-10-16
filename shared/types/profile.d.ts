export interface UserPreference {
    user_id: number
    maimaiVersion: string
    simplifiedCode: string
    characterName: string
    friendCode: string
    displayName: string
    dxRating: string
    qrSize: number
    maskType: number
    charaInfoColor: string
    dynamicRating: boolean
    showDate: boolean
    characterId: string
    maskId: string
    backgroundId: string
    frameId: string
    passnameId: string
}

export interface UserAccount {
    id: number
    user_id: number
    server_id: number
    credentials: string
    enabled: boolean
    created_at: Date
    updated_at: Date
}

export interface UserProfile {
    preference: UserPreference
    accounts: UserAccount[]
}