import { createRouter, createWebHistory } from 'vue-router'
import Community from '@/components/Community/Community.vue'
import Conversation from '@/components/Conversation/Conversation.vue'
import InfoGroup from '@/components/InfoGroup/InfoGroup.vue'
import Search from '@/components/Search/Search.vue'
import Group from '@/components/Group/Group.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Community',
            component: Community,
        },
        {
            path: '/conversation/:id',
            name: 'Conversation',
            component: Conversation,
        },
        {
            path: '/search',
            name: 'Search',
            component: Search,
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'Community',
            component: Community,
        },
        {
            path: '/Info-group',
            name: 'Info-group',
            component: InfoGroup,
        },
        {
            path: '/group/:id',
            name: 'Group',
            component: Group,
        },
    ],
})

export default router
