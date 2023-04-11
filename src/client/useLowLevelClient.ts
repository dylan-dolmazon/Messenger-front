import { ref } from 'vue'
import type { Auth } from '@/client/types/business'
import Client from './client'

const authenticating = ref(false)

export const client = new Client()

export function useLowLevelClient() {
    async function connect(
        username: string,
        password: string,
        endpoint: string
    ): Promise<Auth> {
        authenticating.value = true

        client.setEndpoint(endpoint)

        try {
            const auth = await client.authenticate(username, password)
            authenticating.value = false
            return auth
        } catch (e) {
            authenticating.value = false
            throw e
        }
    }

    return {
        connect,
        emit: client.emit.bind(client),
        on: client.on.bind(client),
        authenticating,
    }
}
