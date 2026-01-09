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
  Building2,
  Briefcase
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

interface GovForm {
  _id: string;
  title: string;
  department: string;
  fee?: number;
  processingTime?: string;
  docsRequired?: number;
  status: 'new' | 'popular' | 'closed';
}

interface Banner {
  _id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const MobileHome = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [forms, setForms] = useState<GovForm[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    fetchForms();
    fetchBanners();
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

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/public/forms');
      const data = await res.json();
      if (data.forms) {
        setForms(data.forms);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/public/banners');
      const data = await res.json();
      if (data.banners) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const getDaysLeft = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const activeBanner = banners.length > 0 ? banners[0] : null;

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
        {activeBanner ? (
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-4 relative overflow-hidden">
            <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
              URGENT
            </span>
            <h2 className="text-lg font-bold mb-1">{activeBanner.title}</h2>
            <p className="text-sm text-green-100 mb-3">{activeBanner.description}</p>
            <Button 
              size="sm" 
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => navigate(activeBanner.buttonLink)}
            >
              {activeBanner.buttonText}
            </Button>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-400/20 rounded-full"></div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-4 relative overflow-hidden">
            <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
              URGENT
            </span>
            <h2 className="text-lg font-bold mb-1">PM Awas Yojana Update</h2>
            <p className="text-sm text-green-100 mb-3">
              Deadline extended for 2024 applications to Oct 30th.
            </p>
            <Button 
              size="sm" 
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => navigate('/govt-jobs')}
            >
              Check Status
            </Button>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-400/20 rounded-full"></div>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Related Job Searches</h3>
            <Link to="/govt-jobs" className="text-green-400 text-sm flex items-center gap-1">
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
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-400" />
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
                    className="w-full mt-3 border-green-500/50 text-green-400 hover:bg-green-500/10"
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
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-400" />
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
                  <Button variant="outline" size="sm" className="w-full mt-3 border-green-500/50 text-green-400 hover:bg-green-500/10">
                    View Details
                  </Button>
                </div>
                <div className="min-w-[200px] bg-slate-800 rounded-xl p-4 flex-shrink-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-green-400" />
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
                  <Button variant="outline" size="sm" className="w-full mt-3 border-green-500/50 text-green-400 hover:bg-green-500/10">
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
            {forms.length > 0 ? forms.map((form) => (
              <div 
                key={form._id} 
                className="bg-slate-800 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-white text-sm">{form.title}</h4>
                    {form.status === 'new' && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded flex-shrink-0">NEW</span>
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
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  disabled={form.status === 'closed'}
                  onClick={() => user ? navigate('/dashboard/jobs') : navigate('/login')}
                >
                  {form.status === 'closed' ? 'Details' : form.fee ? 'Apply Now' : 'View Form'}
                </Button>
              </div>
            )) : (
              <>
                <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-white text-sm">SSC CGL 2024 Application</h4>
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded flex-shrink-0">NEW</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Staff Selection Commission</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        Fee: ₹100
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => user ? navigate('/dashboard/jobs') : navigate('/login')}
                  >
                    Apply Now
                  </Button>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-white text-sm">Income Certificate Request</h4>
                      <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded flex-shrink-0">POPULAR</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Revenue Department</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Processing: 7 Days
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => user ? navigate('/dashboard/jobs') : navigate('/login')}
                  >
                    View Form
                  </Button>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-white text-sm">Passport Renewal</h4>
                      <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded flex-shrink-0">POPULAR</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Ministry of External Affairs</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Docs Required: 3
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => user ? navigate('/dashboard/jobs') : navigate('/login')}
                  >
                    Start
                  </Button>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-white text-sm">State Scholarship 2023</h4>
                      <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded flex-shrink-0">CLOSED</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Education Department</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-500">Archived</span>
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0 bg-slate-700 text-slate-400" disabled>
                    Details
                  </Button>
                </div>
              </>
            )}
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
