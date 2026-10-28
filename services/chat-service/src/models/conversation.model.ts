import { model, Schema } from "mongoose";
import { IConversation } from "../interfaces/conversation.interface";

const conversationSchema = new Schema<IConversation>({
    _id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: false,
    },
    participant_ids: {
        type: [String],
        required: true,
    },
    last_message_at: {
        type: Date,
        required: false,
    },
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: {
        transform: (_, ret: any) => {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        },
    },
})

const ConversationModel = model<IConversation>('Conversation', conversationSchema);
export default ConversationModel;

