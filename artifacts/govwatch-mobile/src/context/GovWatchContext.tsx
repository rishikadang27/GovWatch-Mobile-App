import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { checklistItems, evidenceSeed, institutes, type Institute } from '@/src/data/mock';

type Evidence = { id: string; title: string; image: number | { uri: string }; time: string; coords: string };
type GovWatchContextValue = {
  isSignedIn: boolean;
  setSignedIn: (value: boolean) => void;
  keepSignedIn: boolean;
  setKeepSignedIn: (value: boolean) => void;
  checklist: boolean[];
  toggleChecklist: (index: number) => void;
  evidence: Evidence[];
  addEvidence: (item: Evidence) => void;
  assignedInstitutes: Institute[];
  assignInstitute: (id: string, officer: string) => void;
  submitted: boolean;
  setSubmitted: (value: boolean) => void;
};

const GovWatchContext = createContext<GovWatchContextValue | null>(null);

export function GovWatchProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setSignedInState] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [checklist, setChecklist] = useState<boolean[]>(() => checklistItems.map(() => true));
  const [evidence, setEvidence] = useState<Evidence[]>(evidenceSeed);
  const [assignedInstitutes, setAssignedInstitutes] = useState(institutes);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('govwatch-signed-in').then((value) => {
      if (value === 'true') setSignedInState(true);
    });
  }, []);

  const setSignedIn = (value: boolean) => {
    setSignedInState(value);
    if (value && keepSignedIn) void AsyncStorage.setItem('govwatch-signed-in', 'true');
    if (!value) void AsyncStorage.removeItem('govwatch-signed-in');
  };

  const toggleChecklist = (index: number) => {
    setChecklist((current) => current.map((item, itemIndex) => itemIndex === index ? !item : item));
  };

  const addEvidence = (item: Evidence) => setEvidence((current) => [...current, item]);

  const assignInstitute = (id: string, officer: string) => {
    setAssignedInstitutes((current) => current.map((item) => item.id === id ? { ...item, assignedTo: officer } : item));
  };

  const value = useMemo(() => ({
    isSignedIn, setSignedIn, keepSignedIn, setKeepSignedIn, checklist, toggleChecklist,
    evidence, addEvidence, assignedInstitutes, assignInstitute, submitted, setSubmitted,
  }), [isSignedIn, keepSignedIn, checklist, evidence, assignedInstitutes, submitted]);

  return <GovWatchContext.Provider value={value}>{children}</GovWatchContext.Provider>;
}

export function useGovWatch() {
  const context = useContext(GovWatchContext);
  if (!context) throw new Error('useGovWatch must be used within GovWatchProvider');
  return context;
}