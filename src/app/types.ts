export type Message = {
    sender: 'incoming' | 'outgoing' | 'system',
    date: number,
    message: {
        kind: 'text',
        value: string
    }
}

export type Update = {
    update: 'new',
    mid: number,
    message: Message
} | {
    update: 'change',
    mid: number,
    message: Message
}