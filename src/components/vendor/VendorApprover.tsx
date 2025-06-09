
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Building2, 
  CreditCard, 
  Shield,
  LogOut,
  Clock,
  Eye
} from 'lucide-react';

interface User {
  role: string;
  name: string;
}

interface VendorApproverProps {
  user: User;
  onLogout: () => void;
}

export const VendorApprover = ({ user, onLogout }: VendorApproverProps) => {
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [comments, setComments] = useState('');

  // Mock data - in real app this would come from API
  const pendingVendors = [
    {
      id: 1,
      companyName: 'TechCorp Solutions',
      submittedDate: '2024-06-08',
      submittedBy: 'john.doe@techcorp.com',
      companyInfo: {
        taxId: '12-3456789',
        address: '123 Tech Street, San Francisco, CA 94105',
        phone: '(555) 123-4567',
        website: 'https://techcorp.com',
        description: 'Full-service technology consulting and software development company.'
      },
      bankingInfo: {
        bankName: 'First National Bank',
        accountType: 'Checking',
        routingNumber: '****6789',
        accountNumber: '****4321'
      },
      documents: [
        { name: 'W-9 Tax Form', status: 'uploaded', verificationStatus: 'verified' },
        { name: 'Certificate of Insurance', status: 'uploaded', verificationStatus: 'verified' },
        { name: 'Bank Verification Letter', status: 'uploaded', verificationStatus: 'pending' },
      ],
      riskScore: 'Low',
      status: 'pending_review'
    },
    {
      id: 2,
      companyName: 'Global Services Inc',
      submittedDate: '2024-06-07',
      submittedBy: 'admin@globalservices.com',
      companyInfo: {
        taxId: '98-7654321',
        address: '456 Business Ave, New York, NY 10001',
        phone: '(555) 987-6543',
        website: 'https://globalservices.com',
        description: 'International business consulting and logistics services.'
      },
      bankingInfo: {
        bankName: 'Chase Bank',
        accountType: 'Business Checking',
        routingNumber: '****1234',
        accountNumber: '****9876'
      },
      documents: [
        { name: 'W-9 Tax Form', status: 'uploaded', verificationStatus: 'verified' },
        { name: 'Certificate of Insurance', status: 'uploaded', verificationStatus: 'flagged' },
        { name: 'Bank Verification Letter', status: 'uploaded', verificationStatus: 'verified' },
      ],
      riskScore: 'Medium',
      status: 'pending_review'
    }
  ];

  const handleApprove = (vendorId: number) => {
    console.log('Approving vendor:', vendorId, 'Comments:', comments);
    // Here you would typically send an API request
  };

  const handleReject = (vendorId: number) => {
    console.log('Rejecting vendor:', vendorId, 'Comments:', comments);
    // Here you would typically send an API request
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Flagged</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Risk</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Risk</Badge>;
      case 'High':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Risk</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
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
              <h1 className="text-xl font-semibold text-slate-900">Vendor Approver Portal</h1>
              <p className="text-sm text-slate-600">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
              {pendingVendors.length} Pending Reviews
            </Badge>
            <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Pending Reviews</span>
                </CardTitle>
                <CardDescription>
                  Vendors awaiting your approval
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {pendingVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedVendor === vendor.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                      onClick={() => setSelectedVendor(vendor.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900">{vendor.companyName}</h4>
                          <p className="text-sm text-slate-600">{vendor.submittedDate}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getRiskBadge(vendor.riskScore)}
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{vendor.documents.length} docs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Details */}
          <div className="lg:col-span-2">
            {selectedVendor ? (
              (() => {
                const vendor = pendingVendors.find(v => v.id === selectedVendor);
                if (!vendor) return null;

                return (
                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="company">Company</TabsTrigger>
                      <TabsTrigger value="banking">Banking</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{vendor.companyName}</span>
                            {getRiskBadge(vendor.riskScore)}
                          </CardTitle>
                          <CardDescription>
                            Submitted by {vendor.submittedBy} on {vendor.submittedDate}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <h4 className="font-medium text-slate-900 mb-2">Company Info</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Tax ID:</span> {vendor.companyInfo.taxId}</p>
                                <p><span className="font-medium">Phone:</span> {vendor.companyInfo.phone}</p>
                              </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <h4 className="font-medium text-slate-900 mb-2">Banking</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Bank:</span> {vendor.bankingInfo.bankName}</p>
                                <p><span className="font-medium">Type:</span> {vendor.bankingInfo.accountType}</p>
                              </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <h4 className="font-medium text-slate-900 mb-2">Documents</h4>
                              <div className="space-y-1">
                                {vendor.documents.map((doc) => (
                                  <div key={doc.name} className="flex items-center space-x-2">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    <span className="text-xs">{doc.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Review Comments
                              </label>
                              <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Add any comments or notes about this vendor..."
                                rows={3}
                              />
                            </div>

                            <div className="flex space-x-4">
                              <Button 
                                onClick={() => handleApprove(vendor.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Vendor
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleReject(vendor.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="company" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5" />
                            <span>Company Information</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700">Company Name</label>
                              <p className="text-slate-900">{vendor.companyName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Tax ID</label>
                              <p className="text-slate-900">{vendor.companyInfo.taxId}</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-slate-700">Address</label>
                            <p className="text-slate-900">{vendor.companyInfo.address}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700">Phone</label>
                              <p className="text-slate-900">{vendor.companyInfo.phone}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Website</label>
                              <p className="text-slate-900">{vendor.companyInfo.website}</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-slate-700">Business Description</label>
                            <p className="text-slate-900">{vendor.companyInfo.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="banking" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5" />
                            <span>Banking Information</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium text-amber-900">Sensitive Information</span>
                            </div>
                            <p className="text-sm text-amber-700 mt-1">
                              Full account details are masked for security. Verify banking information through uploaded documents.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700">Bank Name</label>
                              <p className="text-slate-900">{vendor.bankingInfo.bankName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Account Type</label>
                              <p className="text-slate-900">{vendor.bankingInfo.accountType}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700">Routing Number</label>
                              <p className="text-slate-900 font-mono">{vendor.bankingInfo.routingNumber}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Account Number</label>
                              <p className="text-slate-900 font-mono">{vendor.bankingInfo.accountNumber}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>Document Verification</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {vendor.documents.map((doc) => (
                              <div key={doc.name} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-slate-900">{doc.name}</h4>
                                    <p className="text-sm text-slate-600">
                                      Status: {doc.status} • Verification: {doc.verificationStatus}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    {getVerificationBadge(doc.verificationStatus)}
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4 mr-2" />
                                      View
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                );
              })()
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Vendor Selected</h3>
                  <p className="text-slate-600">
                    Select a vendor from the list to review their information and documents.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
