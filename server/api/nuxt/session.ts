export default defineEventHandler(async (event) => {
    await updateFromRemoteSession(event)
    return commonSuccess({})
})