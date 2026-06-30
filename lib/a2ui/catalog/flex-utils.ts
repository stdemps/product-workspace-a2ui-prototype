export function mapJustify(value?: string) {
  switch (value) {
    case "center":
      return "justify-center"
    case "end":
      return "justify-end"
    case "spaceAround":
      return "justify-around"
    case "spaceBetween":
      return "justify-between"
    case "spaceEvenly":
      return "justify-evenly"
    case "stretch":
      return "justify-stretch"
    case "start":
    default:
      return "justify-start"
  }
}

export function mapAlign(value?: string) {
  switch (value) {
    case "start":
      return "items-start"
    case "center":
      return "items-center"
    case "end":
      return "items-end"
    case "stretch":
      return "items-stretch"
    default:
      return "items-stretch"
  }
}

export function mapFlexWeight(weight?: number) {
  if (typeof weight !== "number") return undefined
  return { flex: `${weight}`, minWidth: 0, minHeight: 0 } as const
}
