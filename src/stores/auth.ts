import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Auth } from '@/client/types/business'
import { useLowLevelClient } from '@/client/useLowLevelClient'

const defaultUsername = localStorage.getItem('username') || ''
const defaultPassword = localStorage.getItem('password') || ''
const defaultEndpoint =
    localStorage.getItem('endpoint') || 'ws://slash-mountainous-possum.glitch.me'

const { connect } = useLowLevelClient()

export const useAuthStore = defineStore('auth', () => {
    const user = ref<Auth | null>(null)

    async function login(
        username = defaultUsername,
        password = defaultPassword,
        endpoint = defaultEndpoint
    ) {
        try {
            user.value = await connect(username, password, endpoint)

            localStorage.setItem('username', username)
            localStorage.setItem('password', password)
            localStorage.setItem('endpoint', endpoint)
        } catch (e) {
            localStorage.setItem('password', '')
            user.value = null
            throw e
        }
    }

    async function logout() {
        localStorage.setItem('password', '')
        window.location.reload()
    }

    return {
        user,
        defaultUsername,
        defaultPassword,
        defaultEndpoint,
        login,
        logout,
    }
})
