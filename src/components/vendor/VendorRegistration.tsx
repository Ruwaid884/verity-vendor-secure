
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  CreditCard, 
  Shield,
  LogOut,
  Phone,
  MapPin
} from 'lucide-react';

interface User {
  role: string;
  name: string;
}

interface VendorRegistrationProps {
  user: User;
  onLogout: () => void;
}

export const VendorRegistration = ({ user, onLogout }: VendorRegistrationProps) => {
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: '',
    description: '',
    bankName: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking',
  });

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<'draft' | 'submitted' | 'approved'>('draft');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (fileName: string) => {
    setUploadedFiles(prev => [...prev, fileName]);
  };

  const handleSubmit = () => {
    setSubmissionStatus('submitted');
    console.log('Vendor registration submitted:', formData);
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
              <h1 className="text-xl font-semibold text-slate-900">Vendor Registration</h1>
              <p className="text-sm text-slate-600">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {submissionStatus !== 'draft' && (
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                {submissionStatus === 'submitted' ? 'Pending Approval' : 'Approved'}
              </Badge>
            )}
            <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {submissionStatus === 'submitted' ? (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Registration Submitted</h3>
                  <p className="text-slate-600">Your information is being reviewed by your internal approver.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Company Info</TabsTrigger>
            <TabsTrigger value="banking">Banking Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="review">Review & Submit</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
                <CardDescription>
                  Provide your company details for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxId">Tax ID / EIN *</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Business Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Briefly describe your business and services..."
                    rows={3}
                  />
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
                <CardDescription>
                  Secure banking details for payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Bank-Grade Security</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    All banking information is encrypted and securely stored using industry-standard protocols.
                  </p>
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="First National Bank"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routingNumber">Routing Number *</Label>
                    <Input
                      id="routingNumber"
                      value={formData.routingNumber}
                      onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                      placeholder="123456789"
                      maxLength={9}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      type="password"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="Account Number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accountType">Account Type *</Label>
                  <select
                    id="accountType"
                    value={formData.accountType}
                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Required Documents</span>
                </CardTitle>
                <CardDescription>
                  Upload the following documents for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { name: 'W-9 Tax Form', required: true, description: 'Federal tax classification and certification' },
                  { name: 'Certificate of Insurance', required: true, description: 'General liability and professional insurance' },
                  { name: 'Bank Verification Letter', required: true, description: 'Letter from bank confirming account details' },
                  { name: 'Business License', required: false, description: 'State or local business operating license' }
                ].map((doc) => (
                  <div key={doc.name} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-slate-900">{doc.name}</h4>
                          {doc.required && <span className="text-red-500 text-sm">*</span>}
                          {uploadedFiles.includes(doc.name) && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                      </div>
                      <Button
                        variant={uploadedFiles.includes(doc.name) ? "outline" : "default"}
                        onClick={() => handleFileUpload(doc.name)}
                        className="ml-4"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadedFiles.includes(doc.name) ? 'Uploaded' : 'Upload'}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>
                  Please review all information before submitting for approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Company Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {formData.companyName || 'Not provided'}</p>
                      <p><span className="font-medium">Tax ID:</span> {formData.taxId || 'Not provided'}</p>
                      <p><span className="font-medium">Phone:</span> {formData.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Banking Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Bank:</span> {formData.bankName || 'Not provided'}</p>
                      <p><span className="font-medium">Account Type:</span> {formData.accountType}</p>
                      <p><span className="font-medium">Routing:</span> {formData.routingNumber ? '***' + formData.routingNumber.slice(-4) : 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {uploadedFiles.length > 0 ? (
                      uploadedFiles.map((file) => (
                        <div key={file} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{file}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">No documents uploaded yet</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full md:w-auto"
                    disabled={submissionStatus !== 'draft'}
                  >
                    {submissionStatus === 'draft' ? 'Submit for Approval' : 'Already Submitted'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
