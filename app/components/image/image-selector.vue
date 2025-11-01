<script setup lang="ts">
interface PrimaryFilterOption {
    label: string
    value: string | null
}

const props = defineProps<{
    open: boolean
    aspectId: string
    primaryFilters?: PrimaryFilterOption[]
    pageSize?: number
    title?: string
    confirmLabel?: string
}>()

const emit = defineEmits<{
    (event: 'update:open', value: boolean): void
    (event: 'select', payload: ImageResponse): void
}>()

const { t } = useI18n()
const { img } = useUtils()

const {
    aspect,
    fetchAspect,
    images,
    loading,
    list,
    pageNumber,
    pageSize,
    total,
    availableLabels,
    updateImage,
    deleteImage,
    uploadImage,
    setAspectId,
} = useImages({ aspectId: props.aspectId, pageSize: props.pageSize })

const initialized = ref(false)
const activePrimary = ref<string | null>(null)
const activeSecondary = ref<string>('all')
const searchState = reactive({
    all: '',
    custom: '',
})
const selectedImage = ref<ImageResponse | null>(null)
const openUploader = ref(false)
const deleteTarget = ref<ImageResponse | null>(null)
const pending = ref(false)

const title = computed(() => props.title ?? t('title-default'))
const confirmButtonText = computed(() => props.confirmLabel ?? t('actions.confirm'))

const primaryOptions = computed<PrimaryFilterOption[]>(() => {
    const base: PrimaryFilterOption[] = [
        { label: t('primary-all'), value: null },
    ]
    if (props.primaryFilters?.length) {
        return base.concat(props.primaryFilters)
    }
    return base
})

const secondaryTags = computed(() => {
    const tags = availableLabels.value
        .filter(label => label && label.toLowerCase() !== 'all' && label.toLowerCase() !== 'custom')
        .map(label => ({ value: label, label }))
    return [
        { value: 'all', label: t('secondary-all') },
        { value: 'custom', label: t('secondary-custom') },
        ...tags,
    ]
})

const searchInput = computed({
    get() {
        return activeSecondary.value === 'custom' ? searchState.custom : searchState.all
    },
    set(value: string) {
        if (activeSecondary.value === 'custom') {
            searchState.custom = value
        }
        else {
            searchState.all = value
        }
    },
})

const totalPages = computed(() => {
    const size = pageSize.value || 1
    return Math.max(1, Math.ceil((total.value || 0) / size))
})

const displayedImages = computed(() => {
    let listData = images.value
    if (activeSecondary.value === 'custom') {
        listData = listData.filter(item => item.visibility === 'PRIVATE')
    }
    else if (activeSecondary.value !== 'all') {
        listData = listData.filter(item => item.labels?.includes(activeSecondary.value))
    }

    const keyword = (activeSecondary.value === 'custom' ? searchState.custom : searchState.all).trim().toLowerCase()
    if (keyword) {
        listData = listData.filter((item) => {
            const name = item.name?.toLowerCase() ?? ''
            const labels = (item.labels ?? []).join(' ').toLowerCase()
            return name.includes(keyword) || labels.includes(keyword)
        })
    }
    return listData
})

const imageKey = (image: ImageResponse) => image.id

const imageUrl = (image: ImageResponse) => img(image.id)

function isSelected(image: ImageResponse) {
    if (!selectedImage.value)
        return false
    return image.id === selectedImage.value.id
}

function close() {
    openUploader.value = false
    deleteTarget.value = null
    emit('update:open', false)
}

async function selectPrimary(value: string | null) {
    activePrimary.value = value
    activeSecondary.value = 'all'
    searchState.all = ''
    searchState.custom = ''
    await list({ pageNumber: 1, label: value })
}

function selectSecondary(value: string) {
    activeSecondary.value = value
}

function updateSelection(image: ImageResponse) {
    selectedImage.value = image
}

function clearSearch() {
    if (activeSecondary.value === 'custom') {
        searchState.custom = ''
    }
    else {
        searchState.all = ''
    }
}

async function prevPage() {
    if (pageNumber.value <= 1)
        return
    await list({ pageNumber: pageNumber.value - 1 })
}

async function nextPage() {
    if (pageNumber.value >= totalPages.value)
        return
    await list({ pageNumber: pageNumber.value + 1 })
}

async function jumpToPage(event: Event) {
    const target = event.target as HTMLInputElement
    const value = Number.parseInt(target.value, 10)
    if (!Number.isFinite(value))
        return
    const page = Math.min(Math.max(value, 1), totalPages.value)
    await list({ pageNumber: page })
}

