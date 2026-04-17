import ChatInput from "@/components/chats/ChatInput"
import ChatList from "@/components/chats/ChatList"
import BroadcastButton from "@/components/chats/BroadcastButton"
import { useAppContext } from "@/context/AppContext"
import useResponsive from "@/hooks/useResponsive"

const ChatsView = () => {
    const { viewHeight } = useResponsive()
    const { currentUser } = useAppContext()

    return (
        <div
            className="flex max-h-full min-h-[400px] w-full flex-col gap-2 p-4"
            style={{ height: viewHeight }}
        >
            <div className="flex items-center justify-between">
                <h1 className="view-title">Group Chat</h1>
                {/* Broadcast button — visible to admin only */}
                {currentUser.isAdmin && <BroadcastButton />}
            </div>
            {/* Chat list */}
            <ChatList />
            {/* Chat input */}
            <ChatInput />
        </div>
    )
}

export default ChatsView
