<script setup lang="ts">

const props = defineProps<{
    username?: string;
    friendCode?: string;
    playerInfoColor?: string;
}>()

</script>
<template>
    <div class="right-0 flex flex-col rounded-sm" :style="{ 'background-color': playerInfoColor }"
        v-if="props.username">
        <div class="flex items-center p-[2px]">
            <p class="font-bold font-sega text-[9.5px]">{{ props.username }}</p>
            <img class="h-[10px]" src="@/assets/icons/misc/deluxe.png">
        </div>
        <div class="flex items-center" v-if="props.friendCode">
            <p class="friend-code-font text-white pl-1 pr-1 text-center rounded-sm text-nowrap font-sega">
                フレンド<br>コ一ド
            </p>
            <p class="ml-[1px] font-extrabold font-sega text-[7px]">{{ props.friendCode }}
            </p>
        </div>
    </div>
</template>
<style scoped>
.friend-code-font {
    font-size: 4.5px;
    background-color: #405baa;
    -webkit-text-stroke: 0.8px #fff
}
</style>