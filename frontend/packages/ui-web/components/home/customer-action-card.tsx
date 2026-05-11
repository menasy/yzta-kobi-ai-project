import { motion } from 'framer-motion';
import { cn } from '@repo/core';
import { CustomerActionCardProps } from '@repo/ui-contracts';

export function CustomerActionCard({
  type,
  title,
  description,
  icon,
  isActive,
  onClick,
}: CustomerActionCardProps) {
  return (
    <motion.button
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={() => onClick(type)}
      className={cn(
        'group relative flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border p-3 sm:p-5 text-left transition-all duration-300',
        'backdrop-blur-sm shadow-sm hover:shadow-md sm:hover:shadow-xl',
        isActive
          ? 'border-primary bg-primary/[0.03] ring-1 ring-primary shadow-primary/10'
          : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card'
      )}
    >
      <div
        className={cn(
          'flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl transition-all duration-300 group-hover:scale-105 sm:group-hover:scale-110',
          isActive 
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' 
            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "text-base sm:text-card-title font-bold tracking-tight transition-colors duration-300 truncate sm:whitespace-normal",
          isActive ? "text-primary" : "text-foreground group-hover:text-primary"
        )}>
          {title}
        </h3>
        <p className="mt-0.5 sm:mt-2 text-[13px] sm:text-caption-fluid leading-snug text-muted-foreground line-clamp-1 sm:line-clamp-2">
          {description}
        </p>
      </div>
      
      {/* Decorative indicator for active state */}
      {isActive && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -bottom-[1px] left-4 right-4 sm:left-6 sm:right-6 h-[3px] rounded-t-full bg-primary"
        />
      )}
    </motion.button>
  );
}
