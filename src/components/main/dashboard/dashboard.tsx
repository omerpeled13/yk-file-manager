"use client";

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react"
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import supabase from "@/src/supabase/supabase-client";

interface Employee {
  id: number
  name: string
  country: string
  email: string
  company: string
  gender: string
}

export default function DashboardForm() {
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('employees')
        .select('*')
      
      if (error) throw error
      if (data) setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(employee =>
    employee.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">עובדים (1000)</h1>
        <Button>+ הוסף חדש</Button>
      </div>
      <p className="text-sm text-gray-500 mb-4">ניהול עובדים (פונקציונליות טבלה בצד שרת)</p>
      <Input
        className="mb-4"
        placeholder="חיפוש לפי מדינה..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>שם</TableHead>
            <TableHead>מדינה</TableHead>
            <TableHead>אימייל</TableHead>
            <TableHead>חברה</TableHead>
            <TableHead>מגדר</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">טוען...</TableCell>
            </TableRow>
          ) : (
            filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.country}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.company}</TableCell>
                <TableCell>{employee.gender}</TableCell>
                <TableCell>
                  <MoreHorizontal className="h-5 w-5" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">0 מתוך 10 שורות נבחרו.</p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">שורות לעמוד</span>
          <select className="border rounded p-1">
            <option>10</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">עמוד 1 מתוך 100</span>
          <div className="flex space-x-1">
            <Button variant="outline" size="icon"><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}