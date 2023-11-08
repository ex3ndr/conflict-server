export type Message = {
    sender: 'incoming' | 'outgoing' | 'system',
    date: number,
    private?: boolean,
    body: {
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