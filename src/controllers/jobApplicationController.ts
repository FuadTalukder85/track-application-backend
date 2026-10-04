import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { JobApplication } from '../models/JobApplication';
import { AppError } from '../middlewares/errorHandler';

// @desc    Create a new job application
// @route   POST /api/applications
export const createApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      companyName,
      jobTitle,
      jobDescription,
      jobRequirements,
      jobLocation,
      jobType,
      workMode,
      jobPostingUrl,
      applicationDate,
      salaryRange,
      expectedSalary,
      currentSalary,
      offeredSalary,
      salaryCurrency,
      applicationStatus,
      notes,
    } = req.body;

    if (!companyName || !companyName.trim()) {
      return next(new AppError('Company name is required', 400));
    }
    if (!jobTitle || !jobTitle.trim()) {
      return next(new AppError('Job title is required', 400));
    }

    const application = await JobApplication.create({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription?.trim() || '',
      jobRequirements: jobRequirements?.trim() || '',
      jobLocation: jobLocation?.trim() || '',
      jobType: jobType || 'Full-time',
      workMode: workMode || 'Remote',
      jobPostingUrl: jobPostingUrl?.trim() || '',
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      salaryRange: salaryRange?.trim() || '',
      expectedSalary: expectedSalary ? Number(expectedSalary) : null,
      currentSalary: currentSalary ? Number(currentSalary) : null,
      offeredSalary: offeredSalary ? Number(offeredSalary) : null,
      salaryCurrency: (salaryCurrency || 'USD').toUpperCase().trim(),
      applicationStatus: applicationStatus || 'Applied',
      notes: notes?.trim() || '',
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Job application created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all job applications with filtering, search & sorting
// @route   GET /api/applications
export const getApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      status,
      jobType,
      workMode,
      sortBy = 'applicationDate',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const filter: Record<string, any> = {};

    // Search query for company name, job title, notes or location
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { companyName: searchRegex },
        { jobTitle: searchRegex },
        { jobLocation: searchRegex },
        { notes: searchRegex },
        { jobRequirements: searchRegex },
      ];
    }

    // Exact filters
    if (status && typeof status === 'string' && status !== 'all') {
      filter.applicationStatus = status;
    }
    if (jobType && typeof jobType === 'string' && jobType !== 'all') {
      filter.jobType = jobType;
    }
    if (workMode && typeof workMode === 'string' && workMode !== 'all') {
      filter.workMode = workMode;
    }

    const sortOptions: Record<string, 1 | -1> = {};
    const sortField = typeof sortBy === 'string' ? sortBy : 'applicationDate';
    const order = sortOrder === 'asc' ? 1 : -1;
    sortOptions[sortField] = order;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      JobApplication.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      JobApplication.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      count: applications.length,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job application by ID
// @route   GET /api/applications/:id
export const getApplicationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid application ID', 400));
    }

    const application = await JobApplication.findById(id);

    if (!application) {
      return next(new AppError('Job application not found', 404));
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job application
// @route   PUT /api/applications/:id, PATCH /api/applications/:id
export const updateApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid application ID', 400));
    }

    const updatePayload: Record<string, any> = { ...req.body };

    if (updatePayload.expectedSalary !== undefined) {
      updatePayload.expectedSalary = updatePayload.expectedSalary ? Number(updatePayload.expectedSalary) : null;
    }
    if (updatePayload.currentSalary !== undefined) {
      updatePayload.currentSalary = updatePayload.currentSalary ? Number(updatePayload.currentSalary) : null;
    }
    if (updatePayload.offeredSalary !== undefined) {
      updatePayload.offeredSalary = updatePayload.offeredSalary ? Number(updatePayload.offeredSalary) : null;
    }
    if (updatePayload.salaryCurrency) {
      updatePayload.salaryCurrency = String(updatePayload.salaryCurrency).toUpperCase().trim();
    }
    if (updatePayload.applicationDate) {
      updatePayload.applicationDate = new Date(updatePayload.applicationDate);
    }

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!application) {
      return next(new AppError('Job application not found', 404));
    }

    res.status(200).json({
      success: true,
      data: application,
      message: 'Job application updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job application
// @route   DELETE /api/applications/:id
export const deleteApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid application ID', 400));
    }

    const application = await JobApplication.findByIdAndDelete(id);

    if (!application) {
      return next(new AppError('Job application not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { id: application._id },
      message: 'Job application deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics (total counts, status breakdowns)
// @route   GET /api/applications/stats
export const getApplicationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const total = await JobApplication.countDocuments();

    const statusCounts = await JobApplication.aggregate([
      {
        $group: {
          _id: '$applicationStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStatusCounts: Record<string, number> = {
      Wishlist: 0,
      Applied: 0,
      Screening: 0,
      Interview: 0,
      'Technical Assessment': 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0,
    };

    statusCounts.forEach((item) => {
      if (item._id) {
        formattedStatusCounts[item._id] = item.count;
      }
    });

    const workModeCounts = await JobApplication.aggregate([
      {
        $group: {
          _id: '$workMode',
          count: { $sum: 1 },
        },
      },
    ]);

    const jobTypeCounts = await JobApplication.aggregate([
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        statusCounts: formattedStatusCounts,
        workModeCounts,
        jobTypeCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};
