<template>
    <div class="profile-page">
        <h1>{{ $t('profile.title') }}</h1>

        <!-- 用户偏好设置 -->
        <section class="preference-section">
            <h2>{{ $t('profile.preference') }}</h2>
            <form @submit.prevent="handleUpdatePreference" v-if="profile">
                <div class="form-group">
                    <label for="displayName">{{ $t('profile.displayName') }}</label>
                    <input id="displayName" v-model="preferenceForm.displayName" type="text"
                        :placeholder="$t('profile.displayNamePlaceholder')" />
                </div>

                <div class="form-group">
                    <label for="friendCode">{{ $t('profile.friendCode') }}</label>
                    <input id="friendCode" v-model="preferenceForm.friendCode" type="text"
                        :placeholder="$t('profile.friendCodePlaceholder')" />
                </div>

                <div class="form-group">
                    <label for="qrSize">{{ $t('profile.qrSize') }}</label>
                    <input id="qrSize" v-model.number="preferenceForm.qrSize" type="number" min="10" max="30" />
                </div>

                <div class="form-group">
                    <label for="charaInfoColor">{{ $t('profile.charaInfoColor') }}</label>
                    <input id="charaInfoColor" v-model="preferenceForm.charaInfoColor" type="color" />
                </div>

                <div class="form-group checkbox">
                    <input id="dynamicRating" v-model="preferenceForm.dynamicRating" type="checkbox" />
                    <label for="dynamicRating">{{ $t('profile.dynamicRating') }}</label>
                </div>

                <div class="form-group checkbox">
                    <input id="showDate" v-model="preferenceForm.showDate" type="checkbox" />
                    <label for="showDate">{{ $t('profile.showDate') }}</label>
                </div>

                <button type="submit" :disabled="loading">
                    {{ loading ? $t('common.saving') : $t('common.save') }}
                </button>
            </form>
        </section>

        <!-- 用户账号列表 -->
        <section class="accounts-section">
            <h2>{{ $t('profile.accounts') }}</h2>
            <div class="accounts-list" v-if="profile">
                <div v-for="account in profile.accounts" :key="account.id" class="account-item">
                    <div class="account-info">
                        <span class="server-id">{{ $t('profile.serverId') }}: {{ account.server_id }}</span>
                        <span class="status" :class="{ enabled: account.enabled }">
                            {{ account.enabled ? $t('common.enabled') : $t('common.disabled') }}
                        </span>
                    </div>
                    <div class="account-actions">
                        <button @click="handleDeleteAccount(account.id)">
                            {{ $t('common.delete') }}
                        </button>
                    </div>
                </div>
            </div>
            <p v-else-if="!loading">{{ $t('profile.noAccounts') }}</p>
        </section>
    </div>
</template>

<script setup lang="ts">
import type { UserProfile, UpdateUserPreferenceRequest } from '~~/shared/types/profile'

definePageMeta({
    middleware: 'auth'
})

const { getProfile, updateProfile, deleteAccount } = useProfile()
const { addNotification } = useNotificationsStore()
const { t } = useI18n()

const profile = ref<UserProfile | null>(null)
const loading = ref(false)

const preferenceForm = reactive<UpdateUserPreferenceRequest>({
    displayName: '',
    friendCode: '',
    qrSize: 15,
    charaInfoColor: '#fee37c',
    dynamicRating: true,
    showDate: true
})

// 加载用户资料
const loadProfile = async () => {
    loading.value = true
    try {
        profile.value = await getProfile()
        if (profile.value?.preference) {
            Object.assign(preferenceForm, profile.value.preference)
        }
    } catch (error) {
        addNotification({
            type: 'error',
            message: t('profile.loadError')
        })
    } finally {
        loading.value = false
    }
}

// 更新用户偏好设置
const handleUpdatePreference = async () => {
    loading.value = true
    try {
        profile.value = await updateProfile({
            preference: preferenceForm
        })
        addNotification({
            type: 'success',
            message: t('profile.updateSuccess')
        })
    } catch (error) {
        addNotification({
            type: 'error',
            message: t('profile.updateError')
        })
    } finally {
        loading.value = false
    }
}

// 删除用户账号
const handleDeleteAccount = async (accountId: number) => {
    if (!confirm(t('profile.deleteConfirm'))) {
        return
    }

    loading.value = true
    try {
        await deleteAccount(accountId)
        addNotification({
            type: 'success',
            message: t('profile.deleteSuccess')
        })
        await loadProfile()
    } catch (error) {
        addNotification({
            type: 'error',
            message: t('profile.deleteError')
        })
    } finally {
        loading.value = false
    }
}

// 页面加载时获取用户资料
onMounted(() => {
    loadProfile()
})
</script>

<style scoped>
.profile-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

h1 {
    margin-bottom: 2rem;
}

section {
    margin-bottom: 3rem;
    padding: 1.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
}

h2 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="number"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.form-group input[type="color"] {
    width: 100px;
    height: 40px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.form-group.checkbox {
    display: flex;
    align-items: center;
}

.form-group.checkbox input {
    width: auto;
    margin-right: 0.5rem;
}

.form-group.checkbox label {
    margin-bottom: 0;
}

button {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.accounts-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.account-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

.account-info {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.status {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    background-color: #f0f0f0;
}

.status.enabled {
    background-color: #d4edda;
    color: #155724;
}

.account-actions button {
    padding: 0.5rem 1rem;
    background-color: #dc3545;
}

.account-actions button:hover {
    background-color: #c82333;
}
</style>
