import { joinURL } from "ufo"

export const useUtils = () => {
    const img = (uuid: string) => {
        const config = useRuntimeConfig()
        return joinURL(config.public.imageApi as string, uuid)
    }
    return { img }
}