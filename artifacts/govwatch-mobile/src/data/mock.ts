import hallImage from '../../assets/images/shelter-hall.jpg';
import dormitoryImage from '../../assets/images/dormitory.jpg';
import entranceImage from '../../assets/images/entrance.jpg';

export type Risk = 'High' | 'Medium' | 'Low';
export type AlertSeverity = 'Critical' | 'High' | 'Medium';

export type Feed = {
  id: string;
  name: string;
  institute: string;
  status: 'Live' | 'Offline' | 'AI Flagged';
  time: string;
  image: number;
  note?: string;
};

export type Alert = {
  id: string;
  title: string;
  institute: string;
  severity: AlertSeverity;
  description: string;
  time: string;
  confidence: number;
  image: number;
};

export type Institute = {
  id: string;
  name: string;
  district: string;
  riskScore: number;
  lastInspection: string;
  priority: Risk;
  assignedTo: string;
};

export const feeds: Feed[] = [
  { id: 'hall', name: 'Main hall', institute: 'Rukmini Shelter Home for Women', status: 'Live', time: '10:42 IST', image: hallImage },
  { id: 'dorm', name: 'Dormitory', institute: 'Rukmini Shelter Home for Women', status: 'Live', time: '10:42 IST', image: dormitoryImage },
  { id: 'gate', name: 'Entrance', institute: 'Prakash Old Age Care Centre', status: 'Live', time: '10:42 IST', image: entranceImage },
  { id: 'dining', name: 'Dining hall', institute: 'Rukmini Shelter Home for Women', status: 'AI Flagged', time: '10:42 IST', image: hallImage, note: 'Meal service active' },
];

export const alerts: Alert[] = [
  { id: 'a1', title: 'CCTV feed offline for 6+ hours', institute: 'Nirmal Jyoti Disability Rehab Centre', severity: 'Critical', description: 'Camera-03-DORM has not reported a signal since 03:12 IST. No maintenance ticket was raised by the institute administration.', time: '6 Sept 2026 05:37 PM', confidence: 96, image: hallImage },
  { id: 'a2', title: 'Beneficiary headcount mismatch', institute: 'Rukmini Shelter Home for Women', severity: 'Critical', description: 'CCTV person-count (31) is significantly lower than the declared attendance register (42) for three consecutive days.', time: '6 Sept 2026 03:48 PM', confidence: 91, image: dormitoryImage },
  { id: 'a3', title: 'Unregistered visitor after hours', institute: 'Nambikkai De-addiction Centre', severity: 'High', description: 'Entrance camera detected movement at 01:40 IST with no matching entry in the visitor log.', time: '6 Sept 2026 01:40 PM', confidence: 87, image: entranceImage },
  { id: 'a4', title: 'Staff attendance below sanctioned ratio', institute: 'Nirmal Jyoti Disability Rehab Centre', severity: 'High', description: 'Only 6 of 10 sanctioned staff have logged in today, falling below the mandated caregiver ratio.', time: '5 Sept 2026 11:22 AM', confidence: 74, image: hallImage },
  { id: 'a5', title: 'Unusual movement detected', institute: 'Asha Deep Childrens Home', severity: 'Medium', description: 'AI detected unusual movement in the restricted zone near the back gate.', time: '5 Sept 2026 09:15 AM', confidence: 68, image: entranceImage },
];

export const institutes: Institute[] = [
  { id: 'MSJE/DL/00231', name: 'Rukmini Shelter Home for Women', district: 'Dwarka, Delhi', riskScore: 78, lastInspection: '12 Aug 2026', priority: 'High', assignedTo: 'Anjali Kapoor' },
  { id: 'MSJE/TN/00811', name: 'Nambikkai De-addiction Centre', district: 'Coimbatore, TN', riskScore: 54, lastInspection: '18 Jul 2026', priority: 'Medium', assignedTo: 'Unassigned' },
  { id: 'MSJE/WB/00142', name: 'Nirmal Jyoti Disability Rehab Centre', district: 'Kolkata, WB', riskScore: 83, lastInspection: '04 Jun 2026', priority: 'High', assignedTo: 'Ravi Menon' },
  { id: 'MSJE/KA/00462', name: 'Snehalaya Child Development Centre', district: 'Bengaluru, Karnataka', riskScore: 46, lastInspection: '02 Aug 2026', priority: 'Medium', assignedTo: 'Unassigned' },
];

export const officers = ['Unassigned', 'Anjali Kapoor', 'Ravi Menon', 'Priya Shah', 'Karan Malik'];

export const checklistItems = [
  'Staff member on duty matches roster',
  'Beneficiaries visible & accounted for',
  'Premises match registered address',
  'No visible safety violations',
  'CCTV cameras operational on-site',
  'Staff present matches sanctioned roster',
  'Attendance register maintained and up to date',
];

export const evidenceSeed = [
  { id: 'e1', title: 'Main entrance', image: entranceImage, time: '05:42 PM', coords: '28.6139° N, 77.2090° E' },
  { id: 'e2', title: 'Beneficiary area', image: hallImage, time: '05:47 PM', coords: '28.6141° N, 77.2088° E' },
  { id: 'e3', title: 'Records room', image: dormitoryImage, time: '05:52 PM', coords: '28.6137° N, 77.2092° E' },
];