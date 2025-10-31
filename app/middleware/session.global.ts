export default defineNuxtRouteMiddleware(async (_to, _from) => {
    const { lazyFetch: lazyRefreshSession } = useAuthStore()

    await lazyRefreshSession()
})
