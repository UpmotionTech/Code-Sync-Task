import { useSocket } from "@/context/SocketContext"
import { useAppContext } from "@/context/AppContext"
import { ChatMessage, ChatMessageType } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { formatDate } from "@/utils/formateDate"
import { FormEvent, useRef, useState } from "react"
import { v4 as uuidV4 } from "uuid"
import { LuMegaphone } from "react-icons/lu"

const MAX_BROADCAST_LENGTH = 500

function BroadcastButton() {
    const { socket } = useSocket()
    const { currentUser } = useAppContext()
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState("")
    const [charCount, setCharCount] = useState(0)
    const inputRef = useRef<HTMLTextAreaElement | null>(null)

    const handleOpen = () => {
        setError("")
        setIsOpen(true)
        // Focus the textarea after the modal mounts
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    const handleClose = () => {
        setIsOpen(false)
        setError("")
        setCharCount(0)
        if (inputRef.current) inputRef.current.value = ""
    }

    const handleSend = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const text = inputRef.current?.value.trim() ?? ""

        if (!text) {
            setError("Message cannot be empty.")
            return
        }
        if (text.length > MAX_BROADCAST_LENGTH) {
            setError(`Message exceeds ${MAX_BROADCAST_LENGTH} characters.`)
            return
        }

        const message: ChatMessage = {
            id: uuidV4(),
            message: text,
            username: currentUser.username,
            timestamp: formatDate(new Date().toISOString()),
            type: ChatMessageType.BROADCAST,
        }

        // Server will emit RECEIVE_BROADCAST back to everyone including sender
        socket.emit(SocketEvent.BROADCAST_MESSAGE, { message })
        handleClose()
    }

    return (
        <>
            {/* Broadcast trigger button */}
            <button
                onClick={handleOpen}
                title="Send broadcast message to all users"
                className="flex items-center gap-2 rounded-md border border-yellow-400 bg-yellow-400/10 px-3 py-1.5 text-sm font-medium text-yellow-400 transition-colors hover:bg-yellow-400/20"
            >
                <LuMegaphone size={16} />
                <span>Broadcast</span>
            </button>

            {/* Modal overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={handleClose}
                >
                    {/* Modal panel */}
                    <div
                        className="relative w-full max-w-md rounded-lg bg-dark p-5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-yellow-400">
                            <LuMegaphone size={18} />
                            Broadcast to All Users
                        </h2>
                        <p className="mb-3 text-xs text-gray-400">
                            This message will appear as a system notification in
                            everyone&apos;s chat.
                        </p>

                        <form onSubmit={handleSend} className="flex flex-col gap-3">
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    rows={4}
                                    maxLength={MAX_BROADCAST_LENGTH}
                                    placeholder="Type your broadcast message…"
                                    onChange={(e) => {
                                    setError("")
                                    setCharCount(e.target.value.length)
                                }}
                                    className="w-full resize-none rounded-md border border-primary bg-darkHover p-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
                                />
                                {/* Character counter */}
                                <span className="absolute bottom-2 right-3 text-xs text-gray-500">
                                    {charCount}/{MAX_BROADCAST_LENGTH}
                                </span>
                            </div>

                            {error && (
                                <p className="text-xs text-red-400">{error}</p>
                            )}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-darkHover"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
                                >
                                    <LuMegaphone size={14} />
                                    Send Broadcast
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default BroadcastButton
