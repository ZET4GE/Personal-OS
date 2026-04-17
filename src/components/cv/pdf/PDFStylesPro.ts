import { StyleSheet } from '@react-pdf/renderer'

const COLOR = {
  text: '#111827',
  subtle: '#374151',
  muted: '#6b7280',
  label: '#9ca3af',
  border: '#e5e7eb',
  surface: '#ffffff',
  paper: '#f4f6fb',
  ink: '#0f172a',
  accent: '#2563eb',
  accentSoft: '#dbeafe',
  badge: '#eef2ff',
  badgeText: '#1e3a8a',
}

const FONT = 'Helvetica'

export const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 34,
    fontFamily: FONT,
    fontSize: 9.5,
    color: COLOR.text,
    backgroundColor: COLOR.paper,
    lineHeight: 1.5,
  },
  hero: {
    backgroundColor: COLOR.ink,
    borderRadius: 14,
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 22,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headline: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#bfdbfe',
    marginBottom: 5,
  },
  bio: {
    fontSize: 9.5,
    color: '#d1d5db',
    lineHeight: 1.55,
  },
  body: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  sidebar: {
    width: 155,
    backgroundColor: COLOR.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLOR.border,
  },
  main: {
    flex: 1,
  },
  mainSection: {
    backgroundColor: COLOR.surface,
    borderRadius: 12,
    padding: 15,
    borderWidth: 0.5,
    borderColor: COLOR.border,
    marginBottom: 12,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionAccent: {
    width: 4,
    height: 12,
    borderRadius: 2,
    backgroundColor: COLOR.accent,
    marginRight: 7,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: COLOR.ink,
  },
  sidebarSection: {
    marginBottom: 16,
  },
  sidebarTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: COLOR.label,
    marginBottom: 8,
  },
  sidebarText: {
    fontSize: 8.5,
    color: COLOR.subtle,
    marginBottom: 5,
    lineHeight: 1.45,
  },
  sidebarLink: {
    fontSize: 8.5,
    color: COLOR.accent,
    marginBottom: 5,
  },
  sidebarItem: {
    marginBottom: 8,
  },
  sidebarItemTitle: {
    fontSize: 8.6,
    fontWeight: 'bold',
    color: COLOR.text,
  },
  sidebarItemMeta: {
    fontSize: 7.8,
    color: COLOR.muted,
  },
  itemCard: {
    marginBottom: 10,
    paddingBottom: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.border,
  },
  lastItemCard: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 10.2,
    fontWeight: 'bold',
    color: COLOR.text,
    flex: 1,
    marginRight: 8,
  },
  itemDate: {
    fontSize: 8.5,
    color: COLOR.label,
    flexShrink: 0,
  },
  itemSubtitle: {
    fontSize: 9,
    color: COLOR.subtle,
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 8.2,
    color: COLOR.muted,
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 8.8,
    color: COLOR.muted,
    marginTop: 5,
    lineHeight: 1.55,
  },
  linksRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  itemLink: {
    fontSize: 8.4,
    color: COLOR.accent,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  techPill: {
    fontSize: 7.8,
    color: COLOR.badgeText,
    backgroundColor: COLOR.badge,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  skillGroup: {
    marginBottom: 9,
  },
  skillCategoryLabel: {
    fontSize: 7.8,
    fontWeight: 'bold',
    color: COLOR.subtle,
    marginBottom: 4,
  },
  skillBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillBadge: {
    fontSize: 7.8,
    color: COLOR.badgeText,
    backgroundColor: COLOR.badge,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginBottom: 3,
  },
  skillBadgeLevel: {
    fontSize: 7,
    color: COLOR.muted,
  },
  emptyText: {
    color: COLOR.muted,
    fontSize: 9,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.border,
    marginVertical: 12,
  },
  header: {
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  contactItem: {
    fontSize: 8.4,
    color: COLOR.accent,
  },
  section: {
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  timelineLeft: {
    width: 12,
    alignItems: 'center',
    paddingTop: 3,
    marginRight: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLOR.accent,
  },
  dotGray: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLOR.label,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: COLOR.border,
    marginTop: 3,
  },
  timelineContent: {
    flex: 1,
  },
  itemLocation: {
    fontSize: 8.2,
    color: COLOR.muted,
    marginTop: 2,
  },
  simpleItem: {
    marginBottom: 10,
  },
  skillsGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  skillCategory: {
    marginBottom: 8,
  },
})
