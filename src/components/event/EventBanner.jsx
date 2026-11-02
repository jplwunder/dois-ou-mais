import { Clock, Info, MapPin, Ticket, Undo2, Users } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDateTime } from "../../lib/utils"

function priceLabel(price) {
  if (price === null || price === undefined) return null
  const value = Number(price)
  if (Number.isNaN(value)) return null
  if (value === 0) return "Gratuito"
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function EventBanner({ event, onSubscribe }) {
  return (
    <div>
      <AspectRatio ratio={16 / 9} className="w-full overflow-hidden bg-muted">
        <img
          src={
            "https://wasabi.e-inscricao.com/uploads/hotsite/v2/cover/1775196869_3ee3a803-2ab1-4ddc-93b8-f10815f8303c.jpeg"
          }
          className="size-full object-cover"
        />
      </AspectRatio>
      <Card className="p-1 mx-2 my-4">
        <CardHeader className="flex items-center justify-center pt-4">
          <CardTitle className="text-2xl text-center text-balance md:text-4xl">13º Encontro Homens com Honra de Jundiaí</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-4">
          <div id="sobre" className="flex scroll-mt-20 items-center gap-2 text-xl">
            <Info className="size-5 shrink-0 text-muted-foreground" />
            Sobre
          </div>
          <div className="text-justify hyphens-auto text-muted-foreground">
            Somos um grupo de homens cristãos, comprometidos em resgatar homens.
            Nosso propósito é que cada homem assuma suas responsabilidades.
            Entre elas, seu caminhar com Deus, suas atitudes como marido e como pai.
            Não somos ligados a nenhuma denominação específica, somos cristãos de várias igrejas e localidades diferentes.
          </div>
          <div id="local" className="flex scroll-mt-20 items-center gap-2 text-xl">
            <MapPin className="size-5 shrink-0 text-muted-foreground" />
            Local
          </div>
          <div className="text-justify hyphens-auto text-muted-foreground">
            Parque Comendador Antônio Carbonari - Parque da Uva - Jundiaí/SP
          </div>
          <div id="horario" className="flex scroll-mt-20 items-center gap-2 text-xl">
            <Clock className="size-5 shrink-0 text-muted-foreground" />
            Horário
          </div>
          <div className="text-justify hyphens-auto text-muted-foreground">
            8h00 - 18h00
          </div>
          <div id="ingressos" className="flex scroll-mt-20 items-center gap-2 text-xl">
            <Ticket className="size-5 shrink-0 text-muted-foreground" />
            Ingressos
          </div>
          <div className="text-justify hyphens-auto text-muted-foreground">
            1o lote - R$ 150,00 (até 27/05) <br />
            2o lote - R$ 170,00 <br />
            <br />
            Especial Pai e Filho - R$ 250,00 <br />
            <br />
            Incluso Café, Almoço e Estacionamento <br />
            Idade Permitida: a partir de 12 anos
          </div>
          <div className="flex items-center gap-2 text-xl">
            <Users className="size-5 shrink-0 text-muted-foreground" />
            Vagas Limitadas
          </div>
          <div className="text-justify hyphens-auto text-muted-foreground">
            Não teremos inscrição no local.
          </div>
          <div id="reembolso" className="flex scroll-mt-20 items-center gap-2 text-xl">
            <Undo2 className="size-5 shrink-0 text-muted-foreground" />
            Política de Cancelamento/Reembolso
          </div>
          <div className="text-justify hyphens-auto text-muted-foreground">
            As inscrições poderão ser canceladas no prazo de 7 dias a contar da data de sua compra, conforme está estipulado no código de defesa do consumidor. Neste caso, o valor do ingresso será reembolsado integralmente. <br />
            <br />
            Para cancelamentos solicitados após 7 dias da data da compra, o valor reembolsado será de 80% do valor pago, podendo ser reembolsado em até 10 dias após a realização do evento. <br />
            <br />
            Pedidos de reembolso serão aceitos somente até 8 dias antes da data da realização do evento.<br />
            <br />
            O não comparecimento ao evento não dá direito ao reembolso da inscrição.<br />
          </div>
          <div className="hyphens-auto text-muted-foreground">
            A solicitação de reembolso deve ser enviada ao e-mail inscricao@homenscomhonra.com.br
          </div>
        </CardContent>

        <CardFooter id="inscricao" className="scroll-mt-20">
          <Button className="h-11 w-full text-sm mb-2" onClick={onSubscribe}>
            Me Inscrever
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
