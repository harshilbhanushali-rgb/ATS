
import React, { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';
import { Requisition, Priority, RequisitionStatus, FunctionArea, Candidate, Interview, CandidateStage } from '../types';
import Card from './Card';
import AnimatedCounter from './ui/AnimatedCounter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector, TooltipProps } from 'recharts';
import { getDashboardInsights } from '../services/aiApi';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useAppData } from '../contexts/AppDataContext';

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

const COLORS_STATUS = ['#6366f1', '#a855f7', '#10b981', '#94a3b8', '#ef4444', '#f59e0b']; // Indigo, Purple, Green, Slate, Red, Amber
const COLORS_PRIORITY = ['#f43f5e', '#fbbf24']; // Rose, Amber
const COLORS_FUNCTION = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#0ea5e9', '#d946ef', '#64748b', '#4f46e5'];
const COLORS_PIPELINE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const COLORS_SOURCE = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#94a3b8'];


const daysBetween = (dateString1: string | undefined, dateString2: string | undefined): number | null => {
    if (!dateString1 || !dateString2) return null;
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    const differenceInTime = date2.getTime() - date1.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return Math.floor(differenceInDays);
};

const ActiveShape = <T extends { cx?: number, cy?: number, midAngle?: number, innerRadius?: number, outerRadius?: number, startAngle?: number, endAngle?: number, fill?: string, payload?: any, percent?: number, value?: number}>(props: T) => {
  const RADIAN = Math.PI / 180;
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, startAngle = 0, endAngle = 0, fill, payload, percent = 0, value = 0 } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill || '#1e293b'} className="font-semibold text-base sm:text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#334155" className="text-xs sm:text-sm">{`${value} ${payload.unit || 'Items'}`}</text>
      { percent > 0 &&
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={16} textAnchor={textAnchor} fill="#64748b" className="text-xs">
          {`(Rate ${(percent * 100).toFixed(1)}%)`}
        </text>
      }
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-xl border border-slate-200 text-sm">
        <p className="font-semibold text-slate-800 mb-1">{`${label}`}</p>
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


