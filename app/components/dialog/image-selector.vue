<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Image {
    uuid: string;
    label?: string;
    category?: string;
    uploaded_by?: number;
}

const props = defineProps<{
    show: boolean;
    kind: string;
    target?: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'select', image: Image): void;
    (e: 'open-picker', kind: string): void;
}>();

const kindDict: Record<string, string> = {
    'background': '背景',
    'character': '角色',
    'frame': '边框',
    'passname': '通行证',
    'mask': '蒙版',
    'label': '标签',
}

const images = ref<Image[]>([]);
const isLoading = ref<boolean>(false);
const selectedCategory = ref<string | null>("自定义");
const isSignedIn = ref<boolean>(false);
const currentUserId = ref<number | null>(null);

// 重命名对话框
const showRenamingModal = ref<boolean>(false);
const renameModel = ref<Image | null>(null);
const renameLabel = ref<string>('');

// 搜索和分页
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(30);
const totalPages = ref(0);
const totalItems = ref(0);

const filteredImages = computed(() => {
    if (!searchQuery.value) return images.value;

    const query = searchQuery.value.toLowerCase();
    return images.value.filter(image =>
        (image.label && image.label.toLowerCase().includes(query)) ||
        (image.category && image.category.toLowerCase().includes(query))
    );
});

const groupedImages = computed(() => {
    const groups: Record<string, Image[]> = {};

    groups['自定义'] = [];

    filteredImages.value.forEach(image => {
        const category = image.category || '自定义';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(image);
    });

    return groups;
});

const categories = computed(() => {
    return Object.keys(groupedImages.value);
});

const currentCategoryImages = computed(() => {
    if (!selectedCategory.value || !groupedImages.value[selectedCategory.value]) {
        return [];
    }

    const categoryImages = groupedImages.value[selectedCategory.value] || [];

    totalItems.value = categoryImages.length;
    totalPages.value = Math.ceil(totalItems.value / pageSize.value);

    if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
    } else if (totalPages.value === 0) {
        currentPage.value = 1;
    }

    const startIndex = (currentPage.value - 1) * pageSize.value;
    return categoryImages.slice(startIndex, startIndex + pageSize.value);
});

const r = (image: Image) => `/images/${image.uuid}/thumbnail`;

const setRenameModel = (image: Image) => {
    renameModel.value = Object.assign({}, image);
    renameLabel.value = image.label || '';
    showRenamingModal.value = true;
}

const renameImage = async () => {
    if (renameModel.value) {
        // 实现图片重命名逻辑
        const targetImage = images.value.find(img => img.uuid === renameModel.value!.uuid);
        if (targetImage) {
            targetImage.label = renameLabel.value;
        }
    }
    renameModel.value = null;
    showRenamingModal.value = false;
}

const refreshImages = async () => {
    isLoading.value = true;
    // 模拟加载图片
    // 实际应该从API获取
    images.value = [];
    isLoading.value = false;
    if (categories.value.length > 0 && !selectedCategory.value) {
        selectedCategory.value = categories.value[0] || null;
    }
}

const deleteImage = async (image: Image) => {
    const index = images.value.findIndex(img => img.uuid === image.uuid);
    if (index !== -1) {
        images.value.splice(index, 1);
    }
}

const selectCategory = (category: string) => {
    selectedCategory.value = category;
    currentPage.value = 1;
}

