import { useEffect, useState } from "react"
import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import EventHeader from "../../components/event/EventHeader"
import EventBanner from "../../components/event/EventBanner"

export default function EventDetail({ api, eventId, onSubscribe }) {
  const [event, setEvent] = useState(null)
  const [status, setStatus] = useState("loading") // loading | ready | error

  useEffect(() => {
    let active = true
    api(`/events/${eventId}`, { token: null })
      .then((data) => {
        if (!active) return
        setEvent(data)
        setStatus("ready")
      })
      .catch(() => {
        if (active) setStatus("error")
      })
    return () => {
      active = false
    }
  }, [api, eventId])

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md">
          <Card className="p-2 [--card-spacing:--spacing(0)]">
          <CardTitle className="p-2">
            Evento não encontrado
            </CardTitle>
             <CardContent className="p-2">
            Não foi possível carregar este evento. Verifique o link que você
            recebeu e tente novamente.
             </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status === "loading" || !event) {
    return (
      <div className="min-h-screen bg-background" aria-busy="true">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 border-b px-4">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="ml-auto h-9 w-28" />
        </div>
        <div className="mx-auto w-full max-w-3xl md:px-4 md:pt-6">
          <Skeleton className="aspect-video w-full rounded-none" />
          <Skeleton className="mx-4 mt-4 h-64 rounded-none md:mx-0" />
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="relative">
          <EventHeader event={event} onSubscribe={onSubscribe} />
          <EventBanner event={event} onSubscribe={onSubscribe} />
        </div>
      </div>
    );
}
