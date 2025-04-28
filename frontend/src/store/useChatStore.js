import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { getAIReply } from "../services/aiServices";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  unreadCounts: {},
  clearMessages: () => set({ messages: [] }),
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,

  markMessagesAsRead: (userId) => {
    const unreadCounts = get().unreadCounts;
    set({
      unreadCounts: {
        ...unreadCounts,
        [userId]: 0,
      },
    });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;

    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const isChatbot = selectedUser?.isBot;

      if (isChatbot) {
        // 1. Save user's message
        const userMessageRes = await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          {
            text: messageData.text,
            image: messageData.image,
          }
        );

        set({ messages: [...messages, userMessageRes.data] });

        // 2. Show Typing Animation
        set({ isTyping: true });

        // 3. Get AI Reply
        const aiReplyText = await getAIReply(messageData.text);

        // 4. Save AI's reply
        const aiMessageRes = await axiosInstance.post(
          `/messages/send/${authUser._id}`,
          {
            text: aiReplyText,
            image: null,
            senderId: selectedUser._id,
            receiverId: authUser._id,
          }
        );

        set({
          isTyping: false,
        });
      } else {
        // Normal user-to-user message
        const res = await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          messageData
        );
        set({ messages: [...messages, res.data] });
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    socket.off("newMessage"); // 🛑 very important to avoid duplicate listeners
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, unreadCounts } = get();

      const isChattingWithSender = selectedUser?._id === newMessage.senderId;
      const isMessageToAuthUser = newMessage.receiverId === authUser._id;

      if (isMessageToAuthUser) {
        if (isChattingWithSender) {
          // If already chatting with the sender, just add the message normally
          set({ messages: [...messages, newMessage] });
        } else {
          // Otherwise, update the unread counter for that sender
          set({
            unreadCounts: {
              ...unreadCounts,
              [newMessage.senderId]:
                (unreadCounts[newMessage.senderId] || 0) + 1,
            },
          });
        }
      }
    });
  },

  clearChat: async () => {
    const { selectedUser } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      await axiosInstance.delete(`/messages/clear/${selectedUser._id}`);
      set({ messages: [] });
      toast.success("Chat cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing chat:", error);
      toast.error(error.response?.data?.message || "Failed to clear chat");
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
    get().markMessagesAsRead(user._id);
  },
}));
