import { useState } from "react"
import { Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { initials } from "../../lib/utils"

const NAV_ITEMS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#local", label: "Local" },
  { href: "#horario", label: "Horário" },
  { href: "#ingressos", label: "Ingressos" },
  { href: "#reembolso", label: "Reembolso" },
  { href: "#inscricao", label: "Inscrição" },
]

export default function EventHeader({ event, onSubscribe }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        <Avatar size="lg" className="shrink-0">
          <AvatarImage
            src={
              "https://s3.wasabisys.com/files.e-inscricao.tech/uploads/organization/logo/28143/thumb_Logo_HCH_512x512_1.png"
            }
            alt="Logo"
          />
          <AvatarFallback>{initials("Homens com Honra")}</AvatarFallback>
        </Avatar>

        {/* <span className="text-sm md:text-sm">
          Homens com Honra
        </span> */}

        {/* Navegação central (desktop) */}
        <NavigationMenu className="hidden flex-1 md:flex">
          <NavigationMenuList>
            {NAV_ITEMS.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink href={item.href}>
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Button size="sm" className="h-9 px-4" onClick={onSubscribe}>
            Me Inscrever
          </Button>

          {/* Menu (mobile) */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 md:hidden"
                  aria-label="Abrir menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="pr-8 break-words">
                  Homens Com Honra
                </SheetTitle>
                <SheetDescription>
                  Navegue pela página do evento
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col px-4">
                {NAV_ITEMS.map((item) => (
                  <SheetClose
                    key={item.href}
                    nativeButton={false}
                    render={
                      <a
                        href={item.href}
                        className="flex h-12 items-center border-b px-2 text-sm font-medium hover:bg-muted"
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
