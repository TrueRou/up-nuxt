<script setup lang="ts">
definePageMeta({ middleware: 'require-login' })

const { t } = useI18n()
const { img } = useUtils()
const { addNotification } = useNotificationsStore()
const { $leporid } = useNuxtApp()

const { data: profileData, pending: profilePending } = await useLeporid<UserProfile>('/api/nuxt/profile')
const { data: serversData, pending: serversPending } = await useLeporid<Server[]>('/api/nuxt/servers')

type PreferenceForm = Omit<UserPreference, 'user_id'>
type EditableAccount = Pick<UserAccount, 'id' | 'server_id' | 'credentials' | 'enabled'> & { _key: string }

const createPreferenceForm = (preference?: UserPreference): PreferenceForm => ({
    maimaiVersion: preference?.maimaiVersion ?? '',
    simplifiedCode: preference?.simplifiedCode ?? '',
    characterName: preference?.characterName ?? '',
    friendCode: preference?.friendCode ?? '',
    displayName: preference?.displayName ?? '',
    dxRating: preference?.dxRating ?? '',
    qrSize: preference?.qrSize ?? 15,
    maskType: preference?.maskType ?? 0,
    charaInfoColor: preference?.charaInfoColor ?? '#fee37c',
    dynamicRating: preference?.dynamicRating ?? true,
    showDate: preference?.showDate ?? true,
    characterId: preference?.characterId ?? '',
    maskId: preference?.maskId ?? '',
    backgroundId: preference?.backgroundId ?? '',
    frameId: preference?.frameId ?? '',
    passnameId: preference?.passnameId ?? '',
})

const preferenceForm = reactive<PreferenceForm>(createPreferenceForm(profileData.value?.preference))

watch(() => profileData.value?.preference, (value) => {
    if (!value) return
    Object.assign(preferenceForm, createPreferenceForm(value))
}, { immediate: true })

const accountSequence = ref(0)
const nextAccountKey = () => `temp-${Date.now()}-${accountSequence.value++}`

const servers = computed(() => serversData.value ?? [])
const serverMap = computed(() => {
    const map = new Map<number, Server>()
    servers.value.forEach(server => map.set(server.id, server))
    return map
})

const createEditableAccount = (account?: UserAccount): EditableAccount => ({
    _key: account?.id ? `existing-${account.id}` : nextAccountKey(),
    id: account?.id ?? -1,
    server_id: account?.server_id ?? (servers.value[0]?.id ?? 0),
    credentials: account?.credentials ?? '',
    enabled: account?.enabled ?? true,
})

const accounts = ref<EditableAccount[]>(profileData.value?.accounts?.map(createEditableAccount) ?? [])

watch(() => profileData.value?.accounts, (value) => {
    if (!value) {
        accounts.value = []
        return
    }
    accounts.value = value.map(createEditableAccount)
}, { immediate: true })

watch(servers, (list) => {
    if (!list.length) return
    accounts.value.forEach((account) => {
        if (!account.server_id) {
            account.server_id = list[0]!.id
        }
    })
}, { immediate: true })

type ImageFieldKey = 'character' | 'mask' | 'background' | 'frame' | 'passname'
type ImageFieldName = 'characterId' | 'maskId' | 'backgroundId' | 'frameId' | 'passnameId'

const imageTarget = ref<ImageFieldKey | null>(null)
const selectorOpen = ref(false)

const imageFieldMap: Record<ImageFieldKey, ImageFieldName> = {
    character: 'characterId',
    mask: 'maskId',
    background: 'backgroundId',
    frame: 'frameId',
    passname: 'passnameId',
}

// 使用后端预设的图片比例 ID，保持与服务端约定一致
const aspectMap: Record<ImageFieldKey, string> = {
    character: 'character',
    mask: 'mask',
    background: 'background',
    frame: 'frame',
    passname: 'passname',
}

const imageKeys: ImageFieldKey[] = ['character', 'mask', 'background', 'frame', 'passname']

const openImageSelector = (key: ImageFieldKey) => {
    imageTarget.value = key
    selectorOpen.value = true
}

const handleSelectorVisibility = (value: boolean) => {
    selectorOpen.value = value
    if (!value) {
        imageTarget.value = null
    }
}

