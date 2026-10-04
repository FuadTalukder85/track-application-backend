import mongoose, { Document, Schema } from 'mongoose';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance' | 'Other';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Technical Assessment'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface IJobApplication extends Document {
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  jobRequirements?: string;
  jobLocation?: string;
  jobType: JobType;
  workMode: WorkMode;
  jobPostingUrl?: string;
  applicationDate: Date;
  salaryRange?: string;
  expectedSalary?: number;
  currentSalary?: number;
  offeredSalary?: number;
  salaryCurrency: string;
  applicationStatus: ApplicationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      default: '',
      trim: true,
    },
    jobRequirements: {
      type: String,
      default: '',
      trim: true,
    },
    jobLocation: {
      type: String,
      default: '',
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Other'],
      default: 'Full-time',
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
    },
    jobPostingUrl: {
      type: String,
      default: '',
      trim: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    salaryRange: {
      type: String,
      default: '',
      trim: true,
    },
    expectedSalary: {
      type: Number,
      default: null,
    },
    currentSalary: {
      type: Number,
      default: null,
    },
    offeredSalary: {
      type: Number,
      default: null,
    },
    salaryCurrency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
    },
    applicationStatus: {
      type: String,
      enum: [
        'Wishlist',
        'Applied',
        'Screening',
        'Interview',
        'Technical Assessment',
        'Offer',
        'Rejected',
        'Withdrawn',
      ],
      default: 'Applied',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
JobApplicationSchema.index({ companyName: 'text', jobTitle: 'text', jobLocation: 'text' });
JobApplicationSchema.index({ applicationStatus: 1, applicationDate: -1 });

export const JobApplication = mongoose.model<IJobApplication>(
  'JobApplication',
  JobApplicationSchema
);
