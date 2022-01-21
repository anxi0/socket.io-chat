export interface joinData {
  room: string;
  user: string;
}
export interface chatData {
  user: string;
  chat: string;
  timestamp: string;
}
export interface noChatData {
  type: "manual" | "time";
  payload: boolean | number;
}
export interface freezeData {
  freeze: boolean;
}
