# 🎯 COMPLETE JOB MANAGEMENT SYSTEM - IMPLEMENTATION PLAN

## 📊 CURRENT STATUS (What's Already Built)

### ✅ FULLY IMPLEMENTED:

#### 1. JOB CREATION + TYPES ✓
**Status: 100% Complete**
- ✅ Job creation modal with all fields
- ✅ Three job types: measurement, installation, task
- ✅ Date/time picker
- ✅ Customer creation (new or existing)
- ✅ Employee assignment
- ✅ Business assignment
- ✅ Full form validation

**Location:** `src/components/Jobs/CreateJobModal.tsx`

#### 2. EMPLOYEE MEASUREMENT FLOW ✓
**Status: 100% Complete**
- ✅ Start job button
- ✅ Step 1: Product selection with AR
- ✅ Step 2: Measurements with photos (camera + upload)
- ✅ Step 3: Invoice sending
- ✅ Step 4: Auto-duplication to installation job
- ✅ TBD logic (quotation screen has TBD button)
- ✅ Job history tracking

**Location:** `src/components/Jobs/JobWorkflow.tsx`

#### 3. INSTALLATION FLOW ✓
**Status: 90% Complete**
- ✅ 6-step installation workflow:
  1. Order confirmation
  2. Installation photos
  3. Customer signature
  4. Payment collection
  5. Invoice generation
  6. Job completion
- ✅ All steps functional
- ⚠️ Needs: Completion locking

**Location:** `src/components/Jobs/InstallationJobScreen.tsx`

#### 4. JOB HISTORY ✓
**Status: 100% Complete**
- ✅ Job history array in Job type
- ✅ Events tracked throughout workflow
- ✅ Timestamp + user + action + description
- ✅ Displayed in job details

**Location:** Throughout all job components

#### 5. PHOTO CAPTURE ✓
**Status: 100% Complete**
- ✅ Camera integration
- ✅ Gallery upload
- ✅ Multiple photos per measurement
- ✅ Photo management (view, delete)
- ✅ Photos stored in database

---

## 🔨 NEEDS TO BE ADDED:

### 1. AUTOMATED / MANUAL BOOKING LOGIC
**Status: 30% Complete - NEEDS WORK**

#### What Exists:
- ✅ Business settings interface exists
- ✅ `bookingMode` field in BusinessSettings type
- ⚠️ No actual toggle UI implemented
- ⚠️ No auto-allocation logic

#### What Needs to Be Added:

**A. Business Settings Toggle:**
```typescript
// Add to BusinessSettings component
<div className="setting-card">
  <h3>Booking Mode</h3>
  <div className="toggle-group">
    <button
      className={bookingMode === 'automated' ? 'active' : ''}
      onClick={() => setBookingMode('automated')}
    >
      Automated Booking
    </button>
    <button
      className={bookingMode === 'manual' ? 'active' : ''}
      onClick={() => setBookingMode('manual')}
    >
      Manual Assignment
    </button>
  </div>

  {bookingMode === 'automated' && (
    <p className="info">
      Jobs will be automatically assigned to available employees
      based on their working hours and current workload.
    </p>
  )}

  {bookingMode === 'manual' && (
    <p className="info">
      Jobs will remain unassigned until manually allocated by
      business users. Employees can see all unassigned jobs.
    </p>
  )}
</div>
```