function confirmSelection() {
    if (!selectedImage.value)
        return
    emit('select', selectedImage.value)
    close()
}

async function handleRename({ image, name }: { image: ImageResponse, name: string }) {
    pending.value = true
    try {
        await updateImage(image.id, {
            name,
            description: image.description,
            visibility: image.visibility,
            labels: image.labels ?? [],
        })
    }
    finally {
        pending.value = false
    }
}

function confirmDelete(image: ImageResponse) {
    deleteTarget.value = image
}

async function handleDelete() {
    if (!deleteTarget.value)
        return
    pending.value = true
    try {
        await deleteImage(deleteTarget.value.id)
        if (selectedImage.value && selectedImage.value.id === deleteTarget.value.id) {
            selectedImage.value = null
        }
        deleteTarget.value = null
    }
    finally {
        pending.value = false
    }
}

function handleUploaded(image: ImageResponse) {
    selectedImage.value = image
}

watch(images, (newImages) => {
    if (!selectedImage.value)
        return
    const fresh = newImages.find(item => item.id === selectedImage.value!.id)
    if (fresh) {
        selectedImage.value = fresh
    }
})

watch(() => props.open, async (value) => {
    if (!value) {
        selectedImage.value = null
        return
    }
    setAspectId(props.aspectId)
    if (!initialized.value) {
        await fetchAspect()
        await list({ pageNumber: 1 })
        initialized.value = true
    }
    else {
        await list()
    }
})

watch(() => props.aspectId, async (newAspect, oldAspect) => {
    console.warn('Aspect changed:', { newAspect, oldAspect })
    if (newAspect === oldAspect)
        return
    setAspectId(newAspect)
    initialized.value = false
    activePrimary.value = null
    activeSecondary.value = 'all'
    searchState.all = ''
    searchState.custom = ''
    await fetchAspect()
    await list({ pageNumber: 1 })
}, { immediate: true })
</script>

