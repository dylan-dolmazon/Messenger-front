<script setup lang="ts">
import {computed, ref, toRefs} from 'vue';
import reactions from '@/assets/reactions.json';
import type {Message} from "@/client/types/business";
import {useAuthStore} from "@/stores/auth";

const defProps = defineProps<{
    message: Message,
    icon: string,
    class: string
}>()

const emit = defineEmits([
    'reaction',
    'response',
    'remove',
    'modify',
])

const props = ref(defProps)
const authStore = useAuthStore()
const { user } = toRefs(authStore)

const response = () : void => {
    emit('response')
}
const remove = () : void => {
    emit('remove')
}
const modify = () : void => {
    emit('modify')
}

function getReactData(_key: string) {
    return reactions.find((data) => data.key === _key)
}

const allReactions = computed(() => {
    const map = new Map<string, number>()

    const reacts = props.value.message.reactions
    for (const userID in reacts) {
        const value = map.get(reacts[userID]) ?? 0
        map.set(reacts[userID], value + 1);
    }
    return map
})

const reactMessage = (reaction: string): void => {
    if (
        !user.value ||
        (reaction !== 'HEART' &&
            reaction !== 'THUMB' &&
            reaction !== 'HAPPY' &&
            reaction !== 'SAD')
    )
        return

    emit('reaction', { message: props.value.message, reaction: reaction })
}
</script>

<template>
    <div v-if="user?.username===props.message.from" class="message mine">
        <div class="bubble" :class="props.class">
            <p
                v-if="props.message.reply_to"
                class="reply_content"
                :class="{
					          'message-deleted': props.message.reply_to.deleted,
				           }">
                {{
                    props.message.reply_to.deleted
                        ? 'Message supprimé'
                        : props.message.reply_to.content
                }}
            </p>
            <p :class="{ 'message-deleted': props.message.deleted }">
                {{ props.message.deleted ? 'Message supprimé' : props.message.content }}
            </p>
        </div>
        <div class="reacts">
          <span v-for="react in allReactions" :key="react[0]" class="circular icon">
            {{ react[1] }}
            <i
                :title="getReactData(react[0])?.label"
                :class="getReactData(react[0])?.iconClass"
                class="outline icon"></i>
          </span>
        </div>
        <div class="controls">
            <i
                title="Supprimer"
                class="circular trash icon"
                @click="remove()"></i>
            <i title="Editer" class="circular edit icon" @click="modify()"></i>
            <i
                title="Répondre"
                class="circular reply icon"
                @click="response()"></i>
        </div>
    </div>
    <div v-else class="message">
        <img
            v-if="props.class.includes('bottom') || props.class.includes('top bottom')"
            :src="props.urlIcon"
            :alt="props.message.from" />
        <div class="bubble" :class="props.class">
            <p v-if="props.message.reply_to" class="reply_content">
                {{ props.message.reply_to.content }}
            </p>
            <p :class="{ 'message-deleted': props.message.deleted }">
                {{ props.message.deleted ? 'Message supprimé' : props.message.content }}
            </p>
        </div>
        <div class="reacts">
			<span v-for="react in allReactions" :key="react[0]" class="circular icon">
				{{ react[1] }}
				<i
                    :title="getReactData(react[0])?.label"
                    :class="getReactData(react[0])?.iconClass"
                    class="outline icon"></i>
			</span>
        </div>
        <div class="controls">
            <i
                title="Répondre"
                class="circular reply icon"
                @click="response()"></i>
            <span class="react">
				<i
                    class="circular outline icon"
                    v-for="react of reactions"
                    :key="react.key"
                    :title="react.label"
                    :class="react.iconClass"
                    @click="reactMessage(react.key)"></i>
			</span>
        </div>
    </div>
</template>
<style scoped src="./Message.css" />