**B. Auto-Allocation Algorithm:**
```typescript
// New file: src/services/JobAllocationService.ts

export class JobAllocationService {
  /**
   * Auto-allocate job to best available employee
   */
  static async autoAllocateJob(job: Job, employees: User[], workingHours: EmployeeWorkingHours[]) {
    const jobDate = new Date(job.scheduledDate);
    const dayOfWeek = jobDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // 1. Filter employees available on that day
    const availableEmployees = employees.filter(emp => {
      const hours = workingHours.find(h => h.userId === emp.id);
      if (!hours) return false;
      return hours[dayOfWeek]?.available === true;
    });

    // 2. Check if scheduled time fits within working hours
    const eligibleEmployees = availableEmployees.filter(emp => {
      const hours = workingHours.find(h => h.userId === emp.id);
      const dayHours = hours[dayOfWeek];

      const jobTime = job.scheduledTime;
      return jobTime >= dayHours.start && jobTime <= dayHours.end;
    });

    // 3. Get employee with least jobs on that date
    const employeeWorkload = await this.getEmployeeWorkload(eligibleEmployees, jobDate);

    // 4. Sort by workload (ascending)
    const sorted = employeeWorkload.sort((a, b) => a.count - b.count);

    // 5. Assign to employee with least workload
    if (sorted.length > 0) {
      return sorted[0].employeeId;
    }

    return null; // No available employee
  }

  /**
   * Get workload for employees on specific date
   */
  static async getEmployeeWorkload(employees: User[], date: Date) {
    // Query jobs table to count jobs per employee on this date
    const workload = [];

    for (const emp of employees) {
      const count = await this.countJobsForEmployee(emp.id, date);
      workload.push({ employeeId: emp.id, count });
    }

    return workload;
  }

  /**
   * Count jobs for employee on specific date
   */
  static async countJobsForEmployee(employeeId: string, date: Date) {
    // Query Supabase
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', employeeId)
      .eq('scheduled_date', date.toISOString().split('T')[0])
      .not('status', 'eq', 'cancelled');

    return count || 0;
  }
}
```

**C. Job Visibility Control:**
```typescript
// Update JobManagement component

// If manual mode: Show all unassigned jobs to employees
// If automated mode: Only show assigned jobs to employees

const getVisibleJobs = (jobs: Job[], user: User, bookingMode: string) => {
  if (user.role === 'business' || user.role === 'admin') {
    // Business/Admin sees all jobs
    return jobs;
  }

  if (user.role === 'employee') {
    if (bookingMode === 'manual') {
      // Manual: Show unassigned + my assigned jobs
      return jobs.filter(j =>
        j.employeeId === null ||
        j.employeeId === user.id
      );
    } else {
      // Automated: Only show my assigned jobs
      return jobs.filter(j => j.employeeId === user.id);
    }
  }

  return jobs;
};
```

---

### 2. CUSTOM TASK JOB FLOW
**Status: 50% Complete - NEEDS WORK**

#### What Exists:
- ✅ 'task' job type in types
- ✅ Task name field in job creation
- ✅ Task appears in job list

#### What Needs to Be Added:

**A. Task Workflow Screen:**
```typescript
// New file: src/components/Jobs/TaskJobScreen.tsx

export function TaskJobScreen({ job, onComplete }: TaskJobScreenProps) {
  const [completionComment, setCompletionComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  return (
    <div className="task-job-screen">
      <div className="task-header">
        <h2>{job.title}</h2>
        <p className="description">{job.description}</p>
      </div>

      {/* Task Details */}
      <div className="task-details">
        <div className="detail-row">
          <label>Customer:</label>
          <span>{job.customerId}</span>
        </div>
        <div className="detail-row">
          <label>Scheduled:</label>
          <span>{job.scheduledDate} at {job.scheduledTime}</span>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="photo-section">
        <h3>Task Photos (Optional)</h3>
        <PhotoCapture
          photos={photos}
          onPhotosChange={setPhotos}
        />
      </div>

      {/* Completion Comment */}
      <div className="completion-section">
        <h3>Completion Notes *</h3>
        <textarea
          value={completionComment}
          onChange={(e) => setCompletionComment(e.target.value)}
          placeholder="Describe what was completed..."
          rows={5}
          required
        />
      </div>

      {/* Complete Button */}
      <button
        onClick={() => {
          if (!completionComment) {
            alert('Please add completion notes');
            return;
          }
          onComplete({
            status: 'completed',
            completionComment,
            photos,
            completedDate: new Date().toISOString()
          });
        }}
        className="complete-btn"
      >
        Complete Task
      </button>
    </div>
  );
}
```

**B. Update JobWorkflow for Tasks:**
```typescript
// In JobWorkflow.tsx

const renderTaskWorkflow = () => {
  return (
    <TaskJobScreen
      job={job}
      onComplete={(data) => {
        onUpdateJob({
          ...data,
          jobHistory: [...job.jobHistory, {
            id: `history-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'task_completed',
            description: data.completionComment,
            userId: user?.id || '',
            userName: user?.name || ''
          }]
        });
        setCurrentStep('complete');
      }}
    />
  );
};