<template>
    <dialog v-if="open" class="modal modal-open">
        <div class="modal-box max-w-6xl">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" @click.prevent="close">
                    ✕
                </button>
            </form>
            <div class="space-y-6">
                <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 class="text-2xl font-semibold">
                            {{ title }}
                        </h2>
                        <p v-if="aspect" class="text-sm text-base-content/70">
                            {{ t('aspect-format', {
                                name: aspect.name,
                                ratio:
                                    `${aspect.ratioWidthUnit}:${aspect.ratioHeightUnit}`,
                            }) }}
                        </p>
                    </div>
                </header>

                <section class="space-y-4">
                    <div class="tabs tabs-boxed w-full overflow-x-auto">
                        <a
                            v-for="option in primaryOptions" :key="option.value ?? 'all'" role="tab"
                            class="tab whitespace-nowrap" :class="{ 'tab-active': option.value === activePrimary }"
                            @click.prevent="selectPrimary(option.value)"
                        >
                            {{ option.label }}
                        </a>
                    </div>
                    <div class="flex flex-wrap gap-3 items-center">
                        <form
                            class="join filter" role="radiogroup" aria-label="Secondary filter" @submit.prevent
                            @reset.prevent
                        >
                            <input
                                v-for="tag in secondaryTags" :key="tag.value" type="radio" name="secondary-filter"
                                class="btn btn-sm join-item" :value="tag.label" :aria-label="tag.label"
                                :checked="activeSecondary === tag.value" @change="selectSecondary(tag.value)"
                            >
                        </form>
                        <div
                            v-if="activeSecondary === 'all' || activeSecondary === 'custom'"
                            class="flex-1 min-w-[220px]"
                        >
                            <div class="join w-full">
                                <input
                                    v-model="searchInput" type="search" class="input input-bordered join-item flex-1"
                                    :placeholder="t(activeSecondary === 'custom' ? 'search-custom-placeholder' : 'search-placeholder')"
                                >
                                <button class="btn join-item" type="button" @click="clearSearch">
                                    {{ t('clear') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="min-h-[320px]">
                    <div v-if="loading" class="flex items-center justify-center py-16">
                        <span class="loading loading-spinner loading-lg" />
                    </div>
                    <div v-else>
                        <div
                            v-if="displayedImages.length === 0 && activeSecondary !== 'custom'"
                            class="rounded-lg border border-dashed p-10 text-center space-y-4"
                        >
                            <p class="text-base-content/60">
                                {{ t('empty') }}
                            </p>
                            <button class="btn btn-primary" type="button" @click="openUploader = true">
                                {{ t('actions.upload') }}
                            </button>
                        </div>
                        <div v-else class="grid grid-cols-3 gap-4 md:grid-cols-4 xl:grid-cols-5">
                            <div
                                v-if="activeSecondary === 'custom'"
                                class="card border-dashed border-2 flex items-center justify-center cursor-pointer hover:border-primary"
                                @click="openUploader = true"
                            >
                                <div class="card-body items-center text-center">
                                    <span class="text-4xl">＋</span>
                                    <p>{{ t('custom-placeholder') }}</p>
                                </div>
                            </div>
                            <ImageCard
                                v-for="image in displayedImages" :key="imageKey(image)" :image="image"
                                :image-url="imageUrl(image)" :aspect="aspect" :selected="isSelected(image)"
                                :disabled="pending" @select="updateSelection" @rename="handleRename"
                                @delete="confirmDelete"
                            />
                        </div>
                    </div>
                </section>

                <section class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div class="text-sm text-base-content/70">
                        {{ t('pagination-status', { page: pageNumber, totalPages, total }) }}
                    </div>
                    <div class="join">
                        <button class="btn join-item" type="button" :disabled="pageNumber <= 1" @click="prevPage">
                            {{ t('pagination-prev') }}
                        </button>
                        <input
                            class="input input-bordered join-item w-16 text-center" type="number" :value="pageNumber"
                            min="1" :max="totalPages" @change="jumpToPage($event)"
                        >
                        <button
                            class="btn join-item" type="button" :disabled="pageNumber >= totalPages"
                            @click="nextPage"
                        >
                            {{ t('pagination-next') }}
                        </button>
                    </div>
                </section>
            </div>

            <div class="modal-action">
                <button class="btn" type="button" @click="close">
                    {{ t('actions.cancel') }}
                </button>
                <button
                    class="btn btn-primary" type="button" :disabled="!selectedImage || pending"
                    @click="confirmSelection"
                >
                    <span v-if="pending" class="loading loading-spinner" />
                    <span>{{ confirmButtonText }}</span>
                </button>
            </div>
        </div>
    </dialog>

    <ImageUploader
        v-if="open" :open="openUploader" :aspect="aspect" :aspect-id="props.aspectId"
        :suggested-labels="availableLabels" :upload="uploadImage" @update:open="val => openUploader = val"
        @uploaded="handleUploaded"
    />

    <dialog v-if="deleteTarget" class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-semibold text-lg mb-4">
                {{ t('delete-title') }}
            </h3>
            <p>{{ t('delete-message', { name: deleteTarget.name }) }}</p>
            <div class="modal-action">
                <button class="btn" type="button" @click="deleteTarget = null">
                    {{ t('actions.cancel') }}
                </button>
                <button class="btn btn-error" type="button" :disabled="pending" @click="handleDelete">
                    <span v-if="pending" class="loading loading-spinner" />
                    <span>{{ t('actions.delete') }}</span>
                </button>
            </div>
        </div>
    </dialog>
</template>

<i18n lang="yaml">
en-GB:
  title-default: Select an image
  aspect-format: "Aspect: {name} · {ratio}"
  actions:
    upload: Upload new image
    cancel: Cancel
    confirm: Use this image
    delete: Delete
  primary-all: All categories
  secondary-all: All
  secondary-custom: Custom
  search-placeholder: Search by name or label
  search-custom-placeholder: Search your private uploads
  clear: Clear
  empty: No images match your filters yet.
  custom-placeholder: Upload your own image
  pagination-status: "Page {page} of {totalPages}, total {total} images"
  pagination-prev: Previous
  pagination-next: Next
  delete-title: Delete image
  delete-message: "Are you sure you want to delete “{name}”?"

zh-CN:
  title-default: 选择图片
  aspect-format: "比例：{name} · {ratio}"
  actions:
    upload: 上传新图片
    cancel: 取消
    confirm: 使用此图片
    delete: 删除
  primary-all: 全部分类
  secondary-all: 全部
  secondary-custom: 自定义
  search-placeholder: 按名称或标签搜索
  search-custom-placeholder: 搜索你的私有图片
  clear: 清空
  empty: 暂无符合条件的图片
  custom-placeholder: 上传你的专属图片
  pagination-status: "第 {page} / {totalPages} 页，共 {total} 张图片"
  pagination-prev: 上一页
  pagination-next: 下一页
  delete-title: 删除图片
  delete-message: "确定要删除“{name}”吗？"
</i18n>
