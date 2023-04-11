<script setup lang="ts">
import {computed, onMounted, onUpdated, ref, toRefs, watch} from 'vue'
import Group from '@/components/Group/Group.vue'
import { useMessengerStore } from '@/stores/messenger'
import type {Conversation,Message as MessageType} from "@/client/types/business";
import {useHighLevelClientEmits} from "@/composables/emits";

import Message from "@/components/Message/Message.vue";
import router from "@/router";
const clientEmits = useHighLevelClientEmits()

const groupPanel = ref(false)
const inputSentMessage = ref('')
const scrollElement = ref<HTMLElement | null>(null)
const writingResponse = ref(false)
const messagetoEdit = ref('')


const messengerStore = useMessengerStore()

const {
    currentConversation,
    currentConversationParticipants,
    authenticatedUsername,
    getOnlineParticipant,
    users,
} = toRefs(messengerStore)


const responseMessage = ref({
    user: '',
    content: '',
    messageId: '',
})

const messages = computed(() => {
    return currentConversation.value?.messages ?? []
})

onMounted(() => {
    scrollBottom()
})

onUpdated(() => {
    scrollBottom()
})

watch(currentConversation, (newConversation, oldConversation) => {
    scrollBottom()
})

function scrollBottom() {
    setTimeout(() => {
        if (scrollElement.value) {
            scrollElement.value.scrollTop = scrollElement.value.scrollHeight
        }
    }, 0)
}
function getPP(participants: string[] | string): string {
    let username: string | undefined
    if (Array.isArray(participants)) {
        username = participants.find(
            (participant: string) => participant !== authenticatedUsername.value
        )
    } else {
        username = participants
    }

    const user = users.value.find((user) => user.username === username)
    if (!user) {
        return 'https://yt3.ggpht.com/JliOszS4fXEpCIs2it_vsBjwhlNWgZsboezGA7NYUtihf8F54A5I7laaj2d3zpH-io6e2fVL=s900-c-k-c0x00ffffff-no-rj' // Mmmmmh
    }

    return user.picture_url
}

function reactMessage($event: {
    message: typeof Message
    reaction: 'HEART' | 'THUMB' | 'HAPPY' | 'SAD'
}): void {
    if (!currentConversation.value) return
    clientEmits.reactMessage(
        $event.message.id,
        $event.reaction,
        currentConversation.value.id
    )
}

function conversationTitle(conversation: Conversation): string {
    if(conversation.title){
        console.log(conversation.title)
        return conversation.title
    }
    if(conversation.participants.length>2){
        console.log(`Groupe: ${currentConversationParticipants.value.join(', ')}`)
        return `Groupe: ${currentConversationParticipants.value.join(', ')}`
    }
    const participant = conversation.participants.find((participant)=>participant!==authenticatedUsername.value)
    if(!participant){
        console.log('Inconnu')
        return 'Inconnu'
    }
    return participant
}
async function sendMessage(): Promise<void> {
    if (!currentConversation.value) return

    const temp = inputSentMessage.value
    inputSentMessage.value = ''

    if (responseMessage.value.user !== '') {
        await clientEmits.replyMessage(
            currentConversation.value.id,
            responseMessage.value.messageId,
            String(temp)
        )
        response('', '', '')
    } else {
        await clientEmits.postMessage(currentConversation.value.id, String(temp))
    }
}
function getMessageClass(message: MessageType, messages: MessageType[]): string {
    let classes =
        computed(() => {
            const index = messages.findIndex((_message) => _message.id === message.id)
            const previousMessage = messages[index - 1]
            const nextMessage = messages[index + 1]

            let result = 'top bottom'

            if (
                nextMessage &&
                nextMessage.from === message.from &&
                (!previousMessage || previousMessage.from !== message.from)
            )
                result = 'top'
            else if (
                previousMessage &&
                previousMessage.from === message.from &&
                (!nextMessage || nextMessage.from !== message.from)
            )
                result = 'bottom'
            else if (
                previousMessage &&
                nextMessage &&
                previousMessage.from === message.from &&
                nextMessage.from === message.from
            )
                result = 'middle'
            return result
        }).value ?? 'middle'



    return classes
}

function response(
    user: string,
    content: string | null,
    messageId: string
) {
    console.log(user,content,messageId);
    console.log("test");

    responseMessage.value = {
        user: user,
        content: content === null ? '' : content,
        messageId: messageId,
    }
}

