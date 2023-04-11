<script setup lang="ts">
import { toRefs, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import Auth from '@/components/Auth/Auth.vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { useHighLevelClientEmits } from '@/composables/emits'
import { listenHighLevelClientEvents } from '@/composables/events'
import { useAuthStore } from '@/stores/auth'
import { useMessengerStore } from '@/stores/messenger'

const authStore = useAuthStore()

const { user } = toRefs(authStore)

const messengerStore = useMessengerStore()

const router = useRouter()

const clientEmits = useHighLevelClientEmits()

listenHighLevelClientEvents()

watch(user, (newUser, oldUser) => {
    const justAuthenticated = newUser && !oldUser
    if (justAuthenticated) {
        clientEmits.getUsers()
        clientEmits.getConversations()
    }
})

authStore.login()

router.beforeEach((to, from, next) => {
    let conversationId: string | null = null

    if (to.name === 'Conversation' || to.name==='Group') {
        conversationId = Array.isArray(to.params.id)
            ? to.params.id[0]
            : to.params.id
    }

    messengerStore.setCurrentConversationId(conversationId)

    next()
})
</script>

<template>
    <Auth v-if="!user" />
    <template v-else>
        <Sidebar />
        <div class="main">
            <RouterView />
        </div>
    </template>
</template>

<style scoped>
.main {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 300px;
    right: 0;
    background: white;
    overflow-y: auto;
}

@media screen and (max-width: 800px) {
    .main {
        left: 60px;
    }
}

.main > * {
    margin: 0 auto;
}
</style>