// In main render
if (job.jobType === 'task') {
  return renderTaskWorkflow();
}
```

---

### 3. BUSINESS SETTINGS ENHANCEMENTS
**Status: 60% Complete - NEEDS WORK**

#### What Needs to Be Added:

**A. Template Upload:**
```typescript
// Add to BusinessSettings component

<div className="templates-section">
  <h3>Invoice & Quotation Templates</h3>

  {/* Quotation Template */}
  <div className="template-upload">
    <label>Quotation Template (HTML)</label>
    <input
      type="file"
      accept=".html"
      onChange={handleQuotationTemplateUpload}
    />
    {quotationTemplate && (
      <div className="template-preview">
        <p>Current: {quotationTemplate.name}</p>
        <button onClick={() => setQuotationTemplate(null)}>Remove</button>
      </div>
    )}
  </div>

  {/* Invoice Template */}
  <div className="template-upload">
    <label>Invoice Template (HTML)</label>
    <input
      type="file"
      accept=".html"
      onChange={handleInvoiceTemplateUpload}
    />
    {invoiceTemplate && (
      <div className="template-preview">
        <p>Current: {invoiceTemplate.name}</p>
        <button onClick={() => setInvoiceTemplate(null)}>Remove</button>
      </div>
    )}
  </div>
</div>
```

**B. Deposit Configuration:**
```typescript
<div className="deposit-config">
  <h3>Deposit Settings</h3>

  <div className="form-group">
    <label>Default Deposit Percentage</label>
    <input
      type="number"
      min="0"
      max="100"
      value={depositPercentage}
      onChange={(e) => setDepositPercentage(Number(e.target.value))}
    />
    <span className="unit">%</span>
  </div>

  <div className="form-group">
    <label>
      <input
        type="checkbox"
        checked={requireDeposit}
        onChange={(e) => setRequireDeposit(e.target.checked)}
      />
      Require deposit for all jobs
    </label>
  </div>

  <p className="help-text">
    Deposits will be calculated automatically based on job quotation.
    Example: 30% deposit on $1000 = $300 upfront
  </p>
</div>
```

---

### 4. ADDITIONAL ENHANCEMENTS NEEDED:

**A. Completion Locking:**
```typescript
// Add to completed jobs
if (job.status === 'completed') {
  return (
    <div className="job-locked">
      <Lock className="lock-icon" />
      <h3>Job Completed</h3>
      <p>This job was completed on {job.completedDate}</p>
      <p>Completed by: {job.completedBy}</p>

      <div className="completed-details">
        <h4>Final Details:</h4>
        <ul>
          <li>Total Amount: ${job.totalAmount}</li>
          <li>Payment Status: {job.paymentStatus}</li>
          <li>Invoice Sent: {job.invoiceSent ? 'Yes' : 'No'}</li>
        </ul>
      </div>

      {/* View-only mode */}
      <button onClick={onViewDetails}>View Details (Read-Only)</button>
    </div>
  );
}
```

**B. TBD Logic Enhancement:**
```typescript
// Already exists in QuotationScreen.tsx
// Just document it clearly

// TBD Button saves job as 'tbd' status
onCancel={() => {
  onUpdateJob({
    status: 'tbd',
    jobHistory: [...job.jobHistory, {
      action: 'quotation_tbd',
      description: 'Customer still deciding on quotation'
    }]
  });
  onClose();
}}

