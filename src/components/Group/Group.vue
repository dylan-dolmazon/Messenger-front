<script setup lang="ts">
import {computed, ref, toRefs} from 'vue'
import { useMessengerStore } from '@/stores/messenger'
import {useHighLevelClientEmits} from "@/composables/emits";
const messengerStore = useMessengerStore()

const clientEmits = useHighLevelClientEmits()

const { users, currentConversation } = toRefs(messengerStore)
const search = ref('')

const isSearching = (username: string, searchInput: string): boolean => {
    console.log(currentConversation.value?.id)
    if (search.value.length <= 0) return true
    return username.toLowerCase().includes(searchInput.toLowerCase())
}

const participants = computed(() =>
   users.value.filter(
        (user) =>
            currentConversation.value?.participants.includes(user.username) &&  computed(() => isSearching(user.username, search.value)).value
    )
)
const nonParticipants = computed(() =>
    users.value.filter(
        (user) =>
            !currentConversation.value?.participants.includes(user.username) &&
            computed(() => isSearching(user.username, search.value)).value
    )
)

async function removeParticipant(username: string): Promise<void> {
    const conv = currentConversation.value
    if (!conv) return
    if (conv.participants.length <= 3) return

    const id = conv.id
    console.log('conv', conv, 'username', username, 'id', id)
    clientEmits.removeParticipant(username, id)
}

async function addParticipant(username: string): Promise<void> {
    const id = currentConversation.value?.id
    if (!id) return

    clientEmits.addParticipant(username, id)
}

</script>

<template>
    <div class="group">
        <div class="ui fluid search">
            <div class="ui icon input">
                <input
                    type="text"
                    placeholder="Rechercher un utilisateur"
                    class="prompt"
                    v-model="search"
                />
                <i class="search icon"></i>
            </div>
        </div>
    </div>
    <div class="spanner">
            <hr />
            <span>Participants</span>
            <hr />
        </div>


        <div class="user" v-for="participant of participants" :key="participant.username">
            <img :src="participant.picture_url" :alt="`photo de ${participant.username}`">
            <span>
                {{participant.username}}
                <br />
                <i class="nickname"></i>
            </span>
            <i
                title="Modifier le surnom"
                class="circular quote left link icon"
            ></i>
            <i
                @click="removeParticipant(participant.username)"
                title="Enlever de la conversation"
                class="circular times icon link"
                style=""></i>
        </div>

        <div class="spanner">
            <hr />
            <span>Communauté</span>
            <hr />
        </div>

        <div class="user" v-for="participant of nonParticipants" :key="participant.username">
            <img :src="participant.picture_url" :alt="`photo de ${participant.username}`">
            <span>
                {{participant.username}}

            </span>
            <i
                @click="addParticipant(participant.username)"
                title="Ajouter à la conversation"
                class="circular plus icon link"></i>
        </div>
</template>

<style scoped src="./Group.css" />
