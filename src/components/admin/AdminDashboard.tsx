
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Shield, 
  LogOut,
  Search,
  Filter,
  FileText,
  Building2
} from 'lucide-react';

interface User {
  role: string;
  name: string;
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');

  // Mock data - in real app this would come from API
  const vendors = [
    { 
      id: 1, 
      name: 'TechCorp Solutions', 
      email: 'admin@techcorp.com', 
      status: 'pending_approval', 
      submittedDate: '2024-06-08',
      approver: 'John Smith',
      documents: ['W-9', 'Certificate of Insurance']
    },
    { 
      id: 2, 
      name: 'Global Services Inc', 
      email: 'contact@globalservices.com', 
      status: 'approved', 
      submittedDate: '2024-06-07',
      approver: 'Sarah Johnson',
      documents: ['W-9', 'Bank Letter', 'Certificate of Insurance']
    },
    { 
      id: 3, 
      name: 'StartUp Dynamics', 
      email: 'info@startupdynamics.com', 
      status: 'documents_pending', 
      submittedDate: '2024-06-06',
      approver: 'Mike Wilson',
      documents: ['W-9']
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>;
      case 'documents_pending':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Documents Needed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleInviteVendor = () => {
    if (newVendorEmail) {
      console.log('Inviting vendor:', newVendorEmail);
      setNewVendorEmail('');
      // Here you would typically send an API request
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">VendorSecure Admin</h1>
              <p className="text-sm text-slate-600">Welcome back, {user.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-slate-900">24</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">18</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Issues</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-400">
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
            <TabsTrigger value="invite">Invite Vendor</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Vendor Directory</span>
                </CardTitle>
                <CardDescription>
                  Manage and review vendor registrations and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search vendors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                <div className="space-y-4">
                  {vendors.map((vendor) => (
                    <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-semibold text-slate-900">{vendor.name}</h3>
                                <p className="text-sm text-slate-600">{vendor.email}</p>
                                <p className="text-xs text-slate-500">
                                  Submitted: {vendor.submittedDate} • Approver: {vendor.approver}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                <FileText className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  {vendor.documents.length} documents
                                </span>
                              </div>
                              {getStatusBadge(vendor.status)}
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              {vendor.status === 'pending_approval' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Approve
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Invite New Vendor</span>
                </CardTitle>
                <CardDescription>
                  Send secure invitation to vendors for onboarding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Vendor Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="vendor@company.com"
                      value={newVendorEmail}
                      onChange={(e) => setNewVendorEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleInviteVendor} className="w-full">
                      Send Invitation
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Invitation Process</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Vendor receives secure email invitation</li>
                    <li>• They complete registration and upload documents</li>
                    <li>• Internal approver reviews and validates information</li>
                    <li>• You receive notification for final approval</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  Complete log of all vendor verification activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-green-900">Vendor Approved</p>
                        <p className="text-sm text-green-700">Global Services Inc approved by Sarah Johnson</p>
                      </div>
                      <span className="text-xs text-green-600">2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-yellow-900">Documents Uploaded</p>
                        <p className="text-sm text-yellow-700">TechCorp Solutions uploaded W-9 and Insurance Certificate</p>
                      </div>
                      <span className="text-xs text-yellow-600">1 day ago</span>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-blue-900">Invitation Sent</p>
                        <p className="text-sm text-blue-700">Invitation sent to StartUp Dynamics (info@startupdynamics.com)</p>
                      </div>
                      <span className="text-xs text-blue-600">3 days ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
