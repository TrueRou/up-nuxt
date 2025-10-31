export default defineNuxtPlugin((_nuxtApp) => {
    const leporid = $fetch.create({
        onRequest(context) {
            if (import.meta.server) {
                const reqHeaders = useRequestHeaders(['cookie'])
                context.options.headers.set('cookie', reqHeaders.cookie || '')
            }

            if (import.meta.client) {
                const loadingIndicator = useLoadingIndicator()
                loadingIndicator.start()
            }
        },
        onResponse(context) {
            const rawData = context.response._data

            if (rawData.code === 200 && rawData.data !== undefined) {
                context.response._data = rawData.data // unwrap data
            }

            if (import.meta.client) {
                const loadingIndicator = useLoadingIndicator()
                loadingIndicator.finish()
            }
        },
        onResponseError(context) {
            if (import.meta.client) {
                const leporidResp = context.response._data

                if (leporidResp.code && leporidResp.code !== 200) {
                    const { addNotification } = useNotificationsStore()
                    addNotification({
                        type: 'error',
                        message: leporidResp.message,
                    })
                    Promise.reject(leporidResp) // reject the promise
                }
            }
        },
    })

    return {
        provide: {
            leporid,
        },
    }
})
