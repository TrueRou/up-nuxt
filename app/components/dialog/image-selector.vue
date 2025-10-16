<script setup lang="ts">
import { useImageStore } from '@/stores/image';
import { ref, computed, watch } from 'vue';
import { ImageKind, type Image } from '@/common/types';
import { useUserStore } from '@/stores/user';
import TextInputModal from './modals/text-input-modal.vue';

const props = defineProps<{
    show: boolean;
    kind: ImageKind;
    target?: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'select', image: Image): void;
    (e: 'open-picker', kind: ImageKind): void;
}>();

const kindDict: Record<ImageKind, string> = {
    [ImageKind.BACKGROUND]: '背景',
    [ImageKind.CHARACTER]: '角色',
    [ImageKind.FRAME]: '边框',
    [ImageKind.PASSNAME]: '通行证',
    [ImageKind.MASK]: '蒙版',
    [ImageKind.LABEL]: '标签',
}

const imageStore = useImageStore();
const userStore = useUserStore();

const images = ref<Image[]>([]);
const isLoading = ref<boolean>(false);
const selectedCategory = ref<string | null>("自定义");

// 重命名对话框
const showRenamingModal = ref<boolean>(false);
const renameModel = ref<Image | null>(null);

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

    const categoryImages = groupedImages.value[selectedCategory.value];

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

const r = (image: Image) => import.meta.env.VITE_URL + `/images/${image.uuid}/thumbnail`;

const setRenameModel = (image: Image) => {
    renameModel.value = Object.assign({}, image);
    showRenamingModal.value = true;
}

const renameImage = async () => {
    await imageStore.patchImage(renameModel.value!)
    renameModel.value = null;
    showRenamingModal.value = false;
}

const refreshImages = async () => {
    isLoading.value = true;
    const response = await imageStore.fetchImages(props.kind);
    images.value = response.filter((image: Image) => userStore.isSignedIn || image.uploaded_by);
    isLoading.value = false;
    if (categories.value.length > 0 && !selectedCategory.value) selectedCategory.value = categories.value[0];
}

const deleteImage = async (image: Image) => {
    await imageStore.deleteImage(image);
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
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <!-- 标题栏 -->
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-bold text-gray-800 dark:text-white">{{ '选取' + kindDict[kind] }}</h2>
                <button @click="emit('close')"
                    class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <TextInputModal v-if="renameModel" title="修改图片名称" placeholder="请输入图片名称" v-model="renameModel!.label"
                :show="showRenamingModal" @confirm="renameImage" @cancel="showRenamingModal = false;" />

            <input class="hidden" ref="image-picker" type="file" accept="image/jpeg,image/png,image/webp" />

            <!-- 搜索和分类区域 -->
            <div class="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
                <!-- 搜索框 -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input v-model="searchQuery" type="text" placeholder="搜索图片..."
                        class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>

                <!-- 分类选择导航栏 -->
                <div v-if="!isLoading && categories.length > 0" class="overflow-x-auto scrollbar-thin">
                    <div class="flex space-x-2 pb-1">
                        <button v-for="category in categories" :key="category"
                            class="px-4 py-2 whitespace-nowrap rounded-lg text-sm transition-colors"
                            :class="selectedCategory === category ?
                                'bg-blue-500 text-white font-medium shadow-sm' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'" @click="selectCategory(category)">
                            {{ category }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- 图片展示区域 -->
            <div class="flex-grow overflow-y-auto p-4">
                <div v-if="isLoading" class="flex justify-center items-center h-40">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>

                <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <!-- 上传新图片的虚拟卡片 -->
                    <div v-if="selectedCategory === '自定义'"
                        class="aspect-square relative rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
                        <button
                            class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            @click="emit('open-picker', props.kind)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                            <span class="mt-2 text-gray-600 dark:text-gray-300 font-medium text-sm">上传新图片</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                                v-if="!userStore.isSignedIn">需要先登录</span>
                        </button>
                    </div>

                    <!-- 图片卡片 -->
                    <div v-for="image in currentCategoryImages" :key="image.uuid"
                        class="aspect-square relative rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                        @click="emit('select', image)">
                        <img :src="r(image)" class="w-full h-full object-contain bg-gray-50 dark:bg-gray-800" alt="图片"
                            loading="lazy">

                        <!-- 悬停效果覆盖层-->
                        <div
                            class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                            <div class="text-white font-medium py-1 px-3 rounded-lg text-sm">
                                选择
                            </div>
                        </div>

                        <!-- 图片标签和操作按钮-->
                        <div class="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-20">
                            <div v-if="image.label"
                                class="max-w-[70%] bg-black/70 text-white text-xs px-2 py-1 rounded truncate"
                                :class="{ 'cursor-pointer': image.uploaded_by === userStore.userProfile?.id }"
                                @click.stop="image.uploaded_by === userStore.userProfile?.id && setRenameModel(image)">
                                {{ image.label }}
                            </div>

                            <button v-if="image.uploaded_by === userStore.userProfile?.id"
                                class="bg-red-500/80 text-white p-1 rounded-full hover:bg-red-600"
                                @click.stop="deleteImage(image);">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 无结果提示 -->
                <div v-if="!isLoading && currentCategoryImages.length === 0 && selectedCategory != '自定义'"
                    class="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>没有找到相关图片</p>
                </div>
            </div>

            <!-- 分页控制 -->
            <div v-if="totalPages > 1" class="p-3 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-center items-center space-x-4">
                    <button @click="currentPage > 1 && (currentPage--)"
                        class="flex items-center px-3 py-1.5 rounded-lg transition-colors"
                        :class="currentPage > 1 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'"
                        :disabled="currentPage <= 1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        上一页
                    </button>

                    <div class="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {{ currentPage }} / {{ totalPages }}
                    </div>

                    <button @click="currentPage < totalPages && (currentPage++)"
                        class="flex items-center px-3 py-1.5 rounded-lg transition-colors"
                        :class="currentPage < totalPages ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'"
                        :disabled="currentPage >= totalPages">
                        下一页
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