const handleImageSelect = (image: ImageResponse) => {
    if (!imageTarget.value) return
    const field = imageFieldMap[imageTarget.value]
    // @ts-ignore
    preferenceForm[field] = image.uuid
}

const selectorTitle = computed(() => {
    if (!imageTarget.value) {
        return t('images.title-default')
    }
    return t(`images.${imageTarget.value}.title`)
})

const selectorConfirmLabel = computed(() => t('actions.use-image'))

const imageAspectId = computed(() => imageTarget.value ? aspectMap[imageTarget.value] : '')

const imageCardItems = computed(() => imageKeys.map((key) => {
    const field = imageFieldMap[key]
    const raw = preferenceForm[field] as string | undefined
    return {
        key,
        field,
        src: raw ? img(raw) : '',
        selected: Boolean(raw),
    }
}))

const imagePreviewItems = computed(() => {
    const order: ImageFieldKey[] = ['background', 'character', 'frame', 'mask', 'passname']
    return order.map((key) => {
        const field = imageFieldMap[key]
        const raw = preferenceForm[field] as string | undefined
        return {
            key,
            label: t(`preview.labels.${key}`),
            src: raw ? img(raw) : '',
            selected: Boolean(raw),
            status: raw ? t('preview.status.assigned') : t('preview.status.empty'),
        }
    })
})

const attemptedSubmit = ref(false)
const saving = ref(false)

const disableAddAccount = computed(() => servers.value.length === 0)
const hasInvalidAccount = computed(() => accounts.value.some(account => !account.server_id || !account.credentials.trim()))
const isInitialLoading = computed(() => profilePending.value || serversPending.value)

const handleAddAccount = () => {
    accounts.value.push(createEditableAccount())
}

const removeAccount = (key: string) => {
    accounts.value = accounts.value.filter(account => account._key !== key)
}

