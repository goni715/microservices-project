export const AUTH_EVENT_EXCHANGE = 'auth.events';
export const AUTH_USER_REGISTERED_ROUTING_KEY = 'auth.user.registered';

export const USER_SERVICE_AUTH_EVENTS_QUEUE = 'chatapp.user-service.auth-events';

export interface UserRegisteredPayload {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
}

