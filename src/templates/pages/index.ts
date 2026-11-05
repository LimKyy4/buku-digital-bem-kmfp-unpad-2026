/**
 * Pengeksporan Terpusat Seluruh Template Halaman Lembaran Buku Digital
 * Arsitektur modular memisahkan template spesifik agar terbebas dari monolitik,
 * mudah diuji, dan memenuhi standar strict TypeScript.
 */

export { CoverPageTemplate } from './CoverPageTemplate';
export { VisiMisiTemplate } from './VisiMisiTemplate';
export { LeadershipTemplate } from './LeadershipTemplate';
export { StaffGridTemplate, type StaffMemberData } from './StaffGridTemplate';
export { SOPFlowchartTemplate, type SOPStepItem } from './SOPFlowchartTemplate';
export { WorkProgramTemplate, type WorkProgramData } from './WorkProgramTemplate';
