import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Card({ children, title, subtitle, icon: Icon, className, headerAction, footer }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("card-premium flex flex-col", className)}
    >
      {(title || Icon) && (
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 rounded-2xl flex items-center justify-center">
                <Icon size={24} />
              </div>
            )}
            <div>
              {title && <h3 className="text-xl font-black tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div className="p-6 md:p-8 flex-1">
        {children}
      </div>

      {footer && (
        <div className="p-4 px-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 rounded-b-3xl">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
