import { ChatContext as ChatContextType, ChatMessage, ChatMessageType } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { VIEWS } from "@/types/view"
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"
import { toast } from "react-hot-toast"
import { useSocket } from "./SocketContext"
import { useViews } from "./ViewContext"

const ChatContext = createContext<ChatContextType | null>(null)

export const useChatRoom = (): ChatContextType => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error("useChatRoom must be used within a ChatContextProvider")
    }
    return context
}

function ChatContextProvider({ children }: { children: ReactNode }) {
    const { socket } = useSocket()
    const { activeView, isSidebarOpen } = useViews()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isNewMessage, setIsNewMessage] = useState<boolean>(false)
    const [lastScrollHeight, setLastScrollHeight] = useState<number>(0)

    useEffect(() => {
        socket.on(
            SocketEvent.RECEIVE_MESSAGE,
            ({ message }: { message: ChatMessage }) => {
                setMessages((messages) => [...messages, message])
                setIsNewMessage(true)
            },
        )

        socket.on(
            SocketEvent.RECEIVE_BROADCAST,
            ({ message }: { message: ChatMessage }) => {
                const broadcastMsg: ChatMessage = {
                    ...message,
                    type: ChatMessageType.BROADCAST,
                }
                setMessages((messages) => [...messages, broadcastMsg])
                setIsNewMessage(true)

                // Show toast when the chat panel is not currently visible
                if (activeView !== VIEWS.CHATS || !isSidebarOpen) {
                    toast(`${message.username}: ${message.message}`, {
                        duration: 5000,
                        style: {
                            background: "#1a1a2e",
                            color: "#facc15",
                            border: "1px solid #facc15",
                            fontWeight: "600",
                        },
                        icon: "📢",
                    })
                }
            },
        )

        return () => {
            socket.off(SocketEvent.RECEIVE_MESSAGE)
            socket.off(SocketEvent.RECEIVE_BROADCAST)
        }
    }, [socket, activeView, isSidebarOpen])

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
                isNewMessage,
                setIsNewMessage,
                lastScrollHeight,
                setLastScrollHeight,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export { ChatContextProvider }
export default ChatContext
