from __future__ import annotations

from enum import Enum


class CandidateStageEnum(str, Enum):
    APPLIED = "Applied"
    POOLED = "Talent Pool Prospect"
    SCREENING = "Screening"
    SHORTLISTED = "Shortlisted"
    AI_SOURCED_POOL = "AI Sourced (Pool)"
    INTERVIEW_ROUND_1 = "Interview - Round 1"
    INTERVIEW_ROUND_2 = "Interview - Round 2"
    INTERVIEW_ROUND_3 = "Interview - Round 3"
    INTERVIEW_ROUND_4 = "Interview - Round 4"
    HM_DECISION_PENDING = "HM Decision Pending"
    OFFER_EXTENDED = "Offer Extended"
    OFFER_ACCEPTED = "Offer Accepted"
    OFFER_DECLINED = "Offer Declined"
    HIRED = "Hired"
    REJECTED = "Rejected"
    ON_HOLD = "On Hold"


class CandidateSourceEnum(str, Enum):
    LINKEDIN = "LinkedIn"
    INDEED = "Indeed"
    NAUKRI = "Naukri.com"
    REFERRAL = "Referral"
    DIRECT_APPLICATION = "Direct Application"
    CAREERS_PAGE = "Company Careers Page"
    OTHER = "Other"


class RequisitionStatusEnum(str, Enum):
    OPEN = "Open"
    OFFERED = "Offered"
    JOINED = "Joined"
    HOLD = "Hold"
    CANCELLED = "Cancelled"
    ARCHIVED = "Archived"


class PriorityEnum(str, Enum):
    P0 = "P0: Very Critical"
    P1 = "P1: Critical"


class HireTypeEnum(str, Enum):
    FULL_TIME = "Full Time"
    INTERN = "Intern"
    CONTRACT = "Contract"


class LocationEnum(str, Enum):
    INDIA = "India"
    US = "US"
    CANADA = "Canada"
    UK = "UK"


class FunctionAreaEnum(str, Enum):
    SALES = "Sales"
    CUSTOMER_SUCCESS = "Customer Success"
    MARKETING = "Marketing"
    SUPPLY = "Supply"
    FINANCE_LEGAL = "Finance & Legal"
    PEOPLE_CULTURE = "People and Culture"
    PRODUCT = "Product"
    ENGINEERING = "Engineering"
    OPERATIONS_STRATEGY = "Operations & Strategy"


class NewOrBackfillEnum(str, Enum):
    NEW = "New"
    BACKFILL = "Backfill"


class InterviewRoundEnum(str, Enum):
    ROUND_1 = "Interview - Round 1"
    ROUND_2 = "Interview - Round 2"
    ROUND_3 = "Interview - Round 3"
    ROUND_4 = "Interview - Round 4"


class InterviewDecisionEnum(str, Enum):
    PROCEED = "Proceed to Next Stage"
    RECOMMEND_HIRE = "Recommend for Hire"
    HOLD = "Put On Hold"
    REJECT = "Reject Candidate"


class OutreachChannelEnum(str, Enum):
    LINKEDIN_INMAIL = "LinkedIn InMail"
    EMAIL = "Email"
    PHONE_CALL = "Phone Call"
    OTHER = "Other"


class CurrencyEnum(str, Enum):
    INR = "INR"
    USD = "USD"


class OfferStatusEnum(str, Enum):
    EXTENDED = "Extended"
    ACCEPTED = "Accepted"
    DECLINED = "Declined"
    RESCINDED = "Rescinded"