// Business can reopen TBD jobs later
if (job.status === 'tbd') {
  <button onClick={reopenJob}>Resume Job</button>
}
```

---

## 📋 IMPLEMENTATION PRIORITY

### HIGH PRIORITY (Implement First):
1. ✅ **Automated/Manual Booking Toggle** - Add UI toggle in business settings
2. ✅ **Auto-Allocation Algorithm** - Create JobAllocationService
3. ✅ **Job Visibility Control** - Filter jobs based on booking mode
4. ✅ **Task Job Workflow** - Create TaskJobScreen component

### MEDIUM PRIORITY (Implement Second):
5. ✅ **Template Upload** - Add HTML template upload to business settings
6. ✅ **Deposit Configuration** - Add deposit percentage settings
7. ✅ **Completion Locking** - Lock completed jobs from editing

### LOW PRIORITY (Nice to Have):
8. ⚠️ Email notifications for auto-assigned jobs
9. ⚠️ SMS notifications
10. ⚠️ Calendar sync
11. ⚠️ Mobile app

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Add Booking Mode Toggle
```bash
1. Update BusinessSettings.tsx
2. Add toggle UI for automated/manual
3. Save to database
4. Test toggle functionality
```

### Step 2: Create Auto-Allocation Service
```bash
1. Create JobAllocationService.ts
2. Implement auto-allocation algorithm
3. Check employee working hours
4. Check employee workload
5. Assign to best employee
6. Test with multiple employees
```

### Step 3: Update Job Creation
```bash
1. When job created, check booking mode
2. If automated: Call autoAllocateJob()
3. If manual: Leave employeeId as null
4. Show appropriate message to user
```

### Step 4: Update Job Visibility
```bash
1. Update JobManagement.tsx
2. Filter jobs based on user role + booking mode
3. Employees in manual mode see unassigned jobs
4. Employees in automated mode see only their jobs
5. Business/Admin always see all jobs
```

### Step 5: Create Task Workflow
```bash
1. Create TaskJobScreen.tsx
2. Add description display
3. Add photo capture
4. Add completion comment field
5. Add complete button
6. Test task completion
```

### Step 6: Add Templates & Deposit Config
```bash
1. Add template upload to BusinessSettings
2. Store templates in database
3. Add deposit percentage config
4. Use templates in quotation/invoice generation
5. Calculate deposits automatically
```

---

## 🧪 TESTING CHECKLIST

### Test Automated Booking:
- [ ] Set booking mode to "automated"
- [ ] Create new job
- [ ] System auto-assigns to employee with:
  - [ ] Availability on that day
  - [ ] Working hours match scheduled time
  - [ ] Lowest workload
- [ ] Employee sees job in their list
- [ ] Other employees don't see this job

### Test Manual Booking:
- [ ] Set booking mode to "manual"
- [ ] Create new job (unassigned)
- [ ] All employees see unassigned job
- [ ] Business assigns job manually
- [ ] Only assigned employee sees it now

### Test Task Job:
- [ ] Create task job with description
- [ ] Employee opens task
- [ ] See description clearly
- [ ] Upload photos
- [ ] Add completion comment
- [ ] Click complete
- [ ] Job marked completed with comment

### Test Deposit Configuration:
- [ ] Set deposit to 30%
- [ ] Create job with $1000 quotation
- [ ] System calculates $300 deposit
- [ ] Employee collects deposit
- [ ] Final payment = $700

---

## 📊 DATABASE UPDATES NEEDED

### 1. Business Settings Table:
```sql
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS booking_mode TEXT DEFAULT 'manual';

ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER DEFAULT 30;

ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS quotation_template_id UUID;

ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS invoice_template_id UUID;
```

### 2. Jobs Table:
```sql
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS completion_comment TEXT;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS completed_by UUID;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT FALSE;
```

### 3. Templates Table:
```sql
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'quotation' or 'invoice'
  html_content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ SUMMARY

### What's Already Perfect:
- ✅ Job creation with 3 types
- ✅ Employee measurement flow (products → measurements → invoice → duplicate)
- ✅ Installation 6-step workflow
- ✅ Photo capture everywhere
- ✅ Job history tracking
- ✅ TBD logic in quotations

### What Needs to Be Added:
1. **Booking mode toggle** (automated vs manual)
2. **Auto-allocation algorithm** based on working hours + workload
3. **Job visibility control** based on booking mode
4. **Task job workflow** with completion comments
5. **Template uploads** for quotations and invoices
6. **Deposit configuration** with percentage
7. **Completion locking** for finished jobs

### Estimated Implementation Time:
- Booking mode + auto-allocation: **4-6 hours**
- Task workflow: **2-3 hours**
- Templates + deposits: **2-3 hours**
- Completion locking: **1-2 hours**
- **Total: 9-14 hours of development**

---

**All of this is achievable! The foundation is solid, we just need to add these specific features.** 🚀

Would you like me to start implementing these features one by one?
