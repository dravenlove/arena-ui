import type * as React from 'react';

/** 按钮：主行动金色；loading 时禁用，保留按钮文案。 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'; size?: 'md' | 'sm';
  icon?: React.ReactNode; loading?: boolean;
}
export declare function Button(props: ButtonProps): React.ReactElement;
/** 数值条：非有限 value 回退 0，非法 max 回退 100，最终值限制在 0..max。 */
export interface StatBarProps {
  kind?: 'hp' | 'mp' | 'xp'; value: number; max: number; label?: string;
  showValue?: boolean; className?: string;
}
export declare function StatBar(props: StatBarProps): React.ReactElement;
export interface ItemSlotProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'; icon?: React.ReactNode;
  count?: number; selected?: boolean; label?: string;
}
export declare function ItemSlot(props: ItemSlotProps): React.ReactElement;
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'gold' | 'cyan' | 'red' | 'green';
}
export declare function Badge(props: BadgeProps): React.ReactElement;
/** title 是面板标题节点；HTML title 提示请由内容节点承载。 */
export interface PanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode; extra?: React.ReactNode; actions?: React.ReactNode;
}
export declare function Panel(props: PanelProps): React.ReactElement;
export interface TabItem { id: string; label: React.ReactNode; disabled?: boolean; panelId?: string }
export interface TabsProps {
  items: TabItem[]; value: string; onChange?: (value: string) => void;
  label?: string; className?: string;
}
export declare function Tabs(props: TabsProps): React.ReactElement;
export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'onClick' | 'children'> {
  checked: boolean; onChange?: (checked: boolean) => void; label: React.ReactNode;
}
export declare function Toggle(props: ToggleProps): React.ReactElement;
export interface AvatarProps { src?: string; name?: string; size?: 'sm' | 'md' | 'lg'; className?: string }
export declare function Avatar(props: AvatarProps): React.ReactElement;
export interface DialogProps {
  open: boolean; onClose: () => void; title: React.ReactNode;
  children?: React.ReactNode; actions?: React.ReactNode; className?: string;
}
export declare function Dialog(props: DialogProps): React.ReactElement | null;
declare global {
  interface Window {
    ArenaUI: {
      Button: typeof Button; StatBar: typeof StatBar; ItemSlot: typeof ItemSlot;
      Badge: typeof Badge; Panel: typeof Panel; Tabs: typeof Tabs;
      Toggle: typeof Toggle; Avatar: typeof Avatar; Dialog: typeof Dialog;
    };
  }
}
