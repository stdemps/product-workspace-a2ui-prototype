import { Catalog } from "@a2ui/web_core/v0_9"
import { BASIC_FUNCTIONS } from "@a2ui/web_core/v0_9/basic_catalog"

import { SHADCN_CATALOG_ID } from "@/lib/a2ui/catalog/constants"
import { shadcnComponentImplementations } from "@/lib/a2ui/catalog/shadcn-components"

export { SHADCN_CATALOG_ID }

export const shadcnCatalog = new Catalog(
  SHADCN_CATALOG_ID,
  shadcnComponentImplementations,
  BASIC_FUNCTIONS
)
