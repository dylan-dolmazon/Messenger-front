
# Models

## Username

```
String
```

## User

```
{
    username: Username,         // 'Alice'
    picture_url: String,        // 'https://source.unsplash.com/q65bNe9fW-w/100x100'
    awake: Boolean              // true // Indique si l'utilisateur est connecté (en vert)
}
```

## Conversation

```
{
    id: String,                                                             // '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    type: Enum<'one_to_one', 'many_to_many'>,
    participants: Array<every Username>,                                    // [ 'Alice', 'Bob' ],
    messages: Array<Message>,
    title: null | String,                                                   // 'Conversation title'
    theme: Enum<'BLUE', 'RED', 'RAINBOW'>,
    nicknames: { some Username : String},                                   // {'Alice': 'Alicounette'}
    updated_at: String,                                                     // '2021-12-16T07:49:02.492Z'
    seen: { every Username: { message_id: String, time: -1 | String } },    // {'Alice': { message_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', time: '2021-12-13T07:41:46.720Z' }, 'Bob': { message_id: 0, time: -1 } }
    typing: { some Username: String }                                       // {'Alice': '2021-12-13T07:41:46.720Z' },
}
```

## Message

```
{
    id: String,                                                             // '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    from: Username,                                                         // 'Bob'
    content: String | null,                                                 // 'Hello world'
    posted_at: String,                                                      // '2021-12-13T07:41:46.720Z'
    delivered_to: { some Username: String },                                // { 'Alice': '2021-12-13T07:41:46.834Z' }
    reply_to: String | null,                                                // { id : '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', content: 'Bla bla', ... }
    edited: Boolean,                                                        // true
    deleted: Boolean,                                                       // false
    reactions: { some Username: Enum<'HEART', 'THUMB', 'HAPPY', 'SAD'> }
}
```

# Emits

## Promise<{users : Array<User>}> : getUsers()

    - NOT_AUTHENTICATED

## Promise<{conversation : Conversation}> : getOrCreateOneToOneConversation(username : String)

    - NOT_AUTHENTICATED
    - NOT_FOUND_USER

## Promise<{conversation : Conversation}> : createManyToManyConversation(usernames : Array<String>)

    - NOT_AUTHENTICATED
    - NOT_VALID_USERNAMES
    - NOT_FOUND_USER

## Promise<{message : Message}> : postMessage(conversation_id : Number, content : String)

    - NOT_AUTHENTICATED
    - NOT_VALID_CONTENT
    - NOT_FOUND_CONVERSATION

## Promise<{}> : seeConversation(conversation_id : Number, message_id : Number)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION
    - NOT_FOUND_MESSAGE

## Promise<{}> : reactMessage(conversation_id : Number, message_id : Number, reaction : Enum<HEART, THUMB, HAPPY, SAD>)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION
    - NOT_FOUND_MESSAGE

## Promise<{message: Message}> : replyMessage(conversation_id : Number, message_id : Number, content : String)

    - NOT_AUTHENTICATED
    - NOT_VALID_CONTENT
    - NOT_FOUND_CONVERSATION
    - NOT_FOUND_MESSAGE

## Promise<{conversations: Array<Conversation>}> : getConversations()

    - NOT_AUTHENTICATED

## Promise<{conversations: Array<matching Conversation>}> : searchMessage(search : String)

    - NOT_AUTHENTICATED

## Promise<{}> : editMessage(conversation_id : Number, message_id : Number, content : String)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION
    - NOT_FOUND_MESSAGE

## Promise<{}> : deleteMessage(conversation_id : Number, message_id : Number)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION
    - NOT_FOUND_MESSAGE

## Promise<{conversation: Conversation}> : addParticipant(conversation_id : Number, username : String)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION
    - NOT_VALID_USER

## Promise<{conversation: Conversation}> : removeParticipant(conversation_id : Number, username : String)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION
    - NOT_VALID_USER


## Promise<{conversation: Conversation}> : typeConversation(conversation_id : Number)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION


## Promise<{conversation: Conversation}> : setConversationTheme(conversation_id : Number, theme : Enum<BLUE, RED, RAINBOW>)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION
    - NOT_FOUND_THEME

## Promise<{conversation: Conversation}> : setConversationTitle(conversation_id : Number, title : String)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION

## Promise<{conversation: Conversation}> : setParticipantNickname(conversation_id : Number, participant : String, nickname: String)

    - NOT_AUTHENTICATED
    - NOT_FOUND_CONVERSATION
    - NOT_FOUND_PARTICIPANT

# Events

## client.on("@userCreated", ({ user: User }) => {})


## client.on("@conversationCreated", ({ conversation: Conversation }) => {})


## client.on("@participantAdded", ({ conversation: Conversation }) => {})


## client.on("@participantRemoved", ({ conversation: Conversation }) => {})


## client.on("@messagePosted", ({ conversation_id: Number, message: Message }) => {})


## client.on("@messageDelivered", ({ conversation_id: Number, message: Message }) => {})


## client.on("@conversationSeen", ({ conversation: Conversation }) => {})


## client.on("@messageReacted", ({ conversation_id: Number, message: Message }) => {})


## client.on("@messageEdited", ({ conversation_id: Number, message: Message }) => {})


## client.on("@messageDeleted", ({ conversation_id: Number, message_id: Number }) => {})


## client.on("@usersAvailable", ({ usernames: Array<String> }) => {})


## client.on("@conversationTyped", ({ conversation_id: Number, username: String, date: String }) => {})


## client.on("@conversationThemeSet", ({ conversation_id: Number, theme: String }) => {})


## client.on("@conversationTitleSet", ({ conversation_id: Number, title: String }) => {})


## client.on("@participantNicknameSet", ({ conversation_id: Number, participant: String, nickname: String }) => {})
