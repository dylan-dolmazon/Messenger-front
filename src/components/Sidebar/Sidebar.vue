<script setup lang="ts">
import { toRefs, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Conversation } from '@/client/types/business'
import { useAuthStore } from '@/stores/auth'
import { useMessengerStore } from '@/stores/messenger'


const router = useRouter()

const authStore = useAuthStore()

const messengerStore = useMessengerStore()

const { user } = toRefs(authStore)
const { logout } = authStore

const { conversations} =toRefs(messengerStore)

const searchInput = ref('')
function sortConversations(conversations: Conversation[]): Conversation[] {
    return conversations.sort((a, b) =>
        (b.messages.length === 0
                ? b.updated_at
                : b.messages[b.messages.length - 1].posted_at
        ).localeCompare(
            a.messages.length === 0
                ? a.updated_at
                : a.messages[a.messages.length - 1].posted_at
        )
    )
}

const filterConversations = computed(() => {
    if (searchInput.value === '') return sortConversations(conversations.value)
    const tabConversationsResult: Conversation[] = []
    conversations.value.map((conversation: Conversation) => {
        let isFound = false
        for (let i = 0; i < conversation.participants.length; i++) {
            if (
                conversation.participants[i]
                    .toLowerCase()
                    .includes(searchInput.value.toLowerCase())
            ) {
                tabConversationsResult.push(conversation)
                isFound = true
                break
            }
        }
        if (!isFound) {
            if (conversation.title) {
                if (conversation.title.includes(searchInput.value)) {
                    tabConversationsResult.push(conversation)
                }
            }
        }
    })
    return sortConversations(tabConversationsResult)
})

function openCommunity() {

    router.push({ name: 'Community' })
}

function openMessageSearch() {
    router.push({ name: 'Search' })
}

function openInfoGroup() {
    router.push({ name: 'Info-group' })
}

function openConversation(id: Conversation['id']) {
    router.push({ name: 'Conversation', params: { id } })
    activeConv.value = id
}

const getConversations = computed(()=>{
    return conversations.value
})

const activeConv = ref<Conversation['id']>();


function isActive(id: Conversation['id']): boolean{
    return activeConv.value == id
}

</script>

<template>
    <div class="sidebar">
        <div class="user" v-if="user">
            <div class="user-picture">
                <img :src="user.picture_url" class="ui circular image" />
            </div>

            <div class="user-info">
                <div class="user-info-pseudo">{{ user.username }}</div>

                <div class="user-info-status ui simple dropdown">
                    <div class="available text">En ligne</div>
                    <i class="dropdown icon"></i>
                    <div class="menu">
                        <div class="item" @click="logout">
                            <i class="logout icon"></i>
                            Déconnexion
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="menu">
            <div class="blue button" @click="openCommunity">
                <i class="users icon"></i>
                <br />
                <span>Communauté</span>
            </div>
            <div v-if="true" class="blue button" @click="openMessageSearch">
                <i class="search icon"></i>
                <br />
                <span>Messages</span>
            </div>
            <div v-if="true" class="blue button" @click="openInfoGroup">
                <i class="users icon"></i>
                <br />
                <span>Info groupe</span>
            </div>
        </div>
        <div class="conversations">
            <div class="conversation-search">
                <div class="ui fluid search">
                    <div class="ui icon input">
                        <input
                            class="prompt"
                            placeholder="Rechercher une conversation"
                            type="text"
                            v-model="searchInput"
                        />
                        <i class="search icon"></i>
                    </div>
                </div>
            </div>
            <div v-for="(conversation,i) in filterConversations" :key="i"
                 class="conversation"
                 :class="{
                    active: isActive(conversation.id),
                    new:
						messengerStore.authenticatedUsername &&
						!Object.keys(conversation.seen).includes(messengerStore.authenticatedUsername),
                    }"
                 :title="messengerStore.getParticipantsNames(conversation)"
                 @click="
                    openConversation(conversation.id)
                "
                >
                <a class="avatar">
                    <img
                    :src="messengerStore.getAvatar(conversation)"
                    />
                </a>
                <div class="content">
                    <div class="metadata">
                        <div class="title">
                            <i class="ui small icon circle"></i>
                            {{messengerStore.getParticipantsNames(conversation)}}
                        </div>
                        <span class="time">{{conversation.messages.length === 0
									? messengerStore.getFormatDate(conversation.updated_at).toLocaleDateString()
									: messengerStore.getFormatDate(
											conversation.messages[conversation.messages.length - 1]
												.posted_at
									  ).toLocaleDateString()}}</span>
                    </div>
                    <div class="text">{{conversation.messages.length === 0
									? 'Nouvelle conversation'
									: conversation.messages[conversation.messages.length - 1]
											.content}}</div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped src="./Sidebar.css" />
