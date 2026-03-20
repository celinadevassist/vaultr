const ROLES = {
  ADMIN: 'admin',
  VIEWER: 'viewer'
};

const VISIBILITY = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated',
  GROUP: 'group',
  PRIVATE: 'private'
};

const PRD_STATUS = {
  DRAFT: 'draft',
  IN_REVIEW: 'in-review',
  APPROVED: 'approved',
  ARCHIVED: 'archived'
};

const DEFAULT_PRD_SECTIONS = [
  { heading: 'Overview', content: 'Provide a high-level overview of this product/feature.' },
  { heading: 'Problem Statement', content: 'Describe the problem this product/feature solves.' },
  { heading: 'Goals', content: 'List the primary goals and objectives.' },
  { heading: 'User Stories', content: 'Define user stories in the format: As a [role], I want [feature] so that [benefit].' },
  { heading: 'Technical Requirements', content: 'Detail the technical requirements and constraints.' },
  { heading: 'Success Metrics', content: 'Define measurable success criteria.' },
  { heading: 'Timeline', content: 'Outline the implementation timeline and milestones.' }
];

const CHART_STYLES = {
  GRADIENT: 'gradient',
  CLEAN: 'clean',
  BOLD: 'bold',
  COMPARISON: 'comparison',
  TIMELINE: 'timeline'
};

module.exports = {
  ROLES,
  VISIBILITY,
  PRD_STATUS,
  DEFAULT_PRD_SECTIONS,
  CHART_STYLES
};