function remove(messageId: string): void {
    console.log(messageId);
    console.log("test");

    if (!currentConversation.value) return

    clientEmits.deleteMessage(currentConversation.value.id, messageId)
}

function convertStringToDate(date: string):Date{
    return new Date(date);
}
function openGroup(): void {

    router.push({
        name: 'Group',
        params: { id: currentConversation.value?.id },
    })
}

function leaveMessageIsEditing() {
    writingResponse.value = false
    inputSentMessage.value = ''
}

async function modify(
    messageId: string,
    messageContent: string
): Promise<void> {
    console.log(messageId,messageContent);
    writingResponse.value = true
    inputSentMessage.value = messageContent
    messagetoEdit.value = messageId
}

</script>

<template>
    <div class="conversation">
        <div class="conversation-header">
            <!--      <img-->
            <!--        class="avatar"-->
            <!--        src="https://source.unsplash.com/FUcupae92P4/100x100"-->
            <!--      />-->

                <img
                    v-if="currentConversation && currentConversation.participants.length < 3"
                    :src="getPP(currentConversation.participants)"
                    class="avatar"
                    alt="Group photo" />

                <span v-else>
                    <i class="avatar users icon"></i>
            </span>
            <div class="title">
                <div class="ui compact">
                    <i
                        v-if="currentConversation"
                        :class="{ 'icon circle': getOnlineParticipant }"></i>
                    <span v-if="currentConversation">
                        {{ conversationTitle(currentConversation) }}
                        <br />
                        <i class="nickname">

                        </i>
                    </span>
                </div>
            </div>
            <div class="ui simple dropdown item">
                <i class="vertical ellipsis icon"></i>

                <div class="menu">
                    <div
                        v-if="true"
                        class="item"
                        data-bs-toggle="modal"
                        data-bs-target="#changeThemeModal">
                        <i class="ui icon paint brush"></i>
                        Modifier le thème
                    </div>
                    <div
                        v-if="currentConversation?.participants.length > 2"
                        class="item"
                        data-bs-toggle="modal"
                        data-bs-target="#changeTitleModal"
                       >
                        <i class="ui icon edit"></i>
                        Modifier le titre
                    </div>
                    <div

                        class="item">

                        <i class="ui icon volume bell slash"></i>
                        Mettre en sourdine
                    </div>
                    <div
                      class="item">
                        <i class="ui icon volume bell"></i>
                        Rétablir les notifications
                    </div>
                    <div class="item" @click="openGroup">
                        <i class="ui icon users"></i>
                        Gérer les participants
                    </div>
                </div>
            </div>
        </div>

        <div class="conversation-container">
            <div class="conversation-main">
                <div class="conversation-body" ref="scrollElement">
                    <div class="wrapper">
                        <div
                            class="message-container"
                            v-for="message in messages"
                            :key="message.id">
                            <div class="time">
                                {{
                                    convertStringToDate(message.posted_at).toLocaleTimeString()
                                }}
                            </div>
                            <Message
                                :message="message"
                                :icon="getPP(message.from)"
                                :class="getMessageClass(message, messages)"
                                @reaction="reactMessage($event)"
                                @reply-to-message="
									response(message.from, message.content, message.id)
								"
                                @delete-message="remove(message.id)"
                                @edit-message="
									modify(message.id, String(message.content))
								" />
                        </div>
                    </div>
                </div>
                <!--
                <div class="typing">
                    <div class="wrapper">Alice est en train d'écrire...</div>
                </div>-->
                <div class="conversation-footer">
                    <div class="wrapper">
                        <p v-if="responseMessage.user !== ''">
                            <i title="Abandonner" class="circular times small icon link"></i>
                            Répondre à {{ responseMessage.user }} :
                            <span>{{ responseMessage.content }}</span>
                        </p>
                        <div class="ui fluid search">
                            <div class="ui icon input">
                                <div v-if="writingResponse">
                                    <i
                                        title="Retour"
                                        class="circular cancel icon"
                                        @click="leaveMessageIsEditing()"></i>
                                    <p>Edition</p>
                                </div>
                                <input
                                    v-on:keyup.enter="sendMessage()"
                                    v-model="inputSentMessage"
                                    class="prompt"
                                    type="text"
                                    placeholder="Rédiger un message" />
                                <i @click="sendMessage()" class="send icon"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="conversation-sidebar" v-if="groupPanel">
                <Group />
            </div>
        </div>
    </div>
</template>

<style scoped src="./Conversation.css" />
