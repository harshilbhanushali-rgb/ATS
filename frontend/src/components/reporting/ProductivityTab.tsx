import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Candidate, CandidateOutreachLog, CandidateStage, Interview, User } from '../../types';
import Card from '../Card';
import { COLORS, downloadCSV } from './reportingUtils';

interface ProductivityTabProps {
  allCandidates: Candidate[];
  allInterviews: Interview[];
  users: User[];
  candidateOutreachLogs: CandidateOutreachLog[];
}

const ProductivityTab: React.FC<ProductivityTabProps> = ({ allCandidates, allInterviews, users, candidateOutreachLogs }) => {
  const teamProductivityData = useMemo(() => {
    const reportUsers = users;

    const teamRows = reportUsers.map(usr => {
      const sourcedCount = allCandidates.filter(c => c.sourcedByUserId === usr.id).length;
      let commentsCount = 0;
      allCandidates.forEach(c => { commentsCount += (c.hiringHubComments?.filter(cm => cm.authorId === usr.id).length ?? 0); });
      const interviewsCount = allInterviews.filter(inv => inv.interviewerName.toLowerCase().includes(usr.name.toLowerCase()) || inv.results?.some(r => r.competencyName)).length;
      const scorecardsSubmitted = allInterviews.filter(inv => inv.interviewerName.toLowerCase().includes(usr.name.toLowerCase()) && inv.results?.length > 0).length;
      const emailsSent = candidateOutreachLogs.filter(log => log.sourcerUserId === usr.id).length;
      const rejectedCount = allCandidates.filter(c => c.stage === CandidateStage.REJECTED && c.stageHistory?.some(h => h.stage === CandidateStage.REJECTED && h.changedByUserId === usr.id)).length;
      const hiredCount = allCandidates.filter(c => [CandidateStage.HIRED, CandidateStage.OFFER_ACCEPTED].includes(c.stage) && c.stageHistory?.some(h => [CandidateStage.HIRED, CandidateStage.OFFER_ACCEPTED].includes(h.stage) && h.changedByUserId === usr.id)).length;

      return {
        userId: usr.id, name: usr.name, email: usr.email, role: usr.role,
        sourced: sourcedCount,
        comments: commentsCount,
        interviews: interviewsCount,
        reviews: scorecardsSubmitted,
        emails: emailsSent,
        rejected: rejectedCount,
        hired: hiredCount,
      };
    });

    const agg = {
      sourced: teamRows.reduce((a, b) => a + b.sourced, 0),
      comments: teamRows.reduce((a, b) => a + b.comments, 0),
      interviews: teamRows.reduce((a, b) => a + b.interviews, 0),
      reviews: teamRows.reduce((a, b) => a + b.reviews, 0),
      emails: teamRows.reduce((a, b) => a + b.emails, 0),
      rejected: teamRows.reduce((a, b) => a + b.rejected, 0),
      hired: teamRows.reduce((a, b) => a + b.hired, 0),
    };

    return { teamRows, aggregateMetrics: agg };
  }, [allInterviews, candidateOutreachLogs, allCandidates, users]);

  const handleDownload = () => {
    const headers = ['Team Member Name', 'Role', 'Email', 'Candidates Sourced', 'Comments Added', 'Interviews Scheduled', 'Reviews Submitted', 'Outreach Emails Sent', 'Candidates Rejected', 'Hired Candidates'];
    downloadCSV(teamProductivityData.teamRows.map(r => ({
      'Team Member Name': r.name, 'Role': r.role, 'Email': r.email,
      'Candidates Sourced': r.sourced, 'Comments Added': r.comments,
      'Interviews Scheduled': r.interviews, 'Reviews Submitted': r.reviews,
      'Outreach Emails Sent': r.emails, 'Candidates Rejected': r.rejected, 'Hired Candidates': r.hired
    })) as Record<string, unknown>[], headers, 'team_productivity_report.csv');
  };

  const { aggregateMetrics, teamRows } = teamProductivityData;
  const chips = [
    { label: 'Sourced', count: aggregateMetrics.sourced, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { label: 'Comments', count: aggregateMetrics.comments, color: 'text-sky-600 bg-sky-50 border-sky-100' },
    { label: 'Interviews', count: aggregateMetrics.interviews, color: 'text-teal-600 bg-teal-50 border-teal-100' },
    { label: 'Scorecards', count: aggregateMetrics.reviews, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'Emails', count: aggregateMetrics.emails, color: 'text-pink-600 bg-pink-50 border-pink-100' },
    { label: 'Rejections', count: aggregateMetrics.rejected, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { label: 'Hires', count: aggregateMetrics.hired, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  ];

  const pieData = [
    { name: 'Sourcing/Pipeline', value: aggregateMetrics.sourced + aggregateMetrics.emails },
    { name: 'Interviews & Review', value: aggregateMetrics.interviews + aggregateMetrics.reviews },
    { name: 'Coordination', value: aggregateMetrics.comments },
    { name: 'Outcomes (Hires)', value: aggregateMetrics.hired },
  ];

  return (
    <div className="space-y-6" id="team-productivity-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 font-display">Recruiter Productivity KPI</h2>
          <p className="text-xs text-slate-500">Track task volumes, communications, reviews, and conversions executed by each user.</p>
        </div>
        <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-slate-900 transition-all text-white text-xs font-semibold rounded-xl gap-2 shadow-sm shrink-0 self-start md:self-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          <span>Download Team Stats</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {chips.map(ag => (
          <div key={ag.label} className={`border p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 ${ag.color}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{ag.label}</span>
            <p className="text-xl font-black">{ag.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recruiter Volume Breakdown">
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamRows} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                  <Bar dataKey="sourced" name="Sourced" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" name="Comments" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="interviews" name="Interviews" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="emails" name="Outreach" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hired" name="Hired" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card title="Workload Focus Proportion">
            <div className="h-80 w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} actions`, 'Contribution']} />
                  <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <Card title="System Activity Tracker" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Team Member', 'Role', 'Sourced', 'Notes', 'Interviews', 'Reviews', 'Outreach', 'Hires', 'Rejections'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamRows.map(row => (
                <tr key={row.userId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4"><div className="font-bold text-slate-900 text-sm">{row.name}</div><div className="text-xs text-slate-400">{row.email}</div></td>
                  <td className="px-6 py-4 text-sm text-center"><span className="inline-flex text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{row.role}</span></td>
                  <td className="px-6 py-4 font-semibold text-center text-sm text-indigo-700">{row.sourced}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{row.comments}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{row.interviews}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{row.reviews}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{row.emails}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-emerald-600">{row.hired}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-rose-500">{row.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProductivityTab;
