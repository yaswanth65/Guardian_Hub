import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Phone, 
  Upload, 
  MapPin, 
  FileText, 
  Users, 
  Clock, 
  LogOut,
  Camera,
  Plus,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState('');
  const [location, setLocation] = useState('');
  const [trustedContact, setTrustedContact] = useState('');
  const [trustedContacts, setTrustedContacts] = useState<string[]>([]);
  const [userComplaints, setUserComplaints] = useState<any[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const safetyTips = [
    "Use well-lit and populated routes when traveling.",
    "Share your location with trusted contacts.",
    "Keep emergency contacts readily available.",
    "Trust your instincts if something feels wrong.",
    "Stay alert and avoid distractions while walking alone."
  ];

  useEffect(() => {
    getLocation();
    fetchUserComplaints();
    const savedContacts = localStorage.getItem('trustedContacts');
    if (savedContacts) {
      setTrustedContacts(JSON.parse(savedContacts));
    }
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.log('Location error:', error);
          setLocation('Location not available');
        }
      );
    }
  };

  const fetchUserComplaints = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'complaints'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const complaints = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserComplaints(complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileRef = ref(storage, `evidence/${currentUser?.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...urls]);
      
      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEmergency = () => {
    toast({
      title: "Emergency Alert Sent",
      description: "Your location and alert have been sent to trusted contacts and authorities.",
      variant: "destructive",
    });
    // In a real app, this would trigger actual emergency protocols
  };

  const handleFileComplaint = async () => {
    if (!complaint.trim()) {
      toast({
        title: "Error",
        description: "Please describe the incident in detail.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'complaints'), {
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        complaint: complaint,
        location: location,
        evidenceFiles: uploadedFiles,
        timestamp: new Date(),
        status: 'submitted'
      });

      toast({
        title: "Success",
        description: "Your complaint has been filed successfully.",
      });
      
      setComplaint('');
      setUploadedFiles([]);
      fetchUserComplaints();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to file complaint. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addTrustedContact = () => {
    if (!trustedContact.trim()) return;
    
    const newContacts = [...trustedContacts, trustedContact];
    setTrustedContacts(newContacts);
    localStorage.setItem('trustedContacts', JSON.stringify(newContacts));
    setTrustedContact('');
    
    toast({
      title: "Success",
      description: "Trusted contact added successfully.",
    });
  };

  const removeTrustedContact = (index: number) => {
    const newContacts = trustedContacts.filter((_, i) => i !== index);
    setTrustedContacts(newContacts);
    localStorage.setItem('trustedContacts', JSON.stringify(newContacts));
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % safetyTips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + safetyTips.length) % safetyTips.length);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Women & Child Safety</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">Welcome, {currentUser?.email}</span>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency SOS */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <div className="p-1 bg-red-600 rounded">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span>Emergency SOS</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Button
              onClick={handleEmergency}
              className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white text-lg font-bold shadow-lg transform hover:scale-105 transition-transform"
            >
              <div className="flex flex-col items-center">
                <Phone className="h-8 w-8 mb-2" />
                Press to Send Alert
              </div>
            </Button>
            <p className="text-slate-300 text-sm text-center">
              Press to send alert to trusted contacts and authorities
            </p>
          </CardContent>
        </Card>

        {/* Upload Evidence */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <div className="p-1 bg-green-600 rounded">
                <Upload className="h-4 w-4 text-white" />
              </div>
              <span>Upload Evidence</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-2">Click to select files</p>
              <p className="text-slate-400 text-sm mb-4">Images, Videos, Audio</p>
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload}
                accept="image/*,video/*,audio/*"
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {uploading ? 'Uploading...' : 'Select Files'}
              </Button>
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-green-400 text-sm">{uploadedFiles.length} file(s) uploaded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Location */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <div className="p-1 bg-blue-600 rounded">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span>Your Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary" className="bg-green-600 text-white mb-2">
                  Location Found
                </Badge>
                <p className="text-slate-300 font-mono text-sm">{location}</p>
              </div>
              <Button onClick={getLocation} variant="outline" size="sm" className="border-slate-600 text-slate-300">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File a Complaint */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <div className="p-1 bg-yellow-600 rounded">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span>File a Complaint</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe the incident in detail..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              rows={4}
            />
            {uploadedFiles.length > 0 && (
              <div className="text-green-400 text-sm">
                {uploadedFiles.length} evidence file(s) will be attached
              </div>
            )}
            <Button onClick={handleFileComplaint} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
              Submit Complaint
            </Button>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <div className="p-1 bg-purple-600 rounded">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span>Safety Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-slate-700/50 p-4 rounded-lg">
              <p className="text-slate-300 text-sm mb-4">{safetyTips[currentTipIndex]}</p>
              <div className="flex justify-between items-center">
                <Button onClick={prevTip} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex space-x-2">
                  {safetyTips.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentTipIndex ? 'bg-purple-600' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <Button onClick={nextTip} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trusted Contacts */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <div className="p-1 bg-indigo-600 rounded">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span>Trusted Contacts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter mobile number"
                value={trustedContact}
                onChange={(e) => setTrustedContact(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
              <Button onClick={addTrustedContact} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {trustedContacts.length === 0 ? (
              <p className="text-slate-400 text-sm">No trusted contacts added yet</p>
            ) : (
              <div className="space-y-2">
                {trustedContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                    <span className="text-slate-300">{contact}</span>
                    <Button
                      onClick={() => removeTrustedContact(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaint History */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <div className="p-1 bg-orange-600 rounded">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <span>Complaint History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userComplaints.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No complaints filed yet</p>
            ) : (
              <div className="space-y-4">
                {userComplaints.map((complaint) => (
                  <div key={complaint.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-orange-600 text-white">
                        {complaint.status}
                      </Badge>
                      <span className="text-slate-400 text-sm">
                        {complaint.timestamp?.toDate?.()?.toLocaleDateString() || 'Recent'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{complaint.complaint}</p>
                    <p className="text-slate-400 text-xs mb-2">Location: {complaint.location}</p>
                    {complaint.evidenceFiles && complaint.evidenceFiles.length > 0 && (
                      <p className="text-green-400 text-xs">
                        {complaint.evidenceFiles.length} evidence file(s) attached
                      </p>
                    )}
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

export default Dashboard;
