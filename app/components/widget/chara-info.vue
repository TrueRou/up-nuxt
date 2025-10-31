<script setup lang="ts">
const props = defineProps<{
    charaName?: string
    timeLimit?: string
    dateLimit?: string
    charaInfoColor?: string
    showDate?: boolean
}>()
</script>

<template>
    <div class="flex flex-col text-black">
        <div class="flex flex-col pt-1 pb-1 rounded-tr-lg w-4/5" :style="{ 'background-color': charaInfoColor }">
            <p class="text-center text-sm font-semibold text-nowrap font-sega">
                {{ props.charaName }}
            </p>
        </div>
        <div
            class="flex flex-col pb-1 rounded-tr-lg rounded-br-lg shadow-xl px-4"
            :style="{ 'background-color': charaInfoColor }"
        >
            <p class="text-center text-nowrap text-sm font-sega">
                ブ一スト期限
                <b class="text-lg">{{ props.timeLimit || '12:00:00' }}</b>
            </p>
            <p v-if="props.showDate && props.dateLimit" class="text-center text-nowrap text-sm font-sega">
                <b class="text-lg">{{ props.dateLimit }}</b>
            </p>
        </div>
    </div>
</template>
