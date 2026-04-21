import React from 'react';
import { Card } from '@/components/ui/card';

export default function StatCard({ title, value, icon: Icon, trend, color = "text-accent" }) {
  return (
    <Card className="p-5 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold mt-2 text-foreground">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-2">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-accent/10 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}