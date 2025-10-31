export default defineNuxtRouteMiddleware(async (_to, _from) => {
    const authStore = useAuthStore()
    const nuxtApp = useNuxtApp()

    if (authStore.isAuthenticated === false) {
        if (import.meta.client) {
            const { addNotification } = useNotificationsStore()
            addNotification({
                type: 'warning',
                message: nuxtApp.$i18n.t('middleware.login-required'),
            })
        }
        return navigateTo('/auth/login')
    }
})
