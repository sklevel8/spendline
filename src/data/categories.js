import {
  BriefcaseBusiness,
  CircleEllipsis,
  Code2,
  Megaphone,
  PenTool,
  Plane,
  Server,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'

export const CATEGORIES = [
  {
    name: 'Development',
    color: '#B2B9FF',
    soft: 'rgba(178, 185, 255, 0.12)',
    icon: Code2,
  },
  {
    name: 'Infrastructure',
    color: '#74DCC3',
    soft: 'rgba(116, 220, 195, 0.12)',
    icon: Server,
  },
  {
    name: 'Food',
    color: '#F6C56F',
    soft: 'rgba(246, 197, 111, 0.12)',
    icon: UtensilsCrossed,
  },
  {
    name: 'Marketing',
    color: '#F29BB6',
    soft: 'rgba(242, 155, 182, 0.12)',
    icon: Megaphone,
  },
  {
    name: 'Design',
    color: '#D4A7F5',
    soft: 'rgba(212, 167, 245, 0.12)',
    icon: PenTool,
  },
  {
    name: 'Productivity',
    color: '#87C8F8',
    soft: 'rgba(135, 200, 248, 0.12)',
    icon: Zap,
  },
  {
    name: 'Travel',
    color: '#F2A77E',
    soft: 'rgba(242, 167, 126, 0.12)',
    icon: Plane,
  },
  {
    name: 'Workspace',
    color: '#C8F5A0',
    soft: 'rgba(200, 245, 160, 0.12)',
    icon: BriefcaseBusiness,
  },
  {
    name: 'Other',
    color: '#9AA6B7',
    soft: 'rgba(154, 166, 183, 0.12)',
    icon: CircleEllipsis,
  },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((category) => [category.name, category]),
)

export function getCategory(name) {
  return CATEGORY_MAP[name] ?? CATEGORY_MAP.Other
}

export const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]
