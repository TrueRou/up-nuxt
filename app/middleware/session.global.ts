export default defineNuxtRouteMiddleware(async (to, from) => {
    const { lazyFetch: lazyRefreshSession } = useAuthStore()

    await lazyRefreshSession()
})