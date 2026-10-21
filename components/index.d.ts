import type * as React from 'react';
/** 按钮。primary = 主行动（金色），secondary = 次要，danger = 危险/不可逆操作。 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'danger'; size?: 'md' | 'sm' }
export declare function Button(props: ButtonProps): React.ReactElement;
/** 数值条。hp 红、mp 青、xp 金；hp ≤ 25% 时数字变红。 */
export interface StatBarProps { kind?: 'hp' | 'mp' | 'xp'; value: number; max: number; label?: string; showValue?: boolean; className?: string }
export declare function StatBar(props: StatBarProps): React.ReactElement;
/** 道具格。不传 icon 即空格子；count > 1 时右下角显示数量。 */
export interface ItemSlotProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> { rarity?: 'common' | 'rare' | 'epic' | 'legendary'; icon?: React.ReactNode; count?: number; selected?: boolean; label?: string }
export declare function ItemSlot(props: ItemSlotProps): React.ReactElement;
/** 徽章。短状态标签。 */
export interface BadgeProps { tone?: 'neutral' | 'gold' | 'cyan' | 'red' | 'green'; children?: React.ReactNode; className?: string }
export declare function Badge(props: BadgeProps): React.ReactElement;
/** 面板。背包、技能详情、结算等容器。 */
export interface PanelProps { title?: React.ReactNode; extra?: React.ReactNode; actions?: React.ReactNode; children?: React.ReactNode; className?: string }
export declare function Panel(props: PanelProps): React.ReactElement;
declare global { interface Window { ArenaUI: { Button: typeof Button; StatBar: typeof StatBar; ItemSlot: typeof ItemSlot; Badge: typeof Badge; Panel: typeof Panel } } }
