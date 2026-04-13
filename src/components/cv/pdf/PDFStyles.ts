import { StyleSheet } from '@react-pdf/renderer'

// ─────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────

const COLOR = {
  text:        '#111827',   // very dark — main text
  subtle:      '#374151',   // company / institution
  muted:       '#6b7280',   // dates, descriptions
  label:       '#9ca3af',   // section labels
  border:      '#e5e7eb',   // dividers
  accent:      '#2563eb',   // timeline dots & name accent
  badge:       '#f3f4f6',   // skill badge background
  badgeText:   '#374151',
}

const FONT = 'Helvetica'

// ─────────────────────────────────────────────────────────────
// StyleSheet
// ─────────────────────────────────────────────────────────────

export const styles = StyleSheet.create({

  // ── Page ────────────────────────────────────────────────────
  page: {
    paddingTop:        50,
    paddingBottom:     50,
    paddingHorizontal: 50,
    fontFamily:        FONT,
    fontSize:          10,
    color:             COLOR.text,
    backgroundColor:   '#ffffff',
    lineHeight:        1.5,
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize:     24,
    fontWeight:   'bold',
    color:        COLOR.text,
    marginBottom: 4,
  },
  bio: {
    fontSize:     10,
    color:        COLOR.muted,
    lineHeight:   1.6,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
    marginTop:     2,
  },
  contactItem: {
    fontSize: 9,
    color:    COLOR.muted,
  },

  // ── Divider ─────────────────────────────────────────────────
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.border,
    marginVertical:    16,
  },

  // ── Section ─────────────────────────────────────────────────
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize:      8,
    fontWeight:    'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color:         COLOR.label,
    marginBottom:  10,
  },

  // ── Experience / Education item ──────────────────────────────
  timelineItem: {
    flexDirection: 'row',
    marginBottom:  12,
  },
  timelineLeft: {
    width:       12,
    alignItems:  'center',
    paddingTop:  3,
    marginRight: 10,
  },
  dot: {
    width:           7,
    height:          7,
    borderRadius:    4,
    backgroundColor: COLOR.accent,
  },
  dotGray: {
    width:           7,
    height:          7,
    borderRadius:    4,
    backgroundColor: COLOR.label,
  },
  timelineLine: {
    width:           1,
    flex:            1,
    backgroundColor: COLOR.border,
    marginTop:       3,
  },
  timelineContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  itemTitle: {
    fontSize:    10.5,
    fontWeight:  'bold',
    color:       COLOR.text,
    flex:        1,
    marginRight: 8,
  },
  itemDate: {
    fontSize:    9,
    color:       COLOR.label,
    flexShrink:  0,
  },
  itemSubtitle: {
    fontSize:   9.5,
    color:      COLOR.subtle,
    marginTop:  2,
  },
  itemLocation: {
    fontSize:  8.5,
    color:     COLOR.muted,
    marginTop: 1,
  },
  itemDesc: {
    fontSize:   9,
    color:      COLOR.muted,
    marginTop:  5,
    lineHeight: 1.6,
  },

  // ── Skills ──────────────────────────────────────────────────
  skillsGrid: {
    flexDirection: 'column',
    gap:           8,
  },
  skillCategory: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    flexWrap:      'wrap',
  },
  skillCategoryLabel: {
    fontSize:    8.5,
    fontWeight:  'bold',
    color:       COLOR.subtle,
    width:       80,
    paddingTop:  3,
    flexShrink:  0,
  },
  skillBadgesRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    flex:          1,
    gap:           4,
  },
  skillBadge: {
    fontSize:          8.5,
    color:             COLOR.badgeText,
    backgroundColor:   COLOR.badge,
    paddingHorizontal: 7,
    paddingVertical:   3,
    borderRadius:      3,
  },
  skillBadgeLevel: {
    fontSize: 7.5,
    color:    COLOR.muted,
  },
})
