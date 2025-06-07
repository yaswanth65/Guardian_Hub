
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  LogOut, 
  FileText, 
  Users, 
  AlertTriangle,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, statusFilter]);

  const fetchAllComplaints = async () => {
    try {
      const q = query(collection(db, 'complaints'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const complaintsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComplaints(complaintsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: "Error",
        description: "Failed to fetch complaints",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    setFilteredComplaints(filtered);
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status: newStatus
      });

      setComplaints(complaints.map(complaint =>
        complaint.id === complaintId
          ? { ...complaint, status: newStatus }
          : complaint
      ));

      toast({
        title: "Success",
        description: "Complaint status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update complaint status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-600';
      case 'in-progress': return 'bg-blue-600';
      case 'resolved': return 'bg-green-600';
      case 'closed': return 'bg-gray-600';
      default: return 'bg-yellow-600';
    }
  };

  const stats = {
    total: complaints.length,
    submitted: complaints.filter(c => c.status === 'submitted').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    onLogout();
    toast({
      title: "Success",
      description: "Admin logged out successfully",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Total Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-400">{stats.submitted}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search complaints, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">All Complaints ({filteredComplaints.length})</CardTitle>
            <CardDescription className="text-slate-400">
              Manage and track all user complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No complaints found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(complaint.status)} text-white`}>
                          {complaint.status}
                        </Badge>
                        <span className="text-slate-400 text-sm">
                          ID: {complaint.id.slice(-6)}
                        </span>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {complaint.timestamp?.toDate?.()?.toLocaleString() || 'Recent'}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-white font-medium mb-1">User: {complaint.userEmail}</p>
                      <p className="text-slate-300 text-sm mb-2">{complaint.complaint}</p>
                      <p className="text-slate-400 text-xs">Location: {complaint.location}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {complaint.status !== 'in-progress' && (
                        <Button
                          onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Mark In Progress
                        </Button>
                      )}
                      {complaint.status !== 'resolved' && (
                        <Button
                          onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {complaint.status !== 'closed' && (
                        <Button
                          onClick={() => updateComplaintStatus(complaint.id, 'closed')}
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-600"
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
