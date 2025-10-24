interface UseImagesOptions {
    aspectId: string
    pageSize?: number
    initialLabel?: string | null
}

interface ListOptions {
    pageNumber?: number
    label?: string | null
    pageSize?: number
}

interface UploadResult {
    image: ImageResponse
}

const unwrapPayload = <T>(payload: T | { data: T }): T => {
    if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data
    }
    return payload as T
}

export const useImages = (options: UseImagesOptions) => {
    const { $leporid } = useNuxtApp()

    const aspect = shallowRef<ImageAspect | null>(null)
    const images = ref<ImageResponse[]>([])
    const loading = ref(false)
    const error = ref<Error | null>(null)
    const pageNumber = ref(1)
    const pageSize = ref(options.pageSize ?? 20)
    const total = ref(0)
    const activeLabel = ref<string | null>(options.initialLabel ?? null)
    const currentAspectId = ref(options.aspectId)

    const fetchAspect = async () => {
        if (aspect.value && aspect.value.id === currentAspectId.value) {
            return aspect.value
        }
        const response = await $leporid<ImageAspect | { data: ImageAspect }>(`/api/images/aspects/${currentAspectId.value}`, {
            method: 'GET'
        })
        aspect.value = unwrapPayload<ImageAspect>(response)
        return aspect.value
    }

    const list = async (listOptions: ListOptions = {}) => {
        loading.value = true
        error.value = null
        try {
            if (listOptions.pageNumber !== undefined) {
                pageNumber.value = listOptions.pageNumber
            }
            if (listOptions.pageSize !== undefined) {
                pageSize.value = listOptions.pageSize
            }
            if (listOptions.label !== undefined) {
                activeLabel.value = listOptions.label
            }

            const query: Record<string, string | number | undefined> = {
                aspect_id: currentAspectId.value,
                page_number: pageNumber.value,
                page_size: pageSize.value,
                label: activeLabel.value ?? undefined
            }

            const response = await $leporid<ImageSearchResponse | { data: ImageSearchResponse }>('/api/images', {
                method: 'GET',
                query
            })
            const payload = unwrapPayload<ImageSearchResponse>(response)
            images.value = payload.records ?? []
            pageNumber.value = payload.page_number ?? pageNumber.value
            pageSize.value = payload.page_size ?? pageSize.value
            total.value = payload.total ?? 0

            return {
                images: images.value,
                total: total.value
            }
        } catch (err) {
            error.value = err as Error
            throw err
        } finally {
            loading.value = false
        }
    }

    const refresh = async () => {
        return list()
    }

    const updateImage = async (uuid: string, payload: ImageUpdateRequest) => {
        await $leporid(`/api/images/${uuid}`, {
            method: 'PUT',
            body: payload
        })
        await refresh()
    }

    const deleteImage = async (uuid: string) => {
        await $leporid(`/api/images/${uuid}`, {
            method: 'DELETE'
        })
        // 如果当前页删除了最后一张图片且不是第一页，则回退一页以保证列表不空
        if (images.value.length <= 1 && pageNumber.value > 1) {
            pageNumber.value -= 1
        }
        await refresh()
    }

    const uploadImage = async (formData: FormData): Promise<UploadResult> => {
        const response = await $leporid<ImageResponse | { data: ImageResponse }>('/api/images', {
            method: 'POST',
            body: formData
        })
        const created = unwrapPayload<ImageResponse>(response)
        await refresh()
        return { image: created }
    }

    const availableLabels = computed(() => {
        const labelSet = new Set<string>()
        images.value.forEach((image) => {
            image.labels?.forEach((label) => labelSet.add(label))
        })
        return Array.from(labelSet)
    })

    const customImages = computed(() => images.value.filter((image) => image.visibility === 'PRIVATE'))

    const setAspectId = (aspectId: string) => {
        if (currentAspectId.value !== aspectId) {
            currentAspectId.value = aspectId
            aspect.value = null
            activeLabel.value = null
        }
    }

    return {
        aspect,
        fetchAspect,
        images,
        loading,
        error,
        pageNumber,
        pageSize,
        total,
        activeLabel,
        list,
        refresh,
        updateImage,
        deleteImage,
        uploadImage,
        availableLabels,
        customImages,
        setAspectId
    }
}
