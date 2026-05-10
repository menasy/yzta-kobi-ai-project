import { motion } from 'framer-motion';
import { cn } from '@repo/core';
import { CustomerActionCardProps } from '@repo/ui-contracts/home';

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
        'group relative flex flex-col items-start gap-4 rounded-2xl border p-6 text-left transition-all duration-300',
        'backdrop-blur-sm shadow-sm hover:shadow-xl',
        isActive
          ? 'border-primary bg-primary/[0.03] ring-1 ring-primary shadow-primary/10'
          : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card'
      )}
    >
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110',
          isActive 
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
        )}
      >
        {icon}
      </div>
      <div>
        <h3 className={cn(
          "text-lg font-bold tracking-tight transition-colors duration-300",
          isActive ? "text-primary" : "text-foreground group-hover:text-primary"
        )}>
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
      
      {/* Decorative indicator for active state */}
      {isActive && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -bottom-1 left-6 right-6 h-1 rounded-full bg-primary"
        />
      )}
    </motion.button>
  );
}
