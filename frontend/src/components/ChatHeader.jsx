import { X, Trash2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const handleClearChat = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear the chat?"
    );
    if (!confirmClear) return;

    try {
      await axiosInstance.delete(`/messages/clear/${selectedUser._id}`);
      clearMessages(); // ✅ instead of setMessages([])
      toast.success("Chat cleared successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear chat!");
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            {!selectedUser.isBot && (
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={handleClearChat} className="btn btn-ghost btn-sm">
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-sm"
          >
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
