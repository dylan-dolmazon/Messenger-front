<script setup lang="ts">
import {computed, ref, toRefs} from "vue";
import type {User} from '@/client/types/business';
import { useHighLevelClientEmits } from '@/composables/emits'
import { useMessengerStore } from '@/stores/messenger'

const messengerStore = useMessengerStore()

const clientEmits = useHighLevelClientEmits()

const { users, authenticatedUsername } = toRefs(messengerStore)

const openConv = ref(false)

async function openConversation() {
    if(userSelected.value.length===0)return

    openConv.value=true;

    if(userSelected.value.length===1){
        await clientEmits.createOneToOneConversation(userSelected.value[0].username)
        console.log('Conversation ouverte !')
    }else{
        let usersNames = new Array<string>;
        userSelected.value.forEach(element => {
            if(element.username!=authenticatedUsername.value)usersNames.push(element.username)
        });
        await clientEmits.createManyToManyConversation(usersNames)
        console.log('Conversation ouverte !')
    }


}


function nbUsersAwake() {
    return userSelected.value.length;
}
const inputFilter = ref("");

const filterUser = computed( ()=> {
     return users.value.filter((user)=> {
        return user.username.toLowerCase().includes(inputFilter.value.toLowerCase())
    })
})

const userSelected = ref<User[]>([]);

function checkSelected(user: User) {
    return userSelected.value.includes(user);
}


function toggleUser(user: User): void {
    if (user.username === authenticatedUsername.value) return
    if (checkSelected(user)) {
        userSelected.value.splice(userSelected.value.indexOf(user), 1)
    } else {
        userSelected.value.push(user)
    }
}

</script>

<template>
    <div class="community">
        <div class="filter">
            <div class="ui fluid search">
                <div class="ui icon input">
                    <input
                        class="prompt"
                        type="text"
                        placeholder="Rechercher un utilisateur"
                        v-model="inputFilter"
                    />
                    <i class="search icon"></i>
                </div>
                <div class="results"></div>
            </div>
        </div>
        <div class="users">
            <div v-for="user in filterUser" :key="user.username" class="user" :class="{ selected: checkSelected(user)}" @click="toggleUser(user)"> <!-- affichage des users -->
                <img :src="user.picture_url" />
                <span class="">{{user.username}}</span>
            </div>
        </div>
        <div class="actions">
            <button class="ui primary big button" @click="openConversation">
                <i class="conversation icon"></i>
                <span>
                    {{
						openConv
							? `Ouverture de la conversation...`
							: `Ouvrir la conversation (${nbUsersAwake()})`
					}}
                </span>
            </button>
        </div>
    </div>
</template>

<style scoped src="./Community.css" />
