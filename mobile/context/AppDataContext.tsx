import React, { createContext, useContext, useMemo, useState } from 'react';

export type SummaryLevel = 'Simple' | 'Standard' | 'Clinical';

export type VisitRecord = {
    id: string;
    title: string;
    doctor: string;
    date: string;
    transcript: string;
    summaries: {
        simple: string;
        standard: string;
        clinical: string;
    };
};

type AppDataContextType = {
    visits: VisitRecord[];
    addVisit: (visit: VisitRecord) => void;
    defaultSummaryLevel: SummaryLevel;
    setDefaultSummaryLevel: (level: SummaryLevel) => void;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [visits, setVisits] = useState<VisitRecord[]>([
        {
            id: '1',
            title: 'Annual Physical',
            doctor: 'Dr. Gupta',
            date: 'Feb 26',
            transcript: 'Routine annual physical visit.',
            summaries: {
                simple: 'This was a routine annual physical visit.',
                standard: 'Routine annual physical visit completed.',
                clinical: 'Patient seen for routine annual physical examination.',
            },
        },
        {
            id: '2',
            title: 'Sore Throat Visit',
            doctor: 'Dr. Chen',
            date: 'Mar 10',
            transcript: 'Visit for sore throat symptoms.',
            summaries: {
                simple: 'This visit was about a sore throat.',
                standard: 'Patient presented with sore throat symptoms.',
                clinical: 'Patient evaluated for sore throat.',
            },
        },
    ]);

    const [defaultSummaryLevel, setDefaultSummaryLevel] =
        useState<SummaryLevel>('Simple');

    const value = useMemo(
        () => ({
            visits,
            addVisit: (visit: VisitRecord) => {
                setVisits((prev) => [visit, ...prev]);
            },
            defaultSummaryLevel,
            setDefaultSummaryLevel,
        }),
        [visits, defaultSummaryLevel]
    );

    return (
        <AppDataContext.Provider value={value}>
            {children}
        </AppDataContext.Provider>
    );
}

export function useAppData() {
    const context = useContext(AppDataContext);

    if (!context) {
        throw new Error('useAppData must be used inside AppDataProvider');
    }

    return context;
}