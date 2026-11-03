export type RecordStatus = "active" | "pending" | "approved" | "rejected" | "inactive" | "draft" | "paid" | "overdue";

export type DemoIndicator = { id: string; label: string; value: number | string; change?: string; direction?: "up" | "down"; caption?: string };
export type DemoRecord = { id: string; title: string; description?: string; status: RecordStatus; createdAt: string; updatedAt?: string; [field: string]: unknown };
export type DemoActivity = { id: string; title: string; description?: string; date: string; actor?: string; type?: string };
export type DemoMovement = { id: string; date: string; description: string; reference?: string; amount: number; direction: "income" | "expense"; status: RecordStatus };
export type DemoPerson = { id: string; fullName: string; documentId?: string; email?: string; phone?: string; status: RecordStatus; familyId?: string };
export type DemoRequest = { id: string; type: string; requester: string; submittedAt: string; status: RecordStatus; notes?: string };

export type DemoDataset = {
  indicators: DemoIndicator[];
  records: DemoRecord[];
  activities: DemoActivity[];
  movements: DemoMovement[];
  people: DemoPerson[];
  requests: DemoRequest[];
};