const Dashboard: React.FC = () => {
  const { candidates: allCandidates, requisitions, interviews: allInterviews } = useAppData();
  const [activeIndexStatusPie, setActiveIndexStatusPie] = useState(0);
  const [activeIndexSourcePie, setActiveIndexSourcePie] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportInsights, setReportInsights] = useState<string[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const onPieEnterStatus = <T,>(_: T, index: number) => setActiveIndexStatusPie(index);
  const onPieEnterSource = <T,>(_: T, index: number) => setActiveIndexSourcePie(index);

  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    setIsReportModalOpen(true);
    try {
      const insights = await getDashboardInsights();
      setReportInsights(insights);
    } catch (error) {
      console.error("Failed to fetch AI report:", error);
      setReportInsights(["Failed to generate report at this time. Please try again."]);
    } finally {
      setIsGeneratingReport(false);
    }
  }, []);

  const kpiStats = useMemo(() => {
    // Determine Offer Accepted Date for each candidate
    const hiredOrAcceptedCandidates = allCandidates.filter(c => 
        (c.stage === CandidateStage.HIRED || c.stage === CandidateStage.OFFER_ACCEPTED) && c.offerDetails
    ).map(c => {
        // Find the date they moved to OFFER_ACCEPTED or HIRED in stageHistory
        const acceptedStage = c.stageHistory?.find(h => h.stage === CandidateStage.OFFER_ACCEPTED || h.stage === CandidateStage.HIRED);
        const acceptedDate = acceptedStage ? acceptedStage.date : c.offerDetails!.startDate; // Fallback to start date if history missing
        return { ...c, acceptedDate };
    });

    // Time to Hire: Application Date -> Offer Accepted Date
    const timeToHireDurations = hiredOrAcceptedCandidates
        .map(c => {
            if (!c.applicationDate || !c.acceptedDate) return null;
            return daysBetween(c.applicationDate, c.acceptedDate);
        })
        .filter(d => d !== null && d >= 0) as number[];
    const avgTimeToHire = timeToHireDurations.length > 0 ? (timeToHireDurations.reduce((a, b) => a + b, 0) / timeToHireDurations.length).toFixed(1) : 'N/A';

    // Time to Fill: Requisition Approval Date -> Offer Accepted Date (Earliest for that Req)
    const timeToFillDurations: number[] = [];
    requisitions.forEach(req => {
        const reqHiredCandidates = hiredOrAcceptedCandidates.filter(c => c.requisitionId === req.id);
        if (reqHiredCandidates.length > 0 && req.reqApprovalDate) {
            // Use the earliest accepted offer for the requisition to mark "Filled" time
            const earliestAcceptedDate = reqHiredCandidates.reduce((earliest, current) => {
                if (!current.acceptedDate) return earliest;
                if (!earliest) return current.acceptedDate;
                return new Date(current.acceptedDate) < new Date(earliest) ? current.acceptedDate : earliest;
            }, reqHiredCandidates[0].acceptedDate);
            
            if (earliestAcceptedDate) {
                const duration = daysBetween(req.reqApprovalDate, earliestAcceptedDate);
                if (duration !== null && duration >= 0) timeToFillDurations.push(duration);
            }
        }
    });
    const avgTimeToFill = timeToFillDurations.length > 0 ? (timeToFillDurations.reduce((a, b) => a + b, 0) / timeToFillDurations.length).toFixed(1) : 'N/A';

    const offeredCandidates = allCandidates.filter(c =>
        [CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED, CandidateStage.OFFER_DECLINED, CandidateStage.HIRED].includes(c.stage) && c.offerDetails
    );
    const totalOffersMade = offeredCandidates.length;
    const acceptedOffersCount = hiredOrAcceptedCandidates.length;
    const declinedOffersCount = allCandidates.filter(c => c.stage === CandidateStage.OFFER_DECLINED).length;
    const offerAcceptanceRatio = totalOffersMade > 0 ? ((acceptedOffersCount / totalOffersMade) * 100).toFixed(1) + '%' : 'N/A';
    
    const avgCostPerHire: Record<string, string> = {};
    const costsByCurrency: Record<string, { totalCost: number, hires: number }> = {};
    requisitions.forEach(req => {
        // Only count cost if we have at least one hire/accept for the req
        const reqHiredCount = hiredOrAcceptedCandidates.filter(c => c.requisitionId === req.id).length;
        if (reqHiredCount > 0) {
            if (!costsByCurrency[req.cost.currency]) {
                costsByCurrency[req.cost.currency] = { totalCost: 0, hires: 0 };
            }
            costsByCurrency[req.cost.currency].totalCost += req.cost.amount; // Assuming Req Cost is budget for the position(s)
            costsByCurrency[req.cost.currency].hires += reqHiredCount; // Divide budget by hires? Or average budget of filled reqs? 
            // Let's go with Average Salary of Offers for better per-hire granularity
        }
    });
    
    // Better Cost per Hire approach: Average of accepted offer salaries
    const salarySums: Record<string, {total: number, count: number}> = {};
    hiredOrAcceptedCandidates.forEach(c => {
        if (c.offerDetails?.salary) {
            const curr = c.offerDetails.salary.currency;
            if(!salarySums[curr]) salarySums[curr] = {total: 0, count: 0};
            salarySums[curr].total += c.offerDetails.salary.amount;
            salarySums[curr].count++;
        }
    });
    Object.entries(salarySums).forEach(([currency, data]) => {
        avgCostPerHire[currency] = data.count > 0 ? (data.total / data.count).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A';
    });
    
    const interviewScores = allInterviews.flatMap(i => i.results.map(r => r.score));
    const totalInterviewScore = interviewScores.reduce((sum, score) => sum + score, 0);
    const avgInterviewScore = interviewScores.length > 0 ? (totalInterviewScore / interviewScores.length).toFixed(2) : 'N/A';

    return {
        avgTimeToHire,
        avgTimeToFill,
        offerAcceptanceRatio,
        declinedOffersCount,
        avgCostPerHire,
        avgInterviewScore,
    };
  }, [requisitions, allCandidates, allInterviews]);

  const pipelineFunnelData = useMemo(() => {
    const majorFunnelStages = {
        APPLIED: allCandidates.length,
        SCREENED_SHORTLISTED: allCandidates.filter(c =>
            [CandidateStage.SCREENING, CandidateStage.SHORTLISTED, CandidateStage.INTERVIEW_ROUND_1, CandidateStage.INTERVIEW_ROUND_2, CandidateStage.INTERVIEW_ROUND_3, CandidateStage.INTERVIEW_ROUND_4, CandidateStage.HM_DECISION_PENDING, CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED, CandidateStage.OFFER_DECLINED, CandidateStage.HIRED].includes(c.stage)
        ).length,
        INTERVIEWING: allCandidates.filter(c =>
            [CandidateStage.INTERVIEW_ROUND_1, CandidateStage.INTERVIEW_ROUND_2, CandidateStage.INTERVIEW_ROUND_3, CandidateStage.INTERVIEW_ROUND_4, CandidateStage.HM_DECISION_PENDING, CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED, CandidateStage.OFFER_DECLINED, CandidateStage.HIRED].includes(c.stage) || allInterviews.some(i => i.candidateId === c.id)
        ).length,
        OFFERED: allCandidates.filter(c =>
            [CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED, CandidateStage.OFFER_DECLINED, CandidateStage.HIRED].includes(c.stage) && c.offerDetails
        ).length,
        HIRED: allCandidates.filter(c => 
            (c.stage === CandidateStage.HIRED || c.stage === CandidateStage.OFFER_ACCEPTED) && c.offerDetails
        ).length,
    };
    
    const chartData = [
        { name: 'Applied', value: majorFunnelStages.APPLIED },
        { name: 'Screened/Shortlisted', value: majorFunnelStages.SCREENED_SHORTLISTED },
        { name: 'Interviewing', value: majorFunnelStages.INTERVIEWING },
        { name: 'Offered', value: majorFunnelStages.OFFERED },
        { name: 'Hired', value: majorFunnelStages.HIRED },
    ].filter(s => s.value > 0);

    const conversionRates = [
        { from: 'Applied', to: 'Screened/Shortlisted', rate: majorFunnelStages.APPLIED > 0 ? (majorFunnelStages.SCREENED_SHORTLISTED / majorFunnelStages.APPLIED * 100).toFixed(1) + '%' : 'N/A' },
        { from: 'Screened/Shortlisted', to: 'Interviewing', rate: majorFunnelStages.SCREENED_SHORTLISTED > 0 ? (majorFunnelStages.INTERVIEWING / majorFunnelStages.SCREENED_SHORTLISTED * 100).toFixed(1) + '%' : 'N/A' },
        { from: 'Interviewing', to: 'Offered', rate: majorFunnelStages.INTERVIEWING > 0 ? (majorFunnelStages.OFFERED / majorFunnelStages.INTERVIEWING * 100).toFixed(1) + '%' : 'N/A' },
        { from: 'Offered', to: 'Hired', rate: majorFunnelStages.OFFERED > 0 ? (majorFunnelStages.HIRED / majorFunnelStages.OFFERED * 100).toFixed(1) + '%' : 'N/A' },
    ];

    return { chartData, conversionRates };
  }, [allCandidates, allInterviews]);

  const hiringSourceData = useMemo(() => {
    const hiredCandidates = allCandidates.filter(c => (c.stage === CandidateStage.HIRED || c.stage === CandidateStage.OFFER_ACCEPTED) && c.offerDetails);
    const counts = hiredCandidates.reduce((acc, curr) => {
        acc[curr.source] = (acc[curr.source] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value, unit: 'Hires' })).sort((a,b) => Number(b.value) - Number(a.value));
  }, [allCandidates]);


  const summaryStats = useMemo(() => {
    return {
        open: requisitions.filter(r => r.reqStatus === RequisitionStatus.OPEN).length,
        p0: requisitions.filter(r => r.priority === Priority.P0).length,
        p1: requisitions.filter(r => r.priority === Priority.P1).length,
        total: requisitions.length,
    }
  }, [requisitions]);

  const requisitionsByStatus = useMemo(() => {
    const counts = requisitions.reduce((acc, curr) => {
      acc[curr.reqStatus] = (acc[curr.reqStatus] || 0) + 1;
      return acc;
    }, {} as Record<RequisitionStatus, number>);
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value, unit: 'Reqs' }))
        .sort((a,b) => Number(b.value) - Number(a.value));
  }, [requisitions]);

  const requisitionsByPriority = useMemo(() => {
    const counts = requisitions.reduce((acc, curr) => {
      acc[curr.priority] = (acc[curr.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);
    return Object.values(Priority).map(p => ({name: p, value: counts[p] || 0}));
  }, [requisitions]);

  const requisitionsByFunction = useMemo(() => {
    const counts = requisitions.reduce((acc, curr) => {
        acc[curr.function] = (acc[curr.function] || 0) + 1;
        return acc;
    }, {} as Record<FunctionArea, number>);
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => Number(b.value) - Number(a.value));
  }, [requisitions]);


  const KpiItem: React.FC<{label: string; value: string | number; currency?: string; subValue?: string; className?: string}> =
    ({label, value, currency, subValue, className = ''}) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
    const isNumeric = !isNaN(numericValue) && typeof value !== 'string';
    return (
    <motion.div variants={fadeUp} className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-shadow duration-300 hover:shadow-md hover:shadow-blue-100 ${className}`}>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</h4>
        <div className="flex items-baseline">
            <p className="text-3xl font-bold text-slate-900 font-display tracking-tight">
                {isNumeric
                  ? <AnimatedCounter value={numericValue} decimals={Number.isInteger(numericValue) ? 0 : 1} />
                  : value}
            </p>
            {currency && <span className="text-sm font-semibold text-slate-400 ml-1.5">{currency}</span>}
        </div>
        {subValue && <p className="text-xs font-medium text-slate-400 mt-2 flex items-center">
            <span className="w-1 h-1 rounded-full bg-blue-500 mr-1.5"></span>
            {subValue}
        </p>}
    </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <motion.button
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGeneratingReport
            ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            : <SparklesIcon className="w-4 h-4" />}
          {isGeneratingReport ? 'Generating...' : 'Generate AI Report'}
        </motion.button>
      </div>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="AI Hiring Report" size="xl">
        {isGeneratingReport ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
            <p className="text-slate-500 text-sm">Analysing your hiring data...</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reportInsights.map((insight, i) => {
              const [label, ...rest] = insight.split(':');
              return (
                <li key={i} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-700">{label}:</span>
                  <span className="text-slate-700"> {rest.join(':')}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>

      {/* KPIs Section */}
      <Card title="Key Performance Indicators" bodyClassName="p-3 md:p-4">
        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4" variants={staggerContainer} initial="hidden" animate="visible">
            <KpiItem label="Avg. Time to Hire" value={kpiStats.avgTimeToHire} subValue="Days (App to Accept)" />
            <KpiItem label="Avg. Time to Fill" value={kpiStats.avgTimeToFill} subValue="Days (Req to Accept)" />
            <KpiItem label="Offer Acceptance Rate" value={kpiStats.offerAcceptanceRatio} />
            <KpiItem label="Offers Declined" value={kpiStats.declinedOffersCount} subValue="Candidates who said no" />
            <KpiItem label="Avg. Interview Score" value={kpiStats.avgInterviewScore} subValue="/ 5.00" />
            {Object.entries(kpiStats.avgCostPerHire).length > 0 ? Object.entries(kpiStats.avgCostPerHire).map(([currency, cost]) => (
                <KpiItem key={currency} label={`Avg. Salary (${currency})`} value={cost} />
            )) : <KpiItem label="Avg. Salary" value="N/A" subValue="No offers yet" />}
        </motion.div>
      </Card>

      {/* Pipeline Funnel Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Hiring Pipeline Funnel" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={pipelineFunnelData.chartData} layout="horizontal" margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                    <XAxis dataKey="name" angle={-20} textAnchor="end" height={50} interval={0} tick={{fontSize: 11, fill: '#64748b'}} axisLine={{stroke: '#e2e8f0'}} tickLine={false}/>
                    <YAxis allowDecimals={false} tick={{fontSize: 11, fill: '#64748b'}}/>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize: "12px", paddingTop: '10px'}}/>
                    <Bar dataKey="value" name="Candidates" radius={[4, 4, 0, 0]}>
                        {pipelineFunnelData.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_PIPELINE[index % COLORS_PIPELINE.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card title="Conversion Rates" bodyClassName="p-3 md:p-4">
            <ul className="space-y-2.5">
                {pipelineFunnelData.conversionRates.map(rate => (
                    <li key={`${rate.from}-${rate.to}`} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-500 w-2/3 truncate">{rate.from} <span className="text-blue-500 mx-1">&rarr;</span> {rate.to}</span>
                            <span className="text-sm font-semibold text-blue-600">{rate.rate}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Hires by Source" className="lg:col-span-1">
             {hiringSourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            activeIndex={activeIndexSourcePie}
                            activeShape={ActiveShape}
                            data={hiringSourceData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="45%"
                            outerRadius="75%"
                            onMouseEnter={onPieEnterSource}
                        >
                            {hiringSourceData.map((entry, index) => (
                            <Cell key={`cell-source-${index}`} fill={COLORS_SOURCE[index % COLORS_SOURCE.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconSize={10} wrapperStyle={{fontSize: "11px"}} layout="horizontal" verticalAlign="bottom" align="center"/>
                    </PieChart>
                </ResponsiveContainer>
             ) : (
                <p className="text-center text-slate-500 py-10 text-sm">No hired candidate data available for source analysis.</p>
             )}
        </Card>

        <Card title="Requisitions by Status" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie 
                activeIndex={activeIndexStatusPie}
                activeShape={ActiveShape}
                data={requisitionsByStatus} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius="45%"
                outerRadius="75%"
                onMouseEnter={onPieEnterStatus}
              >
                {requisitionsByStatus.map((entry, index) => (
                  <Cell key={`cell-status-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" variants={staggerContainer} initial="hidden" animate="visible">
        <KpiItem label="Open Reqs" value={summaryStats.open} className="border-blue-200 bg-blue-50" />
        <KpiItem label="P0 Critical Reqs" value={summaryStats.p0} className="border-rose-200 bg-rose-50" />
        <KpiItem label="P1 Critical Reqs" value={summaryStats.p1} className="border-amber-200 bg-amber-50" />
        <KpiItem label="Total Reqs" value={summaryStats.total} className="border-slate-200 bg-white" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Requisitions by Priority">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={requisitionsByPriority} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 11}} />
              <YAxis allowDecimals={false} tick={{fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                 {requisitionsByPriority.map((entry, index) => (
                    <Cell key={`cell-prio-${index}`} fill={COLORS_PRIORITY[index % COLORS_PRIORITY.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Requisitions by Function">
            <ResponsiveContainer width="100%" height={450}>
                <BarChart layout="vertical" data={requisitionsByFunction} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
                <XAxis type="number" tick={{fontSize: 11}} />
                <YAxis dataKey="name" type="category" width={95} tick={{fontSize: 11, width: 90, fill: '#64748b' }} interval={0} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
                <Bar dataKey="value" name="Count" barSize={18} radius={[0, 4, 4, 0]}>
                    {requisitionsByFunction.map((entry, index) => (
                        <Cell key={`cell-func-${index}`} fill={COLORS_FUNCTION[index % COLORS_FUNCTION.length]} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
