import * as React from "react"

type ChildRef = string | { id: string; basePath?: string }

interface ChildListProps {
  childList?: ChildRef[]
  buildChild: (id: string, basePath?: string) => React.ReactNode
}

export function ChildList({ childList, buildChild }: ChildListProps) {
  if (!Array.isArray(childList)) return null

  return (
    <>
      {childList.map((childRef, index) => {
        if (typeof childRef === "string") {
          return (
            <React.Fragment key={`${childRef}-${index}`}>
              {buildChild(childRef)}
            </React.Fragment>
          )
        }

        return (
          <React.Fragment key={`${childRef.id}-${childRef.basePath ?? index}`}>
            {buildChild(childRef.id, childRef.basePath)}
          </React.Fragment>
        )
      })}
    </>
  )
}
