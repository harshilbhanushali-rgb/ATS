

import React, { useState, useMemo } from 'react';
import { Candidate, CandidateOutreachLog, CandidateSource, CandidateStage, Interview, RequisitionStatus, Requisition, UserRole } from '../types';
import Card from './Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useAppData } from '../contexts/AppDataContext';
import { useAuthContext } from '../contexts/AuthContext';

type DateRangeOption = 'all_time' | 'last_7_days' | 'last_30_days';

const COLORS_SOURCE_CHANNEL = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D', '#A4DE6C', '#D0ED57', '#FFC658'];
const COLORS_HIRE_SOURCE = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#22aa99', '#77aaff'];


const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200 text-sm">
        <p className="font-semibold text-gray-800">{`${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value?.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const KpiCard: React.FC<{ title: string; value: string | number; description: string; subText?: string }> = ({ title, value, description, subText }) => (
  <Card title={title} className="shadow-lg hover:shadow-xl transition-shadow">
    <p className="text-3xl font-bold text-indigo-600">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
    {subText && <p className="text-xs text-gray-400 mt-0.5">{subText}</p>}
  </Card>
);

const HANDOFF_STAGES: CandidateStage[] = [
    CandidateStage.SCREENING, 
    CandidateStage.SHORTLISTED, 
];

const SourcerDashboardView: React.FC = () => {
  const { candidates: allCandidates, candidateOutreachLogs, interviews: allInterviews, requisitions: allRequisitions } = useAppData();
  const { loggedInUser, users } = useAuthContext();
  const isAdmin = loggedInUser.role === UserRole.ADMIN;
  const sourcerUsers = useMemo(
    () => users.filter(u => u.role === UserRole.SOURCER || u.role === UserRole.LEAD_RECRUITER),
    [users]
  );
  const [selectedSourcerId, setSelectedSourcerId] = useState<string>(loggedInUser.id);
  const sourcerId = selectedSourcerId;
  const sourcerName = useMemo(
    () => users.find(u => u.id === sourcerId)?.name ?? loggedInUser.name,
    [users, sourcerId, loggedInUser.name]
  );
  const [dateRange, setDateRange] = useState<DateRangeOption>('all_time');

  const sourcerMetrics = useMemo(() => {
    const dateFilter = (dateString?: string): boolean => {
      if (dateRange === 'all_time' || !dateString) return true;
      const date = new Date(dateString);
      const now = new Date();
      let startDate = new Date();

      if (dateRange === 'last_7_days') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'last_30_days') {
        startDate.setDate(now.getDate() - 30);
      }
      startDate.setHours(0,0,0,0); 
      now.setHours(23,59,59,999); 
      return date >= startDate && date <= now;
    };

    const relevantOutreachLogs = candidateOutreachLogs.filter(
      log => log.sourcerUserId === sourcerId && dateFilter(log.outreachDate)
    );

    const filteredSourcedCandidates = allCandidates.filter(
      c => c.sourcedByUserId === sourcerId && dateFilter(c.sourcedDate)
    );
    const totalSourcedInPeriod = filteredSourcedCandidates.length;

    const uniqueContactedCandidateIdsFromLogs = new Set(relevantOutreachLogs.map(log => log.candidateId));
    const sourcingChannelVolume = filteredSourcedCandidates.reduce((acc, candidate) => {
      const source = candidate.source || CandidateSource.OTHER;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<CandidateSource, number>);
    const sourcingChannelChartData = Object.entries(sourcingChannelVolume)
      .map(([name, value]) => ({ name, count: value }))
      .sort((a, b) => Number(b.count) - Number(a.count));

    const respondedCandidateIds = new Set(relevantOutreachLogs.filter(log => log.responded).map(log => log.candidateId));
    const clickedLinkCandidateIds = new Set(relevantOutreachLogs.filter(log => log.clickedLink).map(log => log.candidateId));
    const responseRate = uniqueContactedCandidateIdsFromLogs.size > 0 ? ((respondedCandidateIds.size / uniqueContactedCandidateIdsFromLogs.size) * 100).toFixed(1) + '%' : '0%';
    const clickThroughRate = uniqueContactedCandidateIdsFromLogs.size > 0 ? ((clickedLinkCandidateIds.size / uniqueContactedCandidateIdsFromLogs.size) * 100).toFixed(1) + '%' : '0%';
    const engagedSourcedAndContactedCandidates = allCandidates.filter(candidate =>
        candidate.sourcedByUserId === sourcerId && 
        uniqueContactedCandidateIdsFromLogs.has(candidate.id) && 
        candidate.stage !== CandidateStage.APPLIED 
    ).length;
    const sourcedCandidateEngagementRate = uniqueContactedCandidateIdsFromLogs.size > 0 ? ((engagedSourcedAndContactedCandidates / uniqueContactedCandidateIdsFromLogs.size) * 100).toFixed(1) + '%' : '0%';

    const screeningAndLaterStages: CandidateStage[] = [CandidateStage.SCREENING, CandidateStage.SHORTLISTED, CandidateStage.INTERVIEW_ROUND_1, CandidateStage.INTERVIEW_ROUND_2, CandidateStage.INTERVIEW_ROUND_3, CandidateStage.INTERVIEW_ROUND_4, CandidateStage.HM_DECISION_PENDING, CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED, CandidateStage.HIRED];
    const interviewAndLaterStages: CandidateStage[] = [CandidateStage.INTERVIEW_ROUND_1, CandidateStage.INTERVIEW_ROUND_2, CandidateStage.INTERVIEW_ROUND_3, CandidateStage.INTERVIEW_ROUND_4, CandidateStage.HM_DECISION_PENDING, CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED, CandidateStage.HIRED];
    const offerAndLaterStages: CandidateStage[] = [CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED, CandidateStage.HIRED];
    const hiredStages: CandidateStage[] = [CandidateStage.HIRED, CandidateStage.OFFER_ACCEPTED];

    const sourcedAndReachedScreening = filteredSourcedCandidates.filter(c => screeningAndLaterStages.includes(c.stage)).length;
    const sourcedToScreeningRate = totalSourcedInPeriod > 0 ? ((sourcedAndReachedScreening / totalSourcedInPeriod) * 100).toFixed(1) + '%' : '0%';
    const sourcedAndReachedInterview = filteredSourcedCandidates.filter(c => {
        const isInInterviewStage = interviewAndLaterStages.includes(c.stage);
        const hasManualInterview = allInterviews.some(i => i.candidateId === c.id);
        return isInInterviewStage || hasManualInterview;
    }).length;
    const screeningToInterviewRate = sourcedAndReachedScreening > 0 ? ((sourcedAndReachedInterview / sourcedAndReachedScreening) * 100).toFixed(1) + '%' : '0%';
    const sourcedAndReachedOffer = filteredSourcedCandidates.filter(c => offerAndLaterStages.includes(c.stage) && c.offerDetails).length;
    const sourcedToOfferRate = totalSourcedInPeriod > 0 ? ((sourcedAndReachedOffer / totalSourcedInPeriod) * 100).toFixed(1) + '%' : '0%';
    const sourcedAndHired = filteredSourcedCandidates.filter(c => hiredStages.includes(c.stage) && c.offerDetails).length;
    const sourcedToHireRate = totalSourcedInPeriod > 0 ? ((sourcedAndHired / totalSourcedInPeriod) * 100).toFixed(1) + '%' : '0%';
    const hiredSourcedCandidatesDetails = filteredSourcedCandidates.filter(c => hiredStages.includes(c.stage) && c.offerDetails);
    const sourceOfHireCounts = hiredSourcedCandidatesDetails.reduce((acc, candidate) => {
        const source = candidate.source || CandidateSource.OTHER;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {} as Record<CandidateSource, number>);
    const sourceOfHireForSourcedChartData = Object.entries(sourceOfHireCounts).map(([name, value]) => ({ name, count: value })).sort((a,b) => Number(b.count) - Number(a.count));

    let totalDaysToSource = 0;
    let sourcedCandidatesWithHandoff = 0;
    filteredSourcedCandidates.forEach(candidate => {
        if (candidate.sourcedDate && candidate.stageHistory) {
            const handoffEntry = candidate.stageHistory
                .filter(entry => HANDOFF_STAGES.includes(entry.stage))
                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
            
            if (handoffEntry) {
                const sourcedDate = new Date(candidate.sourcedDate);
                const handoffDate = new Date(handoffEntry.date);
                const diffTime = Math.abs(handoffDate.getTime() - sourcedDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalDaysToSource += diffDays;
                sourcedCandidatesWithHandoff++;
            }
        }
    });
    const avgTimeToSource = sourcedCandidatesWithHandoff > 0 ? (totalDaysToSource / sourcedCandidatesWithHandoff).toFixed(1) : 'N/A';

    const activeRequisitionLoad = allRequisitions.filter(req => 
        req.reqStatus === RequisitionStatus.OPEN &&
        allCandidates.some(cand => 
            cand.requisitionId === req.id && 
            cand.sourcedByUserId === sourcerId &&
            dateFilter(cand.sourcedDate)
        )
    ).length;


    return {
      candidatesSourced: totalSourcedInPeriod,
      candidatesContacted: uniqueContactedCandidateIdsFromLogs.size,
      newProfilesAdded: totalSourcedInPeriod,
      sourcingChannelVolumeData: sourcingChannelChartData,
      responseRate,
      clickThroughRate,
      sourcedCandidateEngagementRate,
      sourcedToScreeningRate,
      screeningToInterviewRate,
      sourcedToOfferRate,
      sourcedToHireRate,
      sourceOfHireForSourcedChartData,
      avgTimeToSource,
      diversityOfSourced: "Data Capture TBD",
      candidateQualityScore: "Feedback System TBD",
      activeRequisitionLoad,
    };
  }, [allCandidates, candidateOutreachLogs, allInterviews, sourcerId, dateRange, allRequisitions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Sourcer Performance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Metrics for: <span className="font-semibold text-indigo-700">{sourcerName}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {isAdmin && sourcerUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="sourcerSelector" className="text-sm font-medium text-gray-700 whitespace-nowrap">View Sourcer:</label>
              <select
                id="sourcerSelector"
                value={selectedSourcerId}
                onChange={(e) => setSelectedSourcerId(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {sourcerUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label htmlFor="dateRangeFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">Date Range:</label>
            <select
              id="dateRangeFilter"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all_time">All Time</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Volume & Reach Metrics */}
      <Card title="Module 1: Volume & Reach Metrics (Sourcing Efforts)" bodyClassName="p-0">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard title="Candidates Sourced" value={sourcerMetrics.candidatesSourced} description="Total unique candidates identified and added by you in period." />
          <KpiCard title="Candidates Contacted" value={sourcerMetrics.candidatesContacted} description="Total unique candidates you contacted in period." />
          <KpiCard title="New Profiles Added to ATS" value={sourcerMetrics.newProfilesAdded} description="New candidate profiles added by you in period." />
        </div>
      </Card>

      <Card title="Sourcing Channel Volume (Candidates Sourced in Period)">
        {sourcerMetrics.sourcingChannelVolumeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sourcerMetrics.sourcingChannelVolumeData} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '10px' }} />
              <Bar dataKey="count" name="Candidates Sourced" radius={[4, 4, 0, 0]}>
                {sourcerMetrics.sourcingChannelVolumeData.map((entry, index) => ( <Cell key={`cell-vol-${index}`} fill={COLORS_SOURCE_CHANNEL[index % COLORS_SOURCE_CHANNEL.length]} /> ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : ( <p className="text-center text-gray-500 py-10">No sourcing channel data for selected period.</p> )}
      </Card>

      {/* Engagement & Response Metrics */}
      <Card title="Module 2: Engagement & Response Metrics (Effectiveness of Outreach)" bodyClassName="p-0">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard title="Response Rate" value={sourcerMetrics.responseRate} description="% of contacted candidates who responded in period." />
          <KpiCard title="Click-Through Rate (CTR)" value={sourcerMetrics.clickThroughRate} description="% of contacted candidates who clicked a link in period." subText="(Manually tracked)" />
          <KpiCard title="Sourced Candidate Engagement" value={sourcerMetrics.sourcedCandidateEngagementRate} description="% of sourced & contacted candidates past 'Applied' stage." />
        </div>
      </Card>

      {/* Conversion Metrics */}
      <Card title="Module 3: Conversion Metrics (Quality of Sourcing)" bodyClassName="p-0">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Sourced to Screening Ready" value={sourcerMetrics.sourcedToScreeningRate} description="% of sourced candidates reaching 'Screening' or later." />
          <KpiCard title="Screening Ready to Interview" value={sourcerMetrics.screeningToInterviewRate} description="% of 'Screening Ready' sourced candidates reaching interview." />
          <KpiCard title="Sourced to Offer" value={sourcerMetrics.sourcedToOfferRate} description="% of sourced candidates receiving an offer." />
          <KpiCard title="Sourced to Hire" value={sourcerMetrics.sourcedToHireRate} description="% of sourced candidates hired." />
        </div>
      </Card>
      
      <Card title="Source of Hire (for Sourced Candidates in Period)">
        {sourcerMetrics.sourceOfHireForSourcedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sourcerMetrics.sourceOfHireForSourcedChartData} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '10px' }} />
              <Bar dataKey="count" name="Hired Candidates" radius={[4, 4, 0, 0]}>
                {sourcerMetrics.sourceOfHireForSourcedChartData.map((entry, index) => ( <Cell key={`cell-hire-${index}`} fill={COLORS_HIRE_SOURCE[index % COLORS_HIRE_SOURCE.length]} /> ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : ( <p className="text-center text-gray-500 py-10">No hired sourced candidate data for this period.</p> )}
      </Card>

      {/* Efficiency & Quality Metrics */}
      <Card title="Module 4: Efficiency & Quality Metrics" bodyClassName="p-0">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Avg. Time to Source (Handoff)" 
            value={sourcerMetrics.avgTimeToSource !== 'N/A' ? `${sourcerMetrics.avgTimeToSource} days` : 'N/A'}
            description="Avg. time from sourcing to first handoff stage (e.g., Screening)." 
            subText={sourcerMetrics.avgTimeToSource === 'N/A' ? "Needs stage history data." : ""}
          />
          <KpiCard 
            title="Diversity of Sourced Candidates" 
            value={sourcerMetrics.diversityOfSourced} 
            description="Demographic breakdown of sourced candidates."
            subText="Requires demographic data input functionality."
          />
          <KpiCard 
            title="Sourced Candidate Quality Score" 
            value={sourcerMetrics.candidateQualityScore} 
            description="Avg. HM feedback score for sourced candidates."
            subText="Requires a feedback mechanism post-handoff."
          />
          <KpiCard 
            title="Active Requisition Load" 
            value={sourcerMetrics.activeRequisitionLoad} 
            description="Number of requisitions with sourced candidates in period."
          />
        </div>
      </Card>
    </div>
  );
};

export default SourcerDashboardView;
