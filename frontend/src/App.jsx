import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import BranchSelect from './pages/BranchSelect'
import SemesterSelect from './pages/SemesterSelect'
import SubjectList from './pages/SubjectList'
import MaterialList from './pages/MaterialList'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ProtectedRoute from './components/admin/ProtectedRoute'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<BranchSelect />} />
        <Route path="/branch/:branchId" element={<SemesterSelect />} />
        <Route path="/branch/:branchId/sem/:semester" element={<SubjectList />} />
        <Route path="/subject/:subjectId" element={<MaterialList />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}
