import io, { Socket } from 'socket.io-client'
import type { Auth } from '@/client/types/business'
import type { AuthenticateEmit, Emit } from '@/client/types/emits'
import type { Event } from '@/client/types/events'

export default class Client {
    private title: string
    private socket: Socket
    private callbacks: Record<string, (payload: unknown) => void>
    private waitingForAuth: ((payload: Auth) => void)[]
    private auth: null | Auth
    private endpoint: string

    constructor(
        endpoint: string = 'ws://slash-mountainous-possum.glitch.me',
        title: string = 'user'
    ) {
        this.title = title

        this.auth = null
        this.waitingForAuth = []

        this.callbacks = {}

        this.endpoint = endpoint

        this.socket = io(endpoint)

        this.applyCallbacks()
    }

    applyCallbacks() {
        if (!this.socket) return

        this.socket.removeAllListeners('connect')
        this.socket.on('connect', async () => {
            console.log('socket@connect', this.socket.id)
        })

        for (const eventName of Object.keys(this.callbacks)) {
            this.socket.removeAllListeners(eventName)
            this.socket.on(
                eventName,
                async (data: unknown, ack: () => void) => {
                    console.log(this.title, 'on', '@' + eventName, data)
                    this.callbacks[eventName](data)
                    if (ack) {
                        ack()
                    }
                }
            )
        }
    }

    reinitializeConnection() {
        this.socket = io(this.endpoint)
        this.applyCallbacks()
    }

    setEndpoint(endpoint: string) {
        if (this.endpoint === endpoint) {
            return
        }
        this.endpoint = endpoint
        this.reinitializeConnection()
    }

    on<E extends Event>(
        eventName: E['event'],
        callback: (payload: E['payload']) => void
    ) {
        this.callbacks[eventName] = callback
        this.applyCallbacks()
    }

    requireAuth(): Promise<Auth> {
        if (this.auth) {
            return Promise.resolve(this.auth)
        } else {
            return new Promise((resolve) => {
                this.waitingForAuth.push(resolve)
            })
        }
    }

    async emit<E extends Emit>(
        eventName: E['event'],
        payload: E['payload'],
        requireAuth: E['authenticated'] = true
    ): Promise<E['response']> {
        let token: string

        if (requireAuth) {
            token = (await this.requireAuth()).token
        }

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (requireAuth) {
                    payload = { token, ...payload }
                }

                console.log(this.title, 'emit', eventName, payload)

                this.socket.emit(
                    eventName,
                    payload,
                    (response: { code: string; data: E['response'] }) => {
                        console.log(this.title, 'ack', eventName, response)

                        if (response.code === 'SUCCESS') {
                            resolve(response.data)
                        } else {
                            reject(response.code)
                        }
                    }
                )
            }, 0)
        })
    }

    authenticate(username: string, password: string): Promise<Auth> {
        return new Promise((resolve, reject) => {
            this.emit<AuthenticateEmit>(
                '@authenticate',
                {
                    username,
                    password,
                },
                false
            )
                .then((auth) => {
                    this.auth = auth
                    resolve(this.auth)
                    for (const resolve of this.waitingForAuth) {
                        resolve(this.auth)
                    }
                })
                .catch((e) => {
                    reject(e)
                })
        })
    }
}
