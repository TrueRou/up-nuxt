<script setup lang="ts">
import { computed, inject, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { toDBC } from '@/common/utils/format';
import { UserPriv, ImageKind, type Preset } from '@/common/types';
import type { DXPassPreference, MaimaiCharacter } from './common/types';


const props = defineProps<{
    preference: DXPassPreference;
    preset: Preset;
}>()

const userStore = useUserStore();
const isAdmin = computed(() => userStore.userProfile?.privileges === UserPriv.ADMIN);
const openGallery = inject('openGallery') as (kind: ImageKind, modifyingField?: string) => void;

watch(() => props.preference?.display_name, (newName, oldName) => {
    if (newName && newName !== oldName) {
        const converted = toDBC(newName);
        if (converted !== newName) {
            props.preference!.display_name = converted;
        }
    }
});

watch(() => props.preference.character_id, async (newVal) => {
    if (newVal) {
        const response = await userStore.axiosInstance.get(`/maimai/characters?image_id=${newVal}`);
        if (response.data.length > 0) {
            const character: MaimaiCharacter = response.data[0];
            props.preference.game_version = "[maimaiDX]" + character.version;
            props.preference.character_name = character.name.length > 8 && (character.name.includes('(') || character.name.includes('（'))
                ? character.name.replace(/[\(（].*?[\)）]/g, '').trim()
                : character.name;
        }
    }
}, { deep: true });
</script>
<template>
    <div v-if="props.preference">
        <div class="flex flex-col items-center rounded border-solid border-2 shadow-lg border-black p-2 w-full mt-2">
            <div class="flex items-center justify-center bg-blue-400 w-full rounded h-8">
                <h1 class="font-bold text-white">卡面设置</h1>
            </div>
            <div class="flex justify-between items-center w-full mt-2">
                <div class="flex flex-col p-2">
                    <span>正面背景</span>
                    <span class="text-gray-600" style="font-size: 12px;">选择卡片正面背景</span>
                </div>
                <div class="flex items-center">
                    <button class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                        @click="openGallery(ImageKind.BACKGROUND)">
                        选取
                    </button>
                </div>
            </div>
            <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col p-2">
                    <span>反面背景</span>
                    <span class="text-gray-600" style="font-size: 12px;">选择卡片反面背景</span>
                </div>
                <div class="flex items-center">
                    <button class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                        @click="openGallery(ImageKind.BACKGROUND, 'cardback')">
                        选取
                    </button>
                </div>
            </div>
            <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col p-2">
                    <span>边框图片</span>
                    <span class="text-gray-600" style="font-size: 12px;">选择卡面边框图片</span>
                </div>
                <div class="flex items-center">
                    <button class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                        @click="openGallery(ImageKind.FRAME)">
                        选取
                    </button>
                </div>
            </div>
            <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col p-2">
                    <span>人物图片</span>
                    <span class="text-gray-600" style="font-size: 12px;">选择卡面人物图片</span>
                </div>
                <div class="flex items-center">
                    <button class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                        @click="openGallery(ImageKind.CHARACTER)">
                        选取
                    </button>
                </div>
            </div>
        </div>
        <div class="flex flex-col items-center rounded border-solid border-2 shadow-lg border-black p-2 w-full mt-2">
            <div class="flex items-center justify-center bg-blue-400 w-full rounded h-8">
                <h1 class="font-bold text-white">个人设置</h1>
            </div>
            <div class="flex justify-between items-center w-full mt-2">
                <div class="flex flex-col p-2">
                    <span>玩家昵称</span>
                    <span class="text-gray-600" style="font-size: 12px;">卡面印刷的玩家昵称</span>
                </div>
                <div><input v-model="props.preference.display_name" placeholder="留空隐藏姓名框"></div>
            </div>
            <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col p-2">
                    <span>好友号码</span>
                    <span class="text-gray-600" style="font-size: 12px;">卡面印刷的好友号码</span>
                </div>
                <div><input v-model="props.preference.friend_code" placeholder="留空隐藏好友代码"></div>
            </div>
            <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col p-2">
                    <span>DX分数</span>
                    <span class="text-gray-600" style="font-size: 12px;">卡面印刷的DX分数</span>
                </div>
                <div><input v-model="props.preference.dx_rating" placeholder="留空不印刷DX分数"></div>
            </div>
            <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col p-2">
                    <span>人物名称</span>
                    <span class="text-gray-600" style="font-size: 12px;">覆盖卡面左下方的人物名称</span>
                </div>
                <div><input v-model="props.preference.character_name">
                </div>
            </div>
            <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col p-2">
                    <span>游戏版本</span>
                    <span class="text-gray-600" style="font-size: 12px;">覆盖卡面下方的游戏版本</span>
                </div>
                <div><input v-model="props.preference.game_version">
                </div>
            </div>
            <template v-if="isAdmin">
                <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
                <div class="flex justify-between items-center w-full">
                    <div class="flex flex-col p-2">
                        <span>卡片元数据</span>
                        <span class="text-gray-600" style="font-size: 12px;">覆盖卡面左下方的CID</span>
                    </div>
                    <div><input v-model="props.preference.simplified_code" placeholder="默认情况请留空"></div>
                </div>
            </template>
            <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col p-2">
                    <span>角色框颜色</span>
                    <span class="text-gray-600" style="font-size: 12px;">覆盖卡面左下方的角色框颜色</span>
                </div>
                <div class="flex items-center">
                    <a class="bg-blue-500 text-white font-bold h-[32px] w-[32px] p-2 rounded hover:bg-blue-600 text-sm cursor-pointer -mr-1"
                        @click="() => props.preference!.chara_info_color = '#fee37c'">
                        <img src="./assets/refresh.svg">
                    </a>
                    <div class="color-preview mr-2"
                        :style="{ backgroundColor: props.preference.chara_info_color || '#FFFFFF' }">
                    </div>
                    <input type="color" class="color-picker bg-white cursor-pointer"
                        v-model="props.preference.chara_info_color">
                </div>
            </div>
            <div class="w-full border-t border-gray-300 mt-1 mb-1"></div>
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col p-2">
                    <span>姓名框颜色</span>
                    <span class="text-gray-600" style="font-size: 12px;">覆盖卡面右上方的姓名框颜色</span>
                </div>
                <div class="flex items-center">
                    <a class="bg-blue-500 text-white font-bold h-[32px] w-[32px] p-2 rounded hover:bg-blue-600 text-sm cursor-pointer -mr-1"
                        @click="() => props.preference!.player_info_color = '#ffffff'">
                        <img src="./assets/refresh.svg">
                    </a>
                    <div class="color-preview mr-2"
                        :style="{ backgroundColor: props.preference.player_info_color || '#FFFFFF' }">
                    </div>
                    <input type="color" class="color-picker bg-white cursor-pointer"
                        v-model="props.preference.player_info_color">
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
input {
    font-size: 14px;
    outline-style: none;
    border: 2px solid #000;
    border-radius: 5px;
    width: 200px;

    @media (max-width: 600px) {
        width: 160px;
    }

    @media (max-width: 380px) {
        width: 140px;
    }

    height: 44.5px;
    padding: 0;
    padding: 10px 10px;
    box-sizing: border-box;

    &:focus {
        border-color: #60a5fa;
        outline: 0;
        -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
            #60a5fa;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
            #60a5fa;
    }
}

select {
    background: #fafdfe;
    width: 200px;

    @media (max-width: 600px) {
        width: 160px;
    }

    @media (max-width: 380px) {
        width: 140px;
    }

    height: 44.5px;
    padding: 10px 10px;
    box-sizing: border-box;
    border: 2px solid #000;
    border-radius: 5px;
}

.preview-radius {
    border-radius: 16px;
    mask-image: radial-gradient(circle, white 100%, black 100%);
    -webkit-mask-image: -webkit-radial-gradient(circle, white 100%, black 100%);
}

.multi-select-container {
    width: 200px;

    @media (max-width: 600px) {
        width: 160px;
    }

    @media (max-width: 380px) {
        width: 140px;
    }
}
</style>
