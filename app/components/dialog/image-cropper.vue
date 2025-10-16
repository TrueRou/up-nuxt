<script setup lang="ts">
import 'vue-cropper/dist/index.css'
import { ref, useTemplateRef, watch } from 'vue';
import { VueCropper } from "vue-cropper";
import { useImageStore } from '@/stores/image';
import type { ImageKind } from '@/common/types';
import TextInputModal from './modals/text-input-modal.vue';

const props = defineProps<{
    show: boolean;
    kind: ImageKind;
    imageData: string | null;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'upload-success'): void;
}>();

const imageStore = useImageStore();

const imageCropper = useTemplateRef('cropper');
const fixedNumber = ref<Array<number>>([0, 0]);
const showDialog = ref<boolean>(false);
const imageName = ref<string>('');

const uploadImage = async () => {
    ((imageCropper.value) as any).getCropBlob(async (blob: Blob) => {
        await imageStore.uploadImage(imageName.value, props.kind, blob);
        emit('upload-success');
        emit('close');
    });
}

watch(() => props.show, async (newVal) => {
    if (newVal && props.kind) {
        const standard = await imageStore.fetchImageStandard();
        fixedNumber.value = standard[props.kind]["hw"][0];
    }
});
</script>
<template>
    <div v-if="show" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75">
        <TextInputModal title="为图片命名" placeholder="请输入图片名称" v-model="imageName" :show="showDialog"
            @confirm="uploadImage" @cancel="showDialog = false;" />

        <div class="bg-white p-4 rounded-lg shadow-lg w-11/12 max-w-4xl h-[80vh] flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">裁剪图片</h2>
                <button @click="emit('close')" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="cropper-frame flex-grow">
                <VueCropper ref="cropper" :img="imageData" :outputSize="1" outputType="png" :autoCrop="true"
                    :fixed="true" :fixedNumber="fixedNumber" :autoCropWidth="fixedNumber[0]"
                    :autoCropHeight="fixedNumber[1]" :infoTrue="true" :full="true">
                </VueCropper>
            </div>

            <div class="flex justify-center mt-4">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    @click="showDialog = true;">
                    完成裁剪
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.cropper-frame {
    width: 100%;
    height: 100%;
}
</style>
