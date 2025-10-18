<script setup lang="ts">
import { computed, inject, watch } from 'vue';
import type { UserPreference } from '~~/shared/types/profile';

const props = defineProps<{
    preference: UserPreference;
}>()

const { toDBC } = useUtils();

const emit = defineEmits<{
    (e: 'open-gallery', kind: string, modifyingField?: string): void;
}>()

const openGallery = (kind: string, modifyingField?: string) => {
    emit('open-gallery', kind, modifyingField);
}

watch(() => props.preference?.displayName, (newName, oldName) => {
    if (newName && newName !== oldName) {
        const converted = toDBC(newName);
        if (converted !== newName) {
            props.preference!.displayName = converted;
        }
    }
});
</script>
<template>
    <div v-if="props.preference" class="space-y-4">
        <!-- 卡面设置 -->
        <div class="card bg-base-100 shadow-xl border border-base-300">
            <div class="card-body">
                <h2 class="card-title bg-primary text-primary-content p-3 rounded-lg -mx-4 -mt-4 mb-4">
                    卡面设置
                </h2>

                <!-- 正面背景 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">正面背景</div>
                        <div class="text-sm text-base-content/60">选择卡片正面背景</div>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="openGallery('background')">
                        选取
                    </button>
                </div>

                <!-- 反面背景 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">反面背景</div>
                        <div class="text-sm text-base-content/60">选择卡片反面背景</div>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="openGallery('background', 'cardback')">
                        选取
                    </button>
                </div>

                <!-- 边框图片 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">边框图片</div>
                        <div class="text-sm text-base-content/60">选择卡面边框图片</div>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="openGallery('frame')">
                        选取
                    </button>
                </div>

                <!-- 人物图片 -->
                <div class="flex justify-between items-center py-3">
                    <div>
                        <div class="font-medium">人物图片</div>
                        <div class="text-sm text-base-content/60">选择卡面人物图片</div>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="openGallery('character')">
                        选取
                    </button>
                </div>
            </div>
        </div>

        <!-- 个人设置 -->
        <div class="card bg-base-100 shadow-xl border border-base-300">
            <div class="card-body">
                <h2 class="card-title bg-primary text-primary-content p-3 rounded-lg -mx-4 -mt-4 mb-4">
                    个人设置
                </h2>

                <!-- 玩家昵称 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">玩家昵称</div>
                        <div class="text-sm text-base-content/60">卡面印刷的玩家昵称</div>
                    </div>
                    <input v-model="props.preference.displayName" class="input input-bordered input-sm w-48"
                        placeholder="留空隐藏姓名框" />
                </div>

                <!-- 好友号码 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">好友号码</div>
                        <div class="text-sm text-base-content/60">卡面印刷的好友号码</div>
                    </div>
                    <input v-model="props.preference.friendCode" class="input input-bordered input-sm w-48"
                        placeholder="留空隐藏好友代码" />
                </div>

                <!-- DX分数 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">DX分数</div>
                        <div class="text-sm text-base-content/60">卡面印刷的DX分数</div>
                    </div>
                    <input v-model="props.preference.dxRating" class="input input-bordered input-sm w-48"
                        placeholder="留空不印刷DX分数" />
                </div>

                <!-- 人物名称 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">人物名称</div>
                        <div class="text-sm text-base-content/60">覆盖卡面左下方的人物名称</div>
                    </div>
                    <input v-model="props.preference.characterName" class="input input-bordered input-sm w-48" />
                </div>

                <!-- 游戏版本 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">游戏版本</div>
                        <div class="text-sm text-base-content/60">覆盖卡面下方的游戏版本</div>
                    </div>
                    <input v-model="props.preference.maimaiVersion" class="input input-bordered input-sm w-48" />
                </div>

                <!-- 卡片元数据 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">卡片元数据</div>
                        <div class="text-sm text-base-content/60">覆盖卡面左下方的CID</div>
                    </div>
                    <input v-model="props.preference.simplifiedCode" class="input input-bordered input-sm w-48"
                        placeholder="默认情况请留空" />
                </div>

                <!-- 角色框颜色 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">角色框颜色</div>
                        <div class="text-sm text-base-content/60">覆盖卡面左下方的角色框颜色</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="btn btn-circle btn-sm btn-primary"
                            @click="props.preference.charaInfoColor = '#fee37c'" title="重置为默认颜色">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <div class="w-8 h-8 rounded border border-base-300"
                            :style="{ backgroundColor: props.preference.charaInfoColor || '#fee37c' }"></div>
                        <input type="color" v-model="props.preference.charaInfoColor" class="w-12 h-8 cursor-pointer" />
                    </div>
                </div>

                <!-- 显示日期开关 -->
                <div class="flex justify-between items-center py-3 border-b border-base-300">
                    <div>
                        <div class="font-medium">显示日期</div>
                        <div class="text-sm text-base-content/60">是否在卡面显示日期</div>
                    </div>
                    <input type="checkbox" v-model="props.preference.showDate" class="toggle toggle-primary" />
                </div>

                <!-- 动态评级 -->
                <div class="flex justify-between items-center py-3">
                    <div>
                        <div class="font-medium">动态评级</div>
                        <div class="text-sm text-base-content/60">启用动态评级显示</div>
                    </div>
                    <input type="checkbox" v-model="props.preference.dynamicRating" class="toggle toggle-primary" />
                </div>
            </div>
        </div>
    </div>
</template>
