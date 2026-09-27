export const CONVERSATION_TYPES=["dossier","dossier_step","access_request","intervention"] as const;
export type ConversationType=typeof CONVERSATION_TYPES[number];
export const MESSAGE_TYPES=["text","audio","document","system"] as const;
export type MessageType=typeof MESSAGE_TYPES[number];
export type MessageSyncState="local"|"pending"|"sent"|"failed";
export interface ConversationContext{type:ConversationType;dossierId:string;stepId?:string|null;accessRequestId?:string|null;interventionId?:string|null}
export function hasValidContext(c:ConversationContext){
 const refs=[c.stepId,c.accessRequestId,c.interventionId].filter(Boolean).length;
 return c.type==="dossier"?refs===0:c.type==="dossier_step"?Boolean(c.stepId)&&refs===1:c.type==="access_request"?Boolean(c.accessRequestId)&&refs===1:Boolean(c.interventionId)&&refs===1;
}
export function validateText(value:string){const text=value.trim();return text.length>=1&&text.length<=4000;}
export function audioStoragePath(conversationId:string,clientMessageId:string){return `conversations/${conversationId}/${clientMessageId}`;}
export function newClientMessageId(){return crypto.randomUUID();}
export function pageBefore<T extends {created_at:string}>(items:T[],before?:string){return before?items.filter(item=>item.created_at<before):items;}
