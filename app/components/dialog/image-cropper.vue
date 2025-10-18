<script setup lang="ts">
import 'vue-cropper/dist/index.css'
import { ref, watch } from 'vue';
import { VueCropper } from "vue-cropper";

const props = defineProps<{
    show: boolean;
    kind: string;
    imageData: string | null;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'upload-success'): void;
}>();

const imageCropper = ref<any>(null);
const fixedNumber = ref<Array<number>>([0, 0]);
const showDialog = ref<boolean>(false);
const imageName = ref<string>('');

const uploadImage = async () => {
    if (imageCropper.value) {
        // imageCropper.value.getCropBlob(async (blob: Blob) => {
        //     // 这里需要实现上传逻辑
        //     emit('upload-success');
        //     emit('close');
        // });
    }
}

watch(() => props.show, async (newVal) => {
    if (newVal && props.kind) {
        // 根据类型设置默认裁剪比例
        const standardSizes: Record<string, number[]> = {
            'background': [16, 9],
            'character': [1, 1],
            'frame': [16, 9],
            'passname': [2, 1],
        };
        fixedNumber.value = standardSizes[props.kind] || [1, 1];
    }
});
</script>
<template>
    <div v-if="show" class="modal modal-open">
        <div class="modal-box max-w-4xl w-11/12 h-[80vh] flex flex-col p-0">
            <!-- 标题栏 -->
            <div class="flex justify-between items-center p-4 border-b border-base-300 bg-base-200">
                <h2 class="text-xl font-bold">裁剪图片</h2>
                <button @click="emit('close')" class="btn btn-ghost btn-sm btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- 命名对话框 -->
            <dialog :open="showDialog" class="modal">
                <div class="modal-box">
                    <h3 class="font-bold text-lg">为图片命名</h3>
                    <div class="py-4">
                        <input v-model="imageName" type="text" placeholder="请输入图片名称"
                            class="input input-bordered w-full" />
                    </div>
                    <div class="modal-action">
                        <button class="btn" @click="showDialog = false">取消</button>
                        <button class="btn btn-primary" @click="uploadImage">确认</button>
                    </div>
                </div>
            </dialog>

            <!-- 裁剪区域 -->
            <div class="flex-grow p-4 overflow-hidden">
                <div class="w-full h-full flex items-center justify-center bg-base-200 rounded-lg">
                    <VueCropper v-if="imageData" ref="imageCropper" :img="imageData" :outputSize="1" outputType="png"
                        :autoCrop="true" :fixed="true" :fixedNumber="fixedNumber"
                        :autoCropWidth="(fixedNumber[0] || 1) * 50" :autoCropHeight="(fixedNumber[1] || 1) * 50"
                        :infoTrue="true" :full="true" />
                </div>
            </div>

            <!-- 底部按钮 -->
            <div class="flex justify-center p-4 border-t border-base-300 bg-base-200">
                <button class="btn btn-primary gap-2" @click="showDialog = true">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    完成裁剪
                </button>
            </div>
        </div>
    </div>
</template>
