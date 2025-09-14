// src/pages/Dashboard.tsx
import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Coffee, Users, LogOut, Settings, BarChart3 } from "lucide-react"
import { TableGrid } from "@/components/TableGrid"
import { OrderModal } from "@/components/OrderModal"
import { useToast } from "@/hooks/use-toast"
import { Table, User, TableStatus, Hall } from "@/types/cafe"
import { apiFetch } from "@/lib/api"
import backgroundIndex from "@/assets/backgroundindex.png"

const Dashboard = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  // --- State definitions ---
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allTables, setAllTables] = useState<Table[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // --- Load current user from localStorage ---
  useEffect(() => {
    const raw = localStorage.getItem("currentUser")
    if (!raw) {
      navigate("/login")
      return
    }
    setCurrentUser(JSON.parse(raw))
  }, [navigate])

  // --- Fetch tables and halls from API ---
  const fetchTables = useCallback(() => {
    setLoading(true)
    apiFetch('get_tables.php')
      .then(data => {
        setAllTables(data.tables || [])
        setHalls(data.halls || [])
      })
      .catch(err => {
        toast({ title: 'Error loading tables', description: err.message, variant: 'destructive' })
      })
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  // --- Logout handler ---
  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    toast({ title: "Logout Successful", description: "You have been logged out." })
    navigate("/login")
  }

  // --- Table click handler ---
  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
    setOrderModalOpen(true)
  }

  // --- Update table status handler ---
  const handleUpdateTableStatus = async (tableId: string, newStatus: TableStatus) => {
    try {
      await apiFetch('update_table_status.php', {
        method: 'POST',
        body: JSON.stringify({ id: tableId, status: newStatus })
      })
      setAllTables(prev =>
        prev.map(tbl =>
          tbl.id === tableId
            ? { ...tbl, status: newStatus, lastActivity: new Date() }
            : tbl
        )
      )
      toast({ title: "Table status updated", description: `Table ${tableId} is now ${getStatusLabel(newStatus)}` })
    } catch (err: any) {
      toast({ title: 'Error updating table', description: err.message, variant: 'destructive' })
    }
  }

  // --- Status label mapping ---
  const getStatusLabel = (status: TableStatus) => {
    const labels: Record<TableStatus, string> = {
      empty: "Empty",
      reserved: "Reserved",
      occupied: "Occupied",
      paid: "Paid"
    }
    return labels[status] || status
  }

  // --- Count tables by status ---
  const statusCounts = allTables.reduce((acc, tbl) => {
    acc[tbl.status] = (acc[tbl.status] || 0) + 1
    return acc
  }, {} as Record<TableStatus, number>)

  if (!currentUser) return null

  return (
    <div className="relative min-h-screen bg-center bg-cover" style={{ backgroundImage: `url(${backgroundIndex})` }}>
      {/* overlay */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50" />

      {/* main layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* header */}
        <header className="bg-white bg-opacity-80 backdrop-blur-sm border-b">
          <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <Coffee className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Bookstore</h1>
                <p className="text-sm text-muted-foreground">Welcome, {currentUser.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {currentUser.role === "admin" ? "Admin" : "Staff"}
              </Badge>
              {currentUser.role === "admin" && (
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" /> Settings
                </Button>
              )}
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-1" /> Reports
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </div>
          </div>
        </header>

        {/* content */}
        <main className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {/* status overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(['empty', 'occupied', 'reserved', 'paid'] as TableStatus[]).map(key => (
              <Card key={key} className={`bg-table-${key}/10 border-table-${key}/20`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{getStatusLabel(key)}</p>
                      <p className={`text-2xl font-bold text-table-${key}`}>{statusCounts[key] || 0}</p>
                    </div>
                    <div className={`w-8 h-8 bg-table-${key} rounded-full`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* halls and tables */}
          {loading ? (
            <p>Loading tables...</p>
          ) : (
            <Tabs defaultValue={halls[0] ? `floor${halls[0].floor}` : 'floor1'} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                {[...new Set(halls.map(h => h.floor))].map(flr => (
                  <TabsTrigger key={flr} value={`floor${flr}`}>Floor {flr}</TabsTrigger>
                ))}
              </TabsList>

              {[...new Set(halls.map(h => h.floor))].map(flr => (
                <TabsContent key={flr} value={`floor${flr}`} className="space-y-6">
                  {halls.filter(h => h.floor === flr).map(hall => (
                    <Card key={hall.id} className="shadow-soft">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" /> {hall.name}
                        </CardTitle>
                        <CardDescription>{hall.tables.length} tables • Floor {flr}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TableGrid tables={hall.tables} onTableClick={handleTableClick} />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </main>
      </div>

      {/* order modal */}
      {orderModalOpen && selectedTable && (
        <OrderModal
          table={selectedTable}
          open={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          onUpdateTableStatus={handleUpdateTableStatus}
        />
      )}
    </div>
  )
}

export default Dashboard
