"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/src/components/ui/button"


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button variant="link" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {
        theme === "dark" ?
          <Sun className="h-[1.2rem] w-[1.2rem]" />
          :
          <Moon className="h-[1.2rem] w-[1.2rem]" />
      }
    </Button>
  )
}