const handleSave = async () => {
    attemptedSubmit.value = true
    if (hasInvalidAccount.value) {
        addNotification({
            type: 'warning',
            message: t('toast.account-invalid'),
        })
        return
    }
    saving.value = true
    try {
        const payload = {
            preference: { ...preferenceForm },
            accounts: accounts.value.map((account) => ({
                id: account.id,
                server_id: account.server_id,
                credentials: account.credentials,
                enabled: account.enabled,
            })),
        }

        const updated = await $leporid<UserProfile>('/api/nuxt/profile', {
            method: 'PUT',
            body: payload,
        })

        if (updated?.preference) {
            Object.assign(preferenceForm, createPreferenceForm(updated.preference))
        }
        if (updated?.accounts) {
            accounts.value = updated.accounts.map(createEditableAccount)
        }

        addNotification({
            type: 'success',
            message: t('toast.save-success'),
        })
        attemptedSubmit.value = false
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-base-200">
        <div class="mx-auto w-full max-w-6xl px-4 py-8 lg:py-10">
            <div v-if="isInitialLoading" class="flex flex-col items-center gap-4 py-16 text-base-content/60">
                <span class="loading loading-spinner loading-lg"></span>
                <p>{{ t('loading.initial') }}</p>
            </div>

            <form v-else class="space-y-8" @submit.prevent="handleSave">
                <section class="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div class="card bg-base-100 shadow-md">
                        <div class="card-body space-y-6">
                            <div>
                                <h2 class="card-title text-xl">{{ t('sections.preference.title') }}</h2>
                                <p class="text-sm text-base-content/70">{{ t('sections.preference.subtitle') }}</p>
                            </div>

                            <div class="grid gap-4 md:grid-cols-2 preference-grid">
                                <div class="form-control preference-field">
                                    <label class="label preference-field-label">
                                        <span class="label-text">{{ t('fields.displayName.label') }}</span>
                                    </label>
                                    <input class="input input-bordered w-full md:w-[20rem]" type="text"
                                        v-model="preferenceForm.displayName"
                                        :placeholder="t('fields.displayName.placeholder')">
                                </div>

                                <div class="form-control preference-field">
                                    <label class="label preference-field-label">
                                        <span class="label-text">{{ t('fields.simplifiedCode.label') }}</span>
                                    </label>
                                    <input class="input input-bordered w-full md:w-[20rem]" type="text"
                                        v-model="preferenceForm.simplifiedCode"
                                        :placeholder="t('fields.simplifiedCode.placeholder')">
                                </div>

                                <div class="form-control preference-field">
                                    <label class="label preference-field-label">
                                        <span class="label-text">{{ t('fields.friendCode.label') }}</span>
                                    </label>
                                    <input class="input input-bordered w-full md:w-[20rem]" type="text"
                                        v-model="preferenceForm.friendCode"
                                        :placeholder="t('fields.friendCode.placeholder')">
                                </div>

                                <div class="form-control preference-field">
                                    <label class="label preference-field-label">
                                        <span class="label-text">{{ t('fields.characterName.label') }}</span>
                                    </label>
                                    <input class="input input-bordered w-full md:w-[20rem]" type="text"
                                        v-model="preferenceForm.characterName"
                                        :placeholder="t('fields.characterName.placeholder')">
                                </div>

                                <div class="form-control preference-field">
                                    <label class="label preference-field-label">
                                        <span class="label-text">{{ t('fields.maimaiVersion.label') }}</span>
                                    </label>
                                    <input class="input input-bordered w-full md:w-[20rem]" type="text"
                                        v-model="preferenceForm.maimaiVersion"
                                        :placeholder="t('fields.maimaiVersion.placeholder')">
                                </div>

                                <div class="form-control preference-field">
                                    <label class="label preference-field-label">
                                        <span class="label-text">{{ t('fields.dxRating.label') }}</span>
                                    </label>
                                    <input class="input input-bordered w-full md:w-[20rem]" type="text"
                                        v-model="preferenceForm.dxRating"
                                        :placeholder="t('fields.dxRating.placeholder')">
                                </div>
                                <div class="form-control preference-field">
                                    <label class="label preference-field-label">
                                        <span class="label-text">{{ t('fields.charaInfoColor.label') }}</span>
                                    </label>
                                    <input class="input input-bordered w-full md:w-[20rem]" type="color"
                                        v-model="preferenceForm.charaInfoColor">
                                </div>
                                <div class="form-control preference-field md:col-span-2">
                                    <label class="label preference-field-label">
                                        <span class="label-text">{{ t('fields.qrSize.label') }}</span>
                                    </label>
                                    <p class="preference-field-helper text-xs text-base-content/60">
                                        {{ t('fields.qrSize.helper') }}
                                    </p>
                                    <div class="flex items-center gap-3">
                                        <input class="range range-primary flex-1" type="range" min="8" max="40"
                                            v-model.number="preferenceForm.qrSize">
                                        <span class="badge badge-lg">{{ preferenceForm.qrSize }} {{
                                            t('fields.qrSize.unit') }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="grid gap-4 md:grid-cols-2">
                                <div class="form-control">
                                    <div
                                        class="flex items-center justify-between gap-4 rounded-lg border border-base-200 bg-base-200/40 px-4 py-3">
                                        <div>
                                            <p class="font-medium text-sm">{{ t('fields.dynamicRating.label') }}</p>
                                            <p class="text-xs text-base-content/70">{{ t('fields.dynamicRating.helper')
                                            }}</p>
                                        </div>
                                        <input class="toggle toggle-primary" type="checkbox"
                                            v-model="preferenceForm.dynamicRating">
                                    </div>
                                </div>

                                <div class="form-control">
                                    <div
                                        class="flex items-center justify-between gap-4 rounded-lg border border-base-200 bg-base-200/40 px-4 py-3">
                                        <div>
                                            <p class="font-medium text-sm">{{ t('fields.showDate.label') }}</p>
                                            <p class="text-xs text-base-content/70">{{ t('fields.showDate.helper') }}
                                            </p>
                                        </div>
                                        <input class="toggle toggle-primary" type="checkbox"
                                            v-model="preferenceForm.showDate">
                                    </div>
                                </div>
                            </div>

                            <div class="divider my-2">{{ t('sections.preference.images') }}</div>

                            <div class="grid gap-6 md:grid-cols-2">
                                <div v-for="item in imageCardItems" :key="item.key"
                                    class="rounded-xl border border-base-200 bg-base-200/40 p-4">
                                    <div class="flex items-start gap-3">
                                        <div
                                            class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-base-200 bg-base-100">
                                            <img v-if="item.src" :src="item.src" :alt="t(`images.${item.key}.label`)"
                                                class="h-full w-full object-cover" loading="lazy">
                                            <span v-else class="text-xs text-base-content/40">{{
                                                t('preview.empty') }}</span>
                                        </div>
                                        <div class="flex-1 space-y-1">
                                            <p class="text-sm font-semibold">{{ t(`images.${item.key}.label`) }}</p>
                                            <p class="text-xs text-base-content/60">{{ t(`images.${item.key}.helper`) }}
                                            </p>
                                            <div class="flex flex-wrap gap-2 pt-1">
                                                <button class="btn btn-sm" type="button"
                                                    @click="openImageSelector(item.key)">
                                                    {{ item.selected ? t('actions.replace-image') :
                                                        t('actions.choose-image') }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="card bg-base-100 shadow-md">
                    <div class="card-body space-y-6">
                        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 class="card-title text-xl">{{ t('sections.accounts.title') }}</h2>
                                <p class="text-sm text-base-content/70">{{ t('sections.accounts.subtitle') }}</p>
                            </div>
                            <button class="btn btn-outline" type="button" @click="handleAddAccount"
                                :disabled="disableAddAccount">
                                {{ t('actions.add-account') }}
                            </button>
                        </div>

                        <div v-if="accounts.length === 0"
                            class="rounded-lg border border-dashed border-base-200 p-8 text-center text-sm text-base-content/60">
                            {{ t('accounts.empty') }}
                        </div>

                        <div v-else class="space-y-4">
                            <div v-for="account in accounts" :key="account._key"
                                class="space-y-4 rounded-xl border border-base-200 p-4">
                                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p class="text-base font-semibold">
                                            {{ serverMap.get(account.server_id)?.name || t('accounts.fallback-name') }}
                                        </p>
                                        <p class="text-xs text-base-content/60">
                                            {{ serverMap.get(account.server_id)?.description ||
                                                t('accounts.fallback-desc') }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <label class="flex items-center gap-2 text-sm">
                                            <span>{{ t('accounts.enabled') }}</span>
                                            <input class="toggle toggle-primary" type="checkbox"
                                                v-model="account.enabled">
                                        </label>
                                        <button class="btn btn-ghost btn-sm text-error" type="button"
                                            @click="removeAccount(account._key)">
                                            {{ t('actions.remove-account') }}
                                        </button>
                                    </div>
                                </div>

                                <div class="grid gap-4 md:grid-cols-2">
                                    <div class="form-control">
                                        <label class="label">
                                            <span class="label-text">{{ t('fields.account.server') }}</span>
                                        </label>
                                        <select class="select select-bordered" v-model.number="account.server_id"
                                            :disabled="servers.length === 0">
                                            <option v-for="server in servers" :key="server.id" :value="server.id">
                                                {{ server.name }}
                                            </option>
                                        </select>
                                        <label v-if="attemptedSubmit && !account.server_id" class="label">
                                            <span class="label-text-alt text-xs text-error">{{
                                                t('errors.account.server') }}</span>
                                        </label>
                                    </div>

                                    <div class="form-control md:col-span-2">
                                        <label class="label">
                                            <span class="label-text">
                                                {{ t('fields.account.credentials') }}
                                                <span v-if="serverMap.get(account.server_id)?.credentials_field"
                                                    class="text-xs text-base-content/60">
                                                    ({{ serverMap.get(account.server_id)?.credentials_field }})
                                                </span>
                                            </span>
                                        </label>
                                        <input class="input input-bordered" type="text" v-model="account.credentials"
                                            :placeholder="serverMap.get(account.server_id)?.credentials_field || ''">
                                        <label v-if="attemptedSubmit && !account.credentials.trim()" class="label">
                                            <span class="label-text-alt text-xs text-error">{{
                                                t('errors.account.credentials') }}</span>
                                        </label>
                                    </div>
                                </div>

                                <div v-if="serverMap.get(account.server_id)"
                                    class="alert bg-base-200 text-base-content/80">
                                    <div>
                                        <h4 class="text-sm font-semibold">{{
                                            serverMap.get(account.server_id)?.tips_title }}</h4>
                                        <p class="text-xs leading-relaxed">{{
                                            serverMap.get(account.server_id)?.tips_desc }}</p>
                                        <a v-if="serverMap.get(account.server_id)?.tips_url"
                                            class="link link-primary text-xs"
                                            :href="serverMap.get(account.server_id)?.tips_url" target="_blank"
                                            rel="noopener">
                                            {{ t('sections.accounts.tips-link') }}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer class="flex justify-end">
                    <button class="btn btn-primary w-full md:w-auto" type="submit" :disabled="saving">
                        <span v-if="saving" class="loading loading-spinner"></span>
                        <span>{{ t('actions.save') }}</span>
                    </button>
                </footer>
            </form>
        </div>
    </div>

    <ImageSelector v-if="imageTarget" :open="selectorOpen" :aspect-id="imageAspectId" :title="selectorTitle"
        :confirm-label="selectorConfirmLabel" @update:open="handleSelectorVisibility" @select="handleImageSelect" />
</template>

<style scoped>
.preference-grid {
    align-items: stretch;
}

.preference-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
}

.preference-field-label {
    display: flex;
    align-items: flex-start;
    padding: 0;
    gap: 0.25rem;
}

.preference-field-helper {
    margin-top: -0.25rem;
}
</style>

<i18n lang="yaml">
zh-CN:
  loading:
    initial: 正在加载个人资料...
  sections:
    preference:
      title: 个性化设置
      subtitle: 配置用户卡面的展示效果。
      images: 图片资源
    accounts:
      title: 账号管理
      subtitle: 可在本地自由编辑，最终一次性保存。
      tips-link: 查看使用说明
  fields:
    displayName:
      label: 展示名称
      placeholder: 输入展示名称
    simplifiedCode:
      label: 简化代码
      placeholder: 输入简化代码
    friendCode:
      label: 好友码
      placeholder: 输入好友码
    characterName:
      label: 角色名称
      placeholder: 输入角色名称
    maimaiVersion:
      label: maimai版本
      placeholder: 输入版本信息
    dxRating:
      label: DX Rating
      placeholder: 输入DX Rating
    qrSize:
      label: 二维码尺寸
      helper: 调整展示在卡面上的二维码大小。
      unit: px
    charaInfoColor:
      label: 角色信息颜色
    dynamicRating:
      label: 自动更新Rating
      helper: 开启后会在数据更新时同步展示。
    showDate:
      label: 显示日期
      helper: 控制卡面是否显示日期。
    account:
      server: 选择服务器
      credentials: 账号凭据
    images:
        title-default: 选择图片
        character:
            label: 角色立绘
            title: 选择角色立绘
            helper: 卡面正面展示的角色形象。
        mask:
            label: 遮罩图层
            title: 选择遮罩图层
            helper: 覆盖在立绘上的装饰或遮挡层。
        background:
            label: 背景
            title: 选择背景
            helper: 角色背后展示的背景。
        frame:
            label: 边框
            title: 选择边框
            helper: 包裹卡面的装饰框体。
        passname:
            label: 名牌横幅
            title: 选择名牌横幅
            helper: 卡片底部显示名牌的横幅。
        empty: 暂未选择
        placeholder: 选择图片后将显示路径
        status:
            assigned: 已选中的图片将用于卡面。
            empty: 尚未选择图片。
            badge: 已启用
    actions:
        choose-image: 选择图片
        replace-image: 更换图片
        clear-image: 清除选择
        add-account: 新增账号
        remove-account: 删除
        use-image: 使用该图片
        save: 保存修改
  accounts:
    empty: 暂无账号，请先新增一个。
    enabled: 启用
    fallback-name: 待选择服务器
    fallback-desc: 请选择服务器以查看详情。
  toast:
    save-success: 偏好设置已保存。
    account-invalid: 请先补全所有账号的服务器与凭据后再保存。
  errors:
    account:
      server: 请选择服务器。
      credentials: 凭据不能为空。
</i18n>
