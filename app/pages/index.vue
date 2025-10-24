<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute();
const dateLimit = route.query.date as string | undefined;
const timeLimit = route.query.time as string | undefined;
const maimaiMaid = route.query.maid as string | undefined;

const { data: profile, status, error, refresh, clear } = await useLeporid<UserProfile>("/api/nuxt/profile")
const { img } = useUtils()

const simplifiedCode = computed(() => {
    if (maimaiMaid) return maimaiMaid.slice(8, 28).match(/.{1,4}/g)?.join(' ')
})

const playerRating = computed(() => {
    // handle dynamic rating display
    if (profile.value?.preference.dxRating) return profile.value.preference.dxRating
})
</script>
<template>
    <div class="flex items-center justify-center h-full w-full" v-if="profile">
        <div class="flex relative flex-col items-center justify-center h-full">
            <WidgetCardBack :preferences="profile.preference" />
            <div class="flex flex-col absolute top-0 w-full h-full">
                <div class="header-widget flex relative w-full justify-between">
                    <img class="object-cover w-1/2" :src="img(profile.preference.passnameId)" />
                    <WidgetDxRating class="w-1/2" :rating="playerRating" />
                </div>
                <div class="header-widget flex relative w-full flex-row-reverse">
                    <WidgetPlayerInfo :username="profile.preference.displayName || undefined"
                        :friend-code="profile.preference.friendCode || undefined" />
                </div>
            </div>
            <div class="absolute flex flex-col left-0" style="bottom: 8%;">
                <WidgetCharaInfo :chara-name="profile.preference.characterName || undefined" :time="timeLimit"
                    :date="dateLimit" :show-date="profile.preference.showDate"
                    :chara-info-color="profile.preference.charaInfoColor" />
            </div>
            <div class="qr-widget absolute" v-if="maimaiMaid">
                <WidgetQrCode :content="maimaiMaid" :size="profile.preference.qrSize || 20" />
            </div>
            <div class="flex absolute bottom-0 items-center justify-center w-full h-8">
                <div class="footer-widget flex justify-between py-1 rounded-2xl bg-gray-800 text-white opacity-85">
                    <p class="footer-text font-sega">{{ profile.preference.simplifiedCode || simplifiedCode }}</p>
                    <p class="footer-text font-sega">{{ profile.preference.maimaiVersion }}</p>
                </div>
                <NuxtLink to="/preference">
                    <div class="p-1 rounded-full bg-white">
                        <img src="@/assets/icons/misc/settings.svg" style="width: 2vh;"></img>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
<style scoped>
.qr-widget {
    bottom: 5%;
    right: 0;
}

.header-widget {
    padding-left: 2%;
    padding-right: 2%;
    padding-top: 0.4%;
}

.footer-widget {
    width: 85%;
    padding-left: 3%;
    padding-right: 3%;
}

.footer-text {
    font-size: 1.2vh;
    line-height: 120%;
}

.card-id-display {
    position: absolute;
    bottom: 1%;
    right: 1%;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.3vh 0.8vh;
    border-radius: 1vh;
    font-size: 3vh;
    font-family: "SEGA_MARUGOTHICDB", sans-serif;
}
</style>