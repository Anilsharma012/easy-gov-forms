import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, 
  Bell, 
  Home, 
  Bookmark, 
  Plus, 
  FileText, 
  User,
  ChevronRight,
  Clock,
  IndianRupee,
  AlertCircle,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Job {
  _id: string;
  title: string;
  department: string;
  vacancies: number;
  lastDate: string;
  status: string;
}

interface Form {
  id: string;
  title: string;
  department: string;
  fee?: number;
  processingTime?: string;
  docsRequired?: number;
  status: 'new' | 'popular' | 'closed';
}

const MobileHome = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const forms: Form[] = [
    { id: '1', title: 'SSC CGL 2024 Application', department: 'Staff Selection Commission', fee: 100, status: 'new' },
    { id: '2', title: 'Income Certificate Request', department: 'Revenue Department', processingTime: '7 Days', status: 'popular' },
    { id: '3', title: 'Passport Renewal', department: 'Ministry of External Affairs', docsRequired: 3, status: 'popular' },
    { id: '4', title: 'State Scholarship 2023', department: 'Education Department', status: 'closed' },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs?limit=5');
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const getDaysLeft = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-green-400">My Gov Form</h1>
          <button className="p-2 relative">
            <Bell className="w-6 h-6 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMenuOpen(false)}>
          <div className="w-64 h-full bg-slate-800 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <Link to="/login" className="block py-2 px-4 hover:bg-slate-700 rounded">Login</Link>
              <Link to="/register" className="block py-2 px-4 hover:bg-slate-700 rounded">Register</Link>
              <Link to="/govt-jobs" className="block py-2 px-4 hover:bg-slate-700 rounded">All Jobs</Link>
              <Link to="/pricing" className="block py-2 px-4 hover:bg-slate-700 rounded">Pricing</Link>
              <Link to="/contact" className="block py-2 px-4 hover:bg-slate-700 rounded">Contact</Link>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-4 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 relative overflow-hidden">
          <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
            URGENT
          </span>
          <h2 className="text-lg font-bold mb-1">PM Awas Yojana Update</h2>
          <p className="text-sm text-blue-100 mb-3">
            Deadline extended for 2024 applications to Oct 30th.
          </p>
          <Button 
            size="sm" 
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => navigate('/govt-jobs')}
          >
            Check Status
          </Button>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-400/20 rounded-full"></div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Related Job Searches</h3>
            <Link to="/govt-jobs" className="text-blue-400 text-sm flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {jobs.length > 0 ? jobs.map((job) => {
              const daysLeft = getDaysLeft(job.lastDate);
              return (
                <div 
                  key={job._id} 
                  className="min-w-[200px] bg-slate-800 rounded-xl p-4 flex-shrink-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mb-1 line-clamp-2">{job.title}</h4>
                  <p className="text-xs text-slate-400 mb-2">{job.department}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                    <User className="w-3 h-3" />
                    <span>{job.vacancies} Vacancies</span>
                  </div>
                  {daysLeft > 0 ? (
                    <div className="flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>Closes in {daysLeft} days</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Closed</span>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => navigate(`/job/${job._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              );
            }) : (
              <>
                <div className="min-w-[200px] bg-slate-800 rounded-xl p-4 flex-shrink-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Active</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">RRB NTPC Recruitment</h4>
                  <p className="text-xs text-slate-400 mb-2">Indian Railways</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                    <User className="w-3 h-3" />
                    <span>5000 Vacancies</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>Closes in 2 days</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                    View Details
                  </Button>
                </div>
                <div className="min-w-[200px] bg-slate-800 rounded-xl p-4 flex-shrink-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Active</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">IBPS Clerk</h4>
                  <p className="text-xs text-slate-400 mb-2">Banking Sector</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                    <User className="w-3 h-3" />
                    <span>1200 Vacancies</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Last Date: Dec 15</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                    View Details
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-white mb-4">Indian Government Forms</h3>
          <div className="space-y-3">
            {forms.map((form) => (
              <div 
                key={form.id} 
                className="bg-slate-800 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-white text-sm">{form.title}</h4>
                    {form.status === 'new' && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded flex-shrink-0">NEW</span>
                    )}
                    {form.status === 'popular' && (
                      <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded flex-shrink-0">POPULAR</span>
                    )}
                    {form.status === 'closed' && (
                      <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded flex-shrink-0">CLOSED</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{form.department}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {form.fee && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        Fee: ₹{form.fee}
                      </span>
                    )}
                    {form.processingTime && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Processing: {form.processingTime}
                      </span>
                    )}
                    {form.docsRequired && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Docs Required: {form.docsRequired}
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className={`flex-shrink-0 ${
                    form.status === 'closed' 
                      ? 'bg-slate-700 text-slate-400' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  disabled={form.status === 'closed'}
                  onClick={() => user ? navigate('/dashboard/jobs') : navigate('/login')}
                >
                  {form.status === 'closed' ? 'Details' : form.fee ? 'Apply Now' : 'View Form'}
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          <Link to="/home" className="flex flex-col items-center gap-1 text-green-400">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to={user ? "/dashboard" : "/login"} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white">
            <Bookmark className="w-5 h-5" />
            <span className="text-xs">Saved</span>
          </Link>
          <Link 
            to={user ? "/dashboard/jobs" : "/login"} 
            className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full -mt-4 shadow-lg"
          >
            <Plus className="w-6 h-6 text-white" />
          </Link>
          <Link to={user ? "/dashboard/applications" : "/login"} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white">
            <FileText className="w-5 h-5" />
            <span className="text-xs">Status</span>
          </Link>
          <Link to={user ? "/dashboard/settings" : "/login"} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MobileHome;