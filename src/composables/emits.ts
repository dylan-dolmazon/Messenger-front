import { useRouter } from 'vue-router'
import type {
    GetConversationsEmit,
    GetOrCreateOneToOneConversationEmit,
    CreateManyToManyConversationEmit,
    GetUsersEmit,
    PostMessageEmit,
    TypeConversationEmit,
    AddParticipantEmit,
    RemoveParticipantEmit,
    ReactMessageEmit,
    DeleteMessageEmit,
    ReplyMessageEmit
} from '@/client/types/emits'
import { useLowLevelClient } from '@/client/useLowLevelClient'
import { useMessengerStore } from '@/stores/messenger'

export function useHighLevelClientEmits() {
    const chatClient = useLowLevelClient()

    const messengerStore = useMessengerStore()

    const router = useRouter()

    return {
        async getUsers() {
            const { users } = await chatClient.emit<GetUsersEmit>(
                '@getUsers',
                {}
            )
            messengerStore.setUsers(users)
        },
        async postMessage(converastionId: string, message: string) {
            await chatClient.emit<PostMessageEmit>('@postMessage', {
                conversation_id: converastionId,
                content: String(message),
            })
            console.log("message emit");
        },
        async getConversations() {
            const { conversations } = await chatClient.emit<GetConversationsEmit>(
                '@getConversations',
                {}
            )
            messengerStore.setConversations(conversations)
        },

        async deleteMessage(conversationId: string, messageId: string) {
            const response = await chatClient.emit<DeleteMessageEmit>(
                '@deleteMessage',
                {
                    conversation_id: conversationId,
                    message_id: messageId,
                }
            )
            return response
        },

        async reactMessage(
            messageID: string,
            reaction: 'HEART' | 'THUMB' | 'HAPPY' | 'SAD',
            conversationID: string
        ) {
            const response = await chatClient.emit<ReactMessageEmit>(
                '@reactMessage',
                {
                    conversation_id: conversationID,
                    message_id: messageID,
                    reaction: reaction,
                }
            )
            return response
        },

        async addParticipant(username: string, conversationID: string) {
            const response = await chatClient.emit<AddParticipantEmit>(
                '@addParticipant',
                {
                    conversation_id: conversationID,
                    username: username,
                }
            )
            return response
        },

        async replyMessage(
            conversationId: string,
            messageId: string,
            message: string
        ) {
            const response = await chatClient.emit<ReplyMessageEmit>(
                '@replyMessage',
                {
                    conversation_id: conversationId,
                    message_id: messageId,
                    content: message,
                }
            )
            return response
        },

        async removeParticipant(username: string, conversationID: string) {
            const response = await chatClient.emit<RemoveParticipantEmit>(
                '@removeParticipant',
                {
                    conversation_id: conversationID,
                    username: username,
                }
            )
            return response
        },

        async createOneToOneConversation(username: string) {
            const response =
                await chatClient.emit<GetOrCreateOneToOneConversationEmit>(
                    '@getOrCreateOneToOneConversation',
                    { username }
                )

            const { conversation } = response

             messengerStore.upsertConversation(conversation)

            router.push({
                name: 'Conversation',
                params: { id: conversation.id },
            })

            return response
        },
        async createManyToManyConversation(usernames: string[]) {
			const response = await chatClient.emit<CreateManyToManyConversationEmit>(
				'@createManyToManyConversation',
				{ usernames }
			)

			const { conversation } = response

			messengerStore.upsertConversation(conversation)

			router.push({
				name: 'Conversation',
				params: { id: conversation.id },
			})

			return response
		},
    }
}
