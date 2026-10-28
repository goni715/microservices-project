
export interface IConversation {
    _id: string;
    title: string | null;
    participant_ids: string[];
    last_message_at: Date | null;
    last_message_preview: string | null;
    created_at: Date;
    updated_at: Date;
}