/** Restore the authoritative view and rebuild derived regions, including missing entries. */
export const restoreSectionView = ({
  views,
  savedViews,
  id,
  regions,
  layout,
  fallbackSlot,
}: {
  views: Record<string, any>
  savedViews?: Record<string, any>
  id: string
  regions: Record<string, any[]>
  layout: string
  fallbackSlot?: string
}) => {
  const savedView = savedViews?.[id]
  if (!views || !savedView) return false

  views[id] = savedView
  if (layout !== 'standard') {
    const slots = new Set(Object.keys(regions))
    Object.values(views).forEach((view: any) => {
      const slot = view.region?.[layout]?.slot || (view.id === id ? fallbackSlot : undefined)
      if (slot) slots.add(slot)
    })
    slots.forEach((slot) => {
      regions[slot] = Object.values(views)
        .filter((view: any) => {
          const viewSlot =
            view.region?.[layout]?.slot || (view.id === id ? fallbackSlot : undefined)
          return viewSlot === slot
        })
        .sort(
          (a: any, b: any) =>
            (a.region?.[layout]?.weight ?? a.weight ?? 0) -
            (b.region?.[layout]?.weight ?? b.weight ?? 0)
        )
    })
  }
  return true
}
