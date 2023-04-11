import { defineStore } from 'pinia'
import { ref, computed, toRefs } from 'vue'
import type {Conversation, Message, User} from '@/client/types/business'
import { useAuthStore } from '@/stores/auth'

export const useMessengerStore = defineStore('messenger', () => {
    const authStore = useAuthStore()

    const { user: userRef } = toRefs(authStore)

    // State

    const usersRef = ref<User[]>([])

    const availableUsernames = ref<string[]>([])

    const conversationsRef = ref<Conversation[]>([])

    const currentConversationId = ref<string | null>(null)

    // Getters

    const authenticatedUsername = computed(
        () => userRef.value?.username || null
    )

    const users = computed(() =>
        usersRef.value.map((user) => {
            return {
                ...user,
            }
        })
    )

    const conversations = computed(() =>
        conversationsRef.value.map((conversation) => {
            return {
                ...conversation,
            }
        })
    )

    const currentConversation = computed(() => {
        return conversationsRef.value.find(
            (conversation) => conversation.id === currentConversationId.value
        )
    })

    const currentConversationParticipants = computed(

        () =>
            currentConversation.value?.participants.filter(
                (participant) => participant !== authenticatedUsername.value
            ) ?? []
    )
    const getOnlineParticipant = computed((): boolean => {
        if (!currentConversation.value) return false
        if (currentConversation.value.participants.length > 2) {
            const allMember = currentConversationParticipants.value

            for (let i = 0; i < allMember.length; i++) {
                if (availableUsernames.value.includes(allMember[i])) return true
            }

            return false
        } else
            return availableUsernames.value.includes(
                currentConversation.value.participants[1]
            )
    })
    return {
        authenticatedUsername,
        users,
        conversations,
        currentConversation,
        currentConversationParticipants,
        getOnlineParticipant,
        setCurrentConversationId,
        setUsers,
        upsertUser,
        setConversations,
        upsertConversation,
        upsertMessage,
        getAvatar,
        getParticipantsNames,
        getFormatDate,
    }

    // Actions

    function setCurrentConversationId(conversationId: string | null) {
        console.log('id',conversationId)
        currentConversationId.value = conversationId
    }

    function setUsers(users: User[]) {
        usersRef.value = users
    }
    function setConversations(conversations: Conversation[]) {
        conversationsRef.value = conversations
    }
    function upsertUser(user: User) {
        const userIndex = usersRef.value.findIndex(
            (_user) => _user.username === user.username
        )

        if (userIndex !== -1) {
            usersRef.value[userIndex] = { ...user }
        } else {
            usersRef.value.push({ ...user })
        }
    }

    function upsertConversation(conversation: Conversation) {
        const conversationIndex = conversationsRef.value.findIndex(
            (_conversation) => _conversation.id === conversation.id
        )

        if (conversationIndex !== -1) {
            conversationsRef.value[conversationIndex] = { ...conversation }
        } else {
            conversationsRef.value.push({ ...conversation })
        }
    }

    function upsertMessage(conversationId: string, message: Message){
        const conversationIndex = conversationsRef.value.findIndex(
            (_conversation) => _conversation.id === conversationId
        )
        if (conversationIndex !== -1){
            const messageIndex = conversationsRef.value[conversationIndex].messages.findIndex((_message)=>_message.id===message.id)
            if (messageIndex!== -1){
                conversationsRef.value[conversationIndex].messages[messageIndex]= message
            }else{
                conversationsRef.value[conversationIndex].messages.push({
                    ...message
                })
            }
        }

    }

    function getAvatar(conversation: Conversation){
        const username = conversation.participants.find(
            (participant) => participant !== authenticatedUsername.value
        )
        const user = users.value.find((user) => user.username === username)
        if (!user) {
            return 'https://yt3.ggpht.com/JliOszS4fXEpCIs2it_vsBjwhlNWgZsboezGA7NYUtihf8F54A5I7laaj2d3zpH-io6e2fVL=s900-c-k-c0x00ffffff-no-rj' // Mmmmmh
        }
        return user.picture_url
    }

    function getParticipantsNames(conversation: Conversation){
        if (conversation.title) return conversation.title

        if (conversation.participants.length > 2) {
            return `Groupe: ${conversation.participants.join(', ')}`
        }

        const participant = conversation.participants.find(
            (participant) => participant !== authenticatedUsername.value
        )

        if (participant) {
            return participant
        }

        return 'Anonymous'
    }
    function getFormatDate(date: string){
        return new Date(date)
    }
})
