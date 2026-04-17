import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { ChatMessageType } from "@/types/chat"
import { SyntheticEvent, useEffect, useRef } from "react"
import { LuMegaphone } from "react-icons/lu"

function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
    } = useChatRoom()
    const { currentUser } = useAppContext()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)

    const handleScroll = (e: SyntheticEvent) => {
        const container = e.target as HTMLDivElement
        setLastScrollHeight(container.scrollTop)
    }

    useEffect(() => {
        if (!messagesContainerRef.current) return
        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false)
        }
        if (messagesContainerRef.current)
            messagesContainerRef.current.scrollTop = lastScrollHeight
    }, [isNewMessage, setIsNewMessage, lastScrollHeight])

    return (
        <div
            className="flex-grow overflow-auto rounded-md bg-darkHover p-2"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {messages.map((message, index) => {
                if (message.type === ChatMessageType.BROADCAST) {
                    // Full-width system notification style for broadcast messages
                    return (
                        <div
                            key={index}
                            className="mb-3 w-full rounded-md border border-yellow-400/40 bg-yellow-400/10 px-3 py-2"
                        >
                            <div className="mb-1 flex items-center justify-between">
                                <span className="flex items-center gap-1 text-xs font-semibold text-yellow-400">
                                    <LuMegaphone size={12} />
                                    Broadcast · {message.username}
                                </span>
                                <span className="text-xs text-yellow-400/70">
                                    {message.timestamp}
                                </span>
                            </div>
                            <p className="font-medium text-yellow-100">
                                {message.message}
                            </p>
                        </div>
                    )
                }

                // Normal chat message
                return (
                    <div
                        key={index}
                        className={
                            "mb-2 w-[80%] self-end break-words rounded-md bg-dark px-3 py-2" +
                            (message.username === currentUser.username
                                ? " ml-auto "
                                : "")
                        }
                    >
                        <div className="flex justify-between">
                            <span className="text-xs text-primary">
                                {message.username}
                            </span>
                            <span className="text-xs text-white">
                                {message.timestamp}
                            </span>
                        </div>
                        <p className="py-1">{message.message}</p>
                    </div>
                )
            })}
        </div>
    )
}

export default ChatList
