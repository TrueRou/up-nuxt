<script setup lang="ts">
import type { UserPreference } from '~~/shared/types/profile';

const props = defineProps<{
    preferences: UserPreference;
}>()

const { img } = useUtils()

</script>
<template>
    <img class="h-full object-cover -z-[20]" :src="img(props.preferences.backgroundId)">
    <!-- <div v-if="maskEnabled" class="lazer-mask h-full w-full absolute -z-[10]" :style="{ maskImage: `url(${r(mask)})` }">
        <div class="h-full w-full flow-colorful"></div>
    </div> -->
    <img class="chara-center h-full absolute object-cover -z-[15]" :src="img(props.preferences.characterId)">
    <img class="frame-upper h-full absolute -z-[5]" :src="img(props.preferences.frameId)">
    <img class="frame-under h-full absolute -z-[5]" :src="img(props.preferences.frameId)">
</template>
<style scoped>
.frame-upper {
    object-fit: contain;
    object-position: left top;
    clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
}

.frame-under {
    object-fit: contain;
    object-position: left bottom;
    clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
}

.chara-center {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%)
}

.lazer-mask {
    mask-mode: alpha;
    mask-repeat: no-repeat;
    mask-size: cover;
    mask-position: center;
}

.flow-colorful {
    background: linear-gradient(to bottom right, red, yellow, blue);
    animation: hue 4s linear infinite;
}

@keyframes hue {
    from {
        filter: hue-rotate(0deg);
    }

    to {
        filter: hue-rotate(360deg);
    }
}
</style>