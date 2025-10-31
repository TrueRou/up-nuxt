<script setup lang="ts">

const props = defineProps<{
    username?: string;
    friendCode?: string;
    playerInfoColor?: string;
}>()

</script>
<template>
    <div class="rounded-s-md ms-auto w-fit text-black" :style="{ 'background-color': playerInfoColor }"
        v-if="props.username">
        <div class="p-1 space-x-1 text-end">
            <p class="inline font-bold font-sega align-middle" style="font-size: max(12pt, 1.8vh);">
                {{ props.username }}
            </p>
            <img class="inline align-middle" style="height: 3.5vh;" src="../../assets/icons/misc/deluxe.png">
        </div>
        <div v-if="props.friendCode">
            <div class="inline-block align-middle text-white pl-2 pr-2 text-center font-extrabold rounded-bl-md text-nowrap font-sega"
                style="font-size: max(6pt, 1.2vh); background-color: #405baa; -webkit-text-stroke: 1px #fff">
                フレンド<br>コ一ド
            </div>
            <p class="inline align-middle ml-0.5 font-extrabold font-sega" style="font-size: max(10pt, 1.8vh);">{{
                props.friendCode
            }}
            </p>
        </div>
    </div>
</template>