watch(() => props.show, async (newVal) => {
    if (newVal) await refreshImages();
}, { immediate: true });
</script>
<template>
    <div v-if="show" class="modal modal-open">
        <div class="modal-box max-w-4xl w-11/12 max-h-[90vh] flex flex-col p-0">
            <!-- 标题栏 -->
            <div class="flex justify-between items-center p-4 border-b border-base-300 bg-base-200">
                <h2 class="text-xl font-bold">{{ '选取' + kindDict[kind] }}</h2>
                <button @click="emit('close')" class="btn btn-ghost btn-sm btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- 重命名对话框 -->
            <dialog :open="showRenamingModal" class="modal">
                <div class="modal-box">
                    <h3 class="font-bold text-lg">修改图片名称</h3>
                    <div class="py-4">
                        <input v-model="renameLabel" type="text" placeholder="请输入图片名称"
                            class="input input-bordered w-full" />
                    </div>
                    <div class="modal-action">
                        <button class="btn" @click="showRenamingModal = false">取消</button>
                        <button class="btn btn-primary" @click="renameImage">确认</button>
                    </div>
                </div>
            </dialog>

            <!-- 搜索和分类区域 -->
            <div class="p-4 space-y-3 border-b border-base-300">
                <!-- 搜索框 -->
                <div class="form-control">
                    <div class="input-group">
                        <span class="bg-base-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input v-model="searchQuery" type="text" placeholder="搜索图片..."
                            class="input input-bordered w-full" />
                    </div>
                </div>

                <!-- 分类选择导航栏 -->
                <div v-if="!isLoading && categories.length > 0" class="tabs tabs-boxed overflow-x-auto flex-nowrap">
                    <button v-for="category in categories" :key="category" class="tab whitespace-nowrap"
                        :class="{ 'tab-active': selectedCategory === category }" @click="selectCategory(category)">
                        {{ category }}
                    </button>
                </div>
            </div>

            <!-- 图片展示区域 -->
            <div class="flex-grow overflow-y-auto p-4">
                <!-- 加载中 -->
                <div v-if="isLoading" class="flex justify-center items-center h-40">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                </div>

                <!-- 图片网格 -->
                <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <!-- 上传新图片的虚拟卡片 -->
                    <div v-if="selectedCategory === '自定义'"
                        class="aspect-square relative rounded-lg border-2 border-dashed border-base-300 overflow-hidden">
                        <button class="btn btn-ghost w-full h-full flex flex-col items-center justify-center gap-2"
                            :class="{ 'btn-disabled': !isSignedIn }" @click="emit('open-picker', props.kind)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                            <span class="font-medium text-sm">上传新图片</span>
                            <span class="text-xs opacity-60" v-if="!isSignedIn">需要先登录</span>
                        </button>
                    </div>

                    <!-- 图片卡片 -->
                    <div v-for="image in currentCategoryImages" :key="image.uuid"
                        class="card card-compact bg-base-100 shadow-md hover:shadow-xl transition-all cursor-pointer border border-base-300"
                        @click="emit('select', image)">
                        <figure class="aspect-square">
                            <img :src="r(image)" class="w-full h-full object-contain" alt="图片" loading="lazy">
                        </figure>

                        <!-- 图片信息 -->
                        <div v-if="image.label || image.uploaded_by === currentUserId"
                            class="absolute top-2 left-2 right-2 flex justify-between items-start gap-2 z-10">
                            <div v-if="image.label" class="badge badge-neutral badge-sm max-w-[70%] truncate"
                                :class="{ 'cursor-pointer': image.uploaded_by === currentUserId }"
                                @click.stop="image.uploaded_by === currentUserId && setRenameModel(image)">
                                {{ image.label }}
                            </div>

                            <button v-if="image.uploaded_by === currentUserId" class="btn btn-error btn-xs btn-circle"
                                @click.stop="deleteImage(image)">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        <!-- 选择提示 -->
                        <div
                            class="absolute inset-0 bg-base-content/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div class="badge badge-primary badge-lg">选择</div>
                        </div>
                    </div>
                </div>

                <!-- 无结果提示 -->
                <div v-if="!isLoading && currentCategoryImages.length === 0 && selectedCategory !== '自定义'"
                    class="flex flex-col items-center justify-center h-40 text-base-content/60">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>没有找到相关图片</p>
                </div>
            </div>

            <!-- 分页控制 -->
            <div v-if="totalPages > 1" class="p-4 border-t border-base-300 bg-base-200">
                <div class="flex justify-center items-center gap-2">
                    <button @click="currentPage > 1 && (currentPage--)" class="btn btn-sm"
                        :class="currentPage > 1 ? 'btn-primary' : 'btn-disabled'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        上一页
                    </button>

                    <div class="text-sm font-medium px-4">
                        {{ currentPage }} / {{ totalPages }}
                    </div>

                    <button @click="currentPage < totalPages && (currentPage++)" class="btn btn-sm"
                        :class="currentPage < totalPages ? 'btn-primary' : 'btn-disabled'">
                        下一页
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop" @click="emit('close')"></div>
    </div>
</template>
