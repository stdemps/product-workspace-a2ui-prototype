"use client"

import * as React from "react"
import { createComponentImplementation } from "@a2ui/react/v0_9"
import {
  TextApi,
  RowApi,
  ColumnApi,
  ListApi,
  CardApi,
  DividerApi,
  ButtonApi,
  TextFieldApi,
  CheckBoxApi,
  TabsApi,
} from "@a2ui/web_core/v0_9/basic_catalog"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { ChildList } from "@/lib/a2ui/catalog/child-list"
import { mapAlign, mapFlexWeight, mapJustify } from "@/lib/a2ui/catalog/flex-utils"

const textVariantClass: Record<string, string> = {
  h1: "text-2xl font-bold tracking-tight md:text-3xl",
  h2: "text-xl font-semibold tracking-tight md:text-2xl",
  h3: "text-lg font-semibold md:text-xl",
  h4: "text-base font-semibold md:text-lg",
  h5: "text-sm font-semibold md:text-base",
  caption: "text-xs text-muted-foreground md:text-sm",
  body: "text-sm md:text-base",
}

export const ShadcnText = createComponentImplementation(TextApi, ({ props }) => {
  const text = typeof props.text === "string" ? props.text : String(props.text ?? "")
  const variant = props.variant ?? "body"
  const className = cn(textVariantClass[variant] ?? textVariantClass.body, "leading-relaxed")

  if (variant === "caption") {
    return <span className={className}>{text}</span>
  }

  if (variant.startsWith("h")) {
    const Tag = variant as "h1" | "h2" | "h3" | "h4" | "h5"
    return <Tag className={className}>{text}</Tag>
  }

  return <p className={className}>{text}</p>
})

export const ShadcnRow = createComponentImplementation(RowApi, ({ props, buildChild }) => (
  <div
    className={cn("flex flex-row gap-3 md:gap-4", mapJustify(props.justify), mapAlign(props.align))}
    style={mapFlexWeight(props.weight)}
  >
    <ChildList childList={props.children} buildChild={buildChild} />
  </div>
))

export const ShadcnColumn = createComponentImplementation(ColumnApi, ({ props, buildChild }) => (
  <div
    className={cn("flex flex-col gap-3 md:gap-4", mapJustify(props.justify), mapAlign(props.align))}
    style={mapFlexWeight(props.weight)}
  >
    <ChildList childList={props.children} buildChild={buildChild} />
  </div>
))

export const ShadcnList = createComponentImplementation(ListApi, ({ props, buildChild }) => {
  const isHorizontal = props.direction === "horizontal"

  return (
    <div
      className={cn(
        "flex gap-3 md:gap-4",
        isHorizontal ? "flex-row overflow-x-auto" : "flex-col",
        mapAlign(props.align)
      )}
    >
      <ChildList childList={props.children} buildChild={buildChild} />
    </div>
  )
})

export const ShadcnCard = createComponentImplementation(CardApi, ({ props, buildChild }) => (
  <Card className="w-full" style={mapFlexWeight(props.weight)}>
    <CardContent className="p-4 md:p-5">{props.child ? buildChild(props.child) : null}</CardContent>
  </Card>
))

export const ShadcnDivider = createComponentImplementation(DividerApi, ({ props }) => (
  <Separator
    orientation={props.axis === "vertical" ? "vertical" : "horizontal"}
    className="my-2 md:my-3"
  />
))

export const ShadcnButton = createComponentImplementation(ButtonApi, ({ props, buildChild }) => {
  const variant =
    props.variant === "primary"
      ? "default"
      : props.variant === "borderless"
        ? "ghost"
        : "secondary"

  return (
    <Button
      type="button"
      variant={variant}
      className="h-11 min-h-11"
      onClick={props.action}
      disabled={props.isValid === false}
    >
      {props.child ? buildChild(props.child) : null}
    </Button>
  )
})

export const ShadcnTextField = createComponentImplementation(TextFieldApi, ({ props }) => {
  const fieldId = React.useId()
  const isLong = props.variant === "longText"
  const inputType =
    props.variant === "number" ? "number" : props.variant === "obscured" ? "password" : "text"
  const hasError = Boolean(props.validationErrors?.length)
  const label = typeof props.label === "string" ? props.label : String(props.label ?? "")

  return (
    <div className="space-y-2">
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      {isLong ? (
        <Textarea
          id={fieldId}
          value={props.value ?? ""}
          onChange={(event) => props.setValue(event.target.value)}
          aria-invalid={hasError}
          className="min-h-[96px] text-base"
        />
      ) : (
        <Input
          id={fieldId}
          type={inputType}
          value={props.value ?? ""}
          onChange={(event) => props.setValue(event.target.value)}
          aria-invalid={hasError}
          className="h-11 text-base"
        />
      )}
      {hasError ? (
        <p className="text-sm text-destructive" role="alert">
          {props.validationErrors?.[0]}
        </p>
      ) : null}
    </div>
  )
})

export const ShadcnCheckBox = createComponentImplementation(CheckBoxApi, ({ props }) => {
  const fieldId = React.useId()
  const hasError = Boolean(props.validationErrors?.length)
  const label = typeof props.label === "string" ? props.label : String(props.label ?? "")

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Checkbox
          id={fieldId}
          checked={Boolean(props.value)}
          onCheckedChange={(checked) => props.setValue(checked === true)}
          aria-invalid={hasError}
          className="h-5 w-5"
        />
        {label ? (
          <Label htmlFor={fieldId} className="text-sm font-normal md:text-base">
            {label}
          </Label>
        ) : null}
      </div>
      {hasError ? (
        <p className="text-sm text-destructive" role="alert">
          {props.validationErrors?.[0]}
        </p>
      ) : null}
    </div>
  )
})

export const ShadcnTabs = createComponentImplementation(TabsApi, ({ props, buildChild }) => {
  const tabs = props.tabs ?? []
  const defaultValue = tabs[0]?.title ? String(tabs[0].title) : "tab-0"

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1">
        {tabs.map((tab, index) => {
          const title = typeof tab.title === "string" ? tab.title : String(tab.title ?? `Tab ${index + 1}`)

          return (
            <TabsTrigger
              key={`${title}-${index}`}
              value={title}
              className="h-10 px-3 text-xs md:text-sm"
            >
              {title}
            </TabsTrigger>
          )
        })}
      </TabsList>
      {tabs.map((tab, index) => {
        const title = typeof tab.title === "string" ? tab.title : String(tab.title ?? `Tab ${index + 1}`)

        return (
          <TabsContent key={`${title}-content-${index}`} value={title} className="mt-4">
            {buildChild(tab.child)}
          </TabsContent>
        )
      })}
    </Tabs>
  )
})

export const shadcnComponentImplementations = [
  ShadcnText,
  ShadcnRow,
  ShadcnColumn,
  ShadcnList,
  ShadcnCard,
  ShadcnDivider,
  ShadcnButton,
  ShadcnTextField,
  ShadcnCheckBox,
  ShadcnTabs,
]
