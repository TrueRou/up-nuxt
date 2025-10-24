<template>
    <div class="card bg-base-200 shadow-md hover:shadow-xl transition-shadow cursor-pointer" :class="{
        'ring ring-primary ring-offset-2': selected,
        'opacity-60 pointer-events-none': disabled
    }" @click="handleSelect">
        <div class="relative">
            <div class="w-full overflow-hidden" :style="aspectStyle">
                <img :src="imageUrl" :alt="image.name" class="h-full w-full object-cover" loading="lazy">
            </div>
            <div v-if="selected" class="badge badge-primary gap-2 absolute top-3 right-3">
                <span>{{ t('selected') }}</span>
            </div>
            <div class="absolute bottom-3 right-3 flex gap-2">
                <button class="btn btn-ghost btn-xs" :title="t('rename')" @click.stop="toggleEdit">
                    <span v-if="!isEditing">✏️</span>
                    <span v-else>✅</span>
                </button>
                <button class="btn btn-ghost btn-xs text-error" :title="t('delete')" @click.stop="emitDelete">
                    🗑️
                </button>
            </div>
        </div>
        <div class="card-body space-y-3">
            <div>
                <div v-if="!isEditing" class="font-semibold truncate">{{ image.name }}</div>
                <div v-else class="flex gap-2">
                    <input v-model="editableName" type="text" class="input input-sm input-bordered flex-1"
                        :placeholder="t('rename-placeholder')" />
                    <button class="btn btn-sm btn-primary" @click.stop="submitRename" :disabled="!editableName.trim()">
                        {{ t('save') }}
                    </button>
                    <button class="btn btn-sm" @click.stop="cancelEdit">
                        {{ t('cancel') }}
                    </button>
                </div>
                <p v-if="image.description" class="text-sm text-base-content/70 truncate">
                    {{ image.description }}
                </p>
            </div>
            <div class="flex flex-wrap gap-2">
                <span v-for="label in image.labels" :key="label" class="badge badge-outline">
                    {{ label }}
                </span>
            </div>
            <div class="text-xs text-base-content/60 flex items-center gap-2">
                <span class="badge badge-neutral badge-sm uppercase">{{ image.visibility }}</span>
                <span>{{ formatDate(image.updated_at) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ImageAspect, ImageResponse } from '~~/shared/types/leporid/image'

const props = defineProps<{
    image: ImageResponse
    imageUrl: string
    aspect: ImageAspect | null
    selected: boolean
    disabled?: boolean
}>()

const emit = defineEmits<{
    (event: 'select', image: ImageResponse): void
    (event: 'rename', payload: { image: ImageResponse; name: string }): void
    (event: 'delete', image: ImageResponse): void
}>()

const { t, d } = useI18n()

const isEditing = ref(false)
const editableName = ref(props.image.name)

watch(() => props.image.name, (name) => {
    if (!isEditing.value) {
        editableName.value = name
    }
})

const aspectStyle = computed(() => {
    if (!props.aspect) {
        return {
            aspectRatio: '4 / 3'
        }
    }
    return {
        aspectRatio: `${props.aspect.ratioWidthUnit} / ${props.aspect.ratioHeightUnit}`
    }
})

const handleSelect = () => {
    if (props.disabled) return
    emit('select', props.image)
}

const toggleEdit = () => {
    if (isEditing.value) {
        submitRename()
    } else {
        isEditing.value = true
        editableName.value = props.image.name
    }
}

const submitRename = () => {
    const trimmed = editableName.value.trim()
    if (!trimmed || trimmed === props.image.name) {
        isEditing.value = false
        editableName.value = props.image.name
        return
    }
    emit('rename', { image: props.image, name: trimmed })
    isEditing.value = false
}

const cancelEdit = () => {
    editableName.value = props.image.name
    isEditing.value = false
}

const emitDelete = () => {
    emit('delete', props.image)
}

const formatDate = (value: string) => {
    if (!value) return ''
    try {
        return d(new Date(value), 'short')
    } catch (error) {
        return value
    }
}
</script>

<i18n lang="yaml">
en-GB:
  selected: Selected
  rename: Rename
  delete: Delete
  rename-placeholder: Enter a new name
  save: Save
  cancel: Cancel

zh-CN:
  selected: 已选
  rename: 重命名
  delete: 删除
  rename-placeholder: 输入新名称
  save: 保存
  cancel: 取消
</i18n>
