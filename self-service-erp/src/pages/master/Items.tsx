import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dbAdjustStock, dbListItems, dbUpsertItem } from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatNumber } from '@/utils/formatters'
import type { ItemMaster } from '@/types/erp.types'

export function Items() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const items = useQuery({ queryKey: ['items'], queryFn: dbListItems })
  const [editing, setEditing] = useState<ItemMaster | null>(null)
  const [stockDelta, setStockDelta] = useState<Record<string, string>>({})

  const save = useMutation({
    mutationFn: (item: ItemMaster) => dbUpsertItem(item, user!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      setEditing(null)
    },
  })

  const adjust = useMutation({
    mutationFn: ({ code, delta }: { code: string; delta: number }) => dbAdjustStock(code, delta, user!),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['items'] }),
  })

  const columns: DataTableColumn<ItemMaster>[] = [
    { id: 'code', header: 'Code', cell: (i) => i.code },
    { id: 'desc', header: 'Description', cell: (i) => i.description },
    { id: 'stock', header: 'Stock', cell: (i) => formatNumber(i.stock) },
    { id: 'uom', header: 'UOM', cell: (i) => i.uom },
    { id: 'price', header: 'Unit price', cell: (i) => formatCurrency(i.unitPrice) },
    { id: 'fa', header: 'Fixed asset', cell: (i) => (i.isFixedAsset ? 'Yes' : 'No') },
    { id: 'status', header: 'Status', cell: (i) => <StatusBadge status={i.isActive ? 'Active' : 'Inactive'} /> },
    {
      id: 'adjust',
      header: 'Adjust stock',
      cell: (i) => (
        <div className="flex gap-1">
          <Input
            className="h-8 w-16"
            type="number"
            placeholder="±"
            value={stockDelta[i.code] ?? ''}
            onChange={(ev) => setStockDelta((s) => ({ ...s, [i.code]: ev.target.value }))}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const delta = Number(stockDelta[i.code])
              if (!Number.isNaN(delta)) adjust.mutate({ code: i.code, delta })
            }}
          >
            Apply
          </Button>
        </div>
      ),
    },
    {
      id: 'edit',
      header: '',
      cell: (i) => (
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(i)}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Item Catalog"
      description="Inventory and fixed-asset master — store requisitions validate against this catalog."
      actions={
        <Button
          variant="accent"
          onClick={() =>
            setEditing({
              code: '',
              description: '',
              uom: 'Pcs',
              stock: 0,
              unitPrice: 0,
              categoryCode: 'ST',
              isFixedAsset: false,
              isActive: true,
            })
          }
        >
          Add item
        </Button>
      }
    >
      <div className="portal-table-wrap bg-white p-1">
        <DataTable rows={items.data ?? []} columns={columns} getRowId={(i) => i.code} />
      </div>
      {editing ? (
        <div className="portal-form-card mt-6 max-w-lg">
          <div className="portal-form-card-header px-4 py-3 font-semibold text-white">Item</div>
          <form
            className="grid gap-3 p-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              save.mutate(editing)
            }}
          >
            <div><Label>Code</Label><Input value={editing.code} onChange={(ev) => setEditing({ ...editing, code: ev.target.value.toUpperCase() })} required /></div>
            <div><Label>Description</Label><Input value={editing.description} onChange={(ev) => setEditing({ ...editing, description: ev.target.value })} required /></div>
            <div><Label>Stock</Label><Input type="number" value={editing.stock} onChange={(ev) => setEditing({ ...editing, stock: Number(ev.target.value) })} /></div>
            <div><Label>Unit price</Label><Input type="number" value={editing.unitPrice} onChange={(ev) => setEditing({ ...editing, unitPrice: Number(ev.target.value) })} /></div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      ) : null}
    </PageWrapper>
  )
}
