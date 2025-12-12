import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, IndianRupee, ArrowRight, Briefcase } from "lucide-react";
import { Job } from "@/data/mockData";

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  return (
    <div className="hover-lift group rounded-2xl border border-border bg-card p-6 transition-all">
      <div className="mb-4 flex items-start justify-between">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {job.category}
        </span>
        <span className="text-xs text-muted-foreground">
          {job.vacancies.toLocaleString()} vacancies
        </span>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
        {job.title}
      </h3>

      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Briefcase className="h-4 w-4 text-primary" />
        <span>{job.department}</span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
        {job.eligibility}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{new Date(job.lastDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
        </div>
      </div>

      {/* Fee breakdown */}
      <div className="mb-4 rounded-lg bg-muted/50 p-3">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <p className="font-semibold text-foreground">₹{job.fees.general}</p>
            <p className="text-muted-foreground">General</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">₹{job.fees.obc}</p>
            <p className="text-muted-foreground">OBC</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">₹{job.fees.sc}</p>
            <p className="text-muted-foreground">SC</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">₹{job.fees.st}</p>
            <p className="text-muted-foreground">ST</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" asChild>
          <Link to={`/govt-jobs/${job.id}`}>View Details</Link>
        </Button>
        <Button className="flex-1 gap-1" asChild>
          <Link to={`/govt-jobs/${job.id}`}>
            Apply
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